const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
let outFile = '';
const inFiles = [];

for (let i = 0; i < args.length; i++) {
    if (args[i] === '--out' && args[i+1]) {
        outFile = args[++i];
    } else {
        inFiles.push(args[i]);
    }
}

if (!outFile || inFiles.length === 0) {
    console.error("Uso: node consolidate_notes.js --out <archivo_salida.md> <archivo_entrada_1.md> <archivo_entrada_2.md> ...");
    process.exit(1);
}

let finalContent = '';

for (const file of inFiles) {
    const filePath = path.resolve(file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Limpieza 1: Eliminar BOM (Byte Order Mark) si existe
        if (content.charCodeAt(0) === 0xFEFF) {
            content = content.slice(1);
        }
        
        // Limpieza 2: Eliminar espacios invisibles al inicio de las lineas
        content = content.replace(/^[\u200B\u200C\u200D\u200E\u200F\uFEFF]+/gm, '');
        
        // Limpieza 3: Corregir glitcheos de subtitulos (ej: 4### -> ####)
        content = content.replace(/^[0-9]+(#+)/gm, "$1");
        
        // Asegurar separacion
        finalContent += content + '\n\n';
    } else {
        console.warn("Advertencia: No se encontro el archivo ${filePath}");
    }
}

fs.writeFileSync(path.resolve(outFile), finalContent, 'utf8');
console.log("Consolidacion exitosa en: ${outFile}");
