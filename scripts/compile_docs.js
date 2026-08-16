const fs = require('fs');
const zlib = require('zlib');
const path = require('path');
const { execSync } = require('child_process');

function encodeKroki(text) {
    const data = Buffer.from(text, 'utf8');
    const compressed = zlib.deflateSync(data);
    return compressed.toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

function processMarkdown(content) {
    // 1. Fix Pandoc Math issue (Lacanian divided subject $)
    let processed = content.replace(/(?<!\\)\$/g, '\\$');

    // 2. Fix Mermaid blocks
    processed = processed.replace(/```mermaid([\s\S]*?)```/g, (match, mermaidCode) => {
        let cleanCode = mermaidCode.trim();
        
        // Normalize nodes to rectangles with quotes: id["Text"]
        cleanCode = cleanCode.replace(/([A-Z0-9]+)\(\((.+?)\)\)/g, (m, p1, p2) => `${p1}["${p2.replace(/"/g, "'")}"]`);
        cleanCode = cleanCode.replace(/([A-Z0-9]+)\[\((.+?)\)\]/g, (m, p1, p2) => `${p1}["${p2.replace(/"/g, "'")}"]`);
        cleanCode = cleanCode.replace(/([A-Z0-9]+)\(\[(.+?)\]\)/g, (m, p1, p2) => `${p1}["${p2.replace(/"/g, "'")}"]`);
        cleanCode = cleanCode.replace(/([A-Z0-9]+)\{(.+?)\}/g, (m, p1, p2) => `${p1}["${p2.replace(/"/g, "'")}"]`);
        cleanCode = cleanCode.replace(/([A-Z0-9]+)\((.+?)\)/g, (m, p1, p2) => `${p1}["${p2.replace(/"/g, "'")}"]`);
        cleanCode = cleanCode.replace(/([A-Z0-9]+)\[(.+?)\]/g, (m, p1, p2) => {
            if (p2.startsWith('"') && p2.endsWith('"')) return m;
            return `${p1}["${p2.replace(/"/g, "'")}"]`;
        });
        
        // Fix edges
        cleanCode = cleanCode.replace(/-->\|(.+?)\|/g, (m, p1) => {
            if (p1.startsWith('"') && p1.endsWith('"')) return m;
            return `-->|"${p1.replace(/"/g, "'")}"|`;
        });
        
        // Remove crash-prone symbols
        cleanCode = cleanCode.replace(/◊/g, 'rombo');
        cleanCode = cleanCode.replace(/\$/g, 'S');

        const payload = encodeKroki(cleanCode);
        const url = `https://kroki.io/mermaid/png/${payload}`;
        return `![Mapa Conceptual](${url})`;
    });

    // 3. Fix GitHub Alerts for Pandoc
    processed = processed.replace(/>\s*\[!(IMPORTANT|NOTE|WARNING|TIP|CAUTION)\]/gi, (match, p1) => {
        const translation = {
            'IMPORTANT': 'Importante',
            'NOTE': 'Nota',
            'WARNING': 'Advertencia',
            'TIP': 'Consejo',
            'CAUTION': 'Precaución'
        };
        const title = translation[p1.toUpperCase()] || p1;
        return `> **${title}:**`;
    });

    return processed;
}

function main() {
    const args = process.argv.slice(2);
    let inputPath = null;
    let outputPath = null;
    let referenceDoc = null;
    let engine = 'word'; // 'word' o 'latex'

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--in' && args[i+1]) inputPath = args[++i];
        if (args[i] === '--out' && args[i+1]) outputPath = args[++i];
        if (args[i] === '--ref' && args[i+1]) referenceDoc = args[++i];
        if (args[i] === '--engine' && args[i+1]) engine = args[++i].toLowerCase();
    }

    if (!inputPath || !outputPath) {
        console.error("Uso: node compile_docs.js --in <archivo_o_directorio> --out <archivo_salida> [--ref <plantilla.docx>] [--engine word|latex]");
        process.exit(1);
    }

    const inputStat = fs.statSync(inputPath);
    let combinedContent = "";

    if (inputStat.isDirectory()) {
        const files = fs.readdirSync(inputPath).filter(f => f.endsWith('.md')).sort();
        for (const file of files) {
            const filePath = path.join(inputPath, file);
            combinedContent += fs.readFileSync(filePath, 'utf8') + "\n\n---\n\n";
        }
    } else {
        combinedContent = fs.readFileSync(inputPath, 'utf8');
    }

    const processedContent = processMarkdown(combinedContent);
    const tempMdPath = outputPath + ".temp.md";
    fs.writeFileSync(tempMdPath, processedContent, 'utf8');

    console.log(`Compilando documento a ${outputPath} [Engine: ${engine}]...`);
    try {
        let isPdf = outputPath.toLowerCase().endsWith('.pdf');
        
        if (isPdf && engine === 'latex') {
            console.log("Generando PDF académico nativo con MiKTeX (pdflatex)...");
            let pandocCmd = `pandoc "${tempMdPath}" -o "${outputPath}" --pdf-engine=pdflatex`;
            execSync(pandocCmd, { stdio: 'inherit' });
        } else {
            let pandocOut = isPdf ? outputPath.replace(/\.pdf$/i, '.docx') : outputPath;

            let pandocCmd = `pandoc "${tempMdPath}" -f gfm -o "${pandocOut}"`;
            if (referenceDoc && fs.existsSync(referenceDoc)) {
                pandocCmd += ` --reference-doc="${referenceDoc}"`;
            }
            execSync(pandocCmd, { stdio: 'inherit' });

            console.log("Aplicando formato avanzado en Word (Márgenes Estrechos y Texto Justificado)...");
            const absolutePandocOut = path.resolve(pandocOut);
            const absoluteOutputPath = path.resolve(outputPath);
            let psScript = `
param([string]$InFile, [string]$OutFile, [string]$IsPdf)
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$doc = $word.Documents.Open($InFile)
$doc.PageSetup.TopMargin = 36
$doc.PageSetup.BottomMargin = 36
$doc.PageSetup.LeftMargin = 36
$doc.PageSetup.RightMargin = 36
foreach ($para in $doc.Paragraphs) {
    $para.Alignment = 3
}

# Resize images: scale small ones up to 80% page width, shrink oversized to fit, center all
$pageWidth = $doc.PageSetup.PageWidth - $doc.PageSetup.LeftMargin - $doc.PageSetup.RightMargin
$targetMin = $pageWidth * 0.8
foreach ($shape in $doc.InlineShapes) {
    if ($shape.Width -gt 0 -and $shape.Height -gt 0) {
        if ($shape.Width -lt $targetMin) {
            $ratio = $targetMin / $shape.Width
            $shape.Width = $targetMin
            $shape.Height = $shape.Height * $ratio
        } elseif ($shape.Width -gt $pageWidth) {
            $ratio = $pageWidth / $shape.Width
            $shape.Width = $pageWidth
            $shape.Height = $shape.Height * $ratio
        }
        $shape.Range.ParagraphFormat.Alignment = 1
    }
}

# Style tables: clear all borders, add thin bottom border to all rows, thick double bottom border to header
foreach ($table in $doc.Tables) {
    $table.Borders.Enable = 0
    foreach ($row in $table.Rows) {
        $row.Borders.Item(-3).LineStyle = 1
        $row.Borders.Item(-3).LineWidth = 4
    }
    # Thick double border and bold text for the first row (header)
    if ($table.Rows.Count -gt 0) {
        $table.Rows.Item(1).Borders.Item(-3).LineStyle = 7
        $table.Rows.Item(1).Borders.Item(-3).LineWidth = 12
        $table.Rows.Item(1).Range.Font.Bold = 1
    }
}

if ($IsPdf -eq '1') {
    Write-Host "Guardando como PDF..."
    $doc.SaveAs([ref]$OutFile, [ref]17)
} else {
    Write-Host "Guardando DOCX con nuevo formato..."
    $doc.Save()
}

$doc.Close(0)
$word.Quit()
`;
            
            const psFile = tempMdPath + ".ps1";
            // Add UTF-8 BOM so PowerShell reads accents correctly
            fs.writeFileSync(psFile, '\ufeff' + psScript, 'utf8');
            
            const isPdfStr = isPdf ? '1' : '0';
            // Use execSync with powershell passing arguments
            const psCmd = `powershell -ExecutionPolicy Bypass -File "${psFile}" -InFile "${absolutePandocOut}" -OutFile "${absoluteOutputPath}" -IsPdf ${isPdfStr}`;
            execSync(psCmd, { stdio: 'inherit' });
            
            fs.unlinkSync(psFile);

            if (isPdf) {
                fs.unlinkSync(pandocOut);
            }
        }

        console.log("¡Compilación exitosa!");
    } catch (e) {
        console.error("Error al compilar:", e.message);
        process.exit(1);
    } finally {
        if (fs.existsSync(tempMdPath)) fs.unlinkSync(tempMdPath);
    }
}

main();
