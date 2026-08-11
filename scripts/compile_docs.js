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

    return processed;
}

function main() {
    const args = process.argv.slice(2);
    let inputPath = null;
    let outputPath = null;
    let referenceDoc = null;

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--in' && args[i+1]) inputPath = args[++i];
        if (args[i] === '--out' && args[i+1]) outputPath = args[++i];
        if (args[i] === '--ref' && args[i+1]) referenceDoc = args[++i];
    }

    if (!inputPath || !outputPath) {
        console.error("Uso: node compile_docs.js --in <archivo_o_directorio> --out <archivo_salida> [--ref <plantilla.docx>]");
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

    console.log(`Compilando documento a ${outputPath}...`);
    try {
        let pandocCmd = `pandoc "${tempMdPath}" -o "${outputPath}"`;
        if (referenceDoc && fs.existsSync(referenceDoc)) {
            pandocCmd += ` --reference-doc="${referenceDoc}"`;
        }
        execSync(pandocCmd, { stdio: 'inherit' });
        console.log("¡Compilación exitosa!");
    } catch (e) {
        console.error("Error al ejecutar Pandoc:", e.message);
        process.exit(1);
    } finally {
        if (fs.existsSync(tempMdPath)) fs.unlinkSync(tempMdPath);
    }
}

main();
