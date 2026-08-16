---
name: export-study-material
description: Compila un conjunto de resúmenes en Markdown en un documento Word (.docx) formateado o PDF, procesando mapas conceptuales (Mermaid) y símbolos matemáticos.
---

# Exportador de Material de Estudio

Utiliza esta skill cuando el usuario quiera compilar sus apuntes y resúmenes de estudio en un archivo final listo para leer, imprimir o compartir (Word o PDF).

## Instrucciones de Uso

Para compilar los documentos, debes ejecutar el script de Node.js incluido en este plugin:
`C:\Users\Fmendezcasariego\.gemini\config\plugins\study-workflow\scripts\compile_docs.js`

### 1. Parámetros del Script

El script acepta los siguientes argumentos:
- `--in`: (Requerido) Ruta absoluta al archivo Markdown (.md) individual o a un directorio que contenga múltiples archivos `.md`. Si le pasas un directorio, el script concatenará todos los archivos en orden alfabético.
- `--out`: (Requerido) Ruta absoluta al archivo final deseado (ej. `C:\Ruta\resumen_final.docx`).
- `--ref`: (Opcional) Ruta absoluta a una plantilla `.docx` de referencia para Pandoc. Esto aplica estilos personalizados. Si el usuario la solicita, puedes buscarla en `C:\Users\Fmendezcasariego\.gemini\config\plugins\study-workflow\resources\_plantilla.docx`.
- `--engine`: (Opcional) Define el motor de renderizado PDF. Puede ser `word` (por defecto, usa automatización nativa de Windows) o `latex` (usa MiKTeX para generar un PDF de calidad académica rigurosa).

### 2. Qué hace este script mágicamente
1. Soluciona el renderizado de símbolos matemáticos conflictivos para Pandoc (ej. el símbolo `$` de Lacan).
2. Convierte todos los mapas conceptuales de texto (Mermaid) en imágenes PNG descargadas de internet vía Kroki, y las incrusta en el documento.
3. Si el usuario solicita un documento `.docx`, llama silenciosamente a Pandoc para generarlo.
4. Si el usuario solicita un `.pdf` (con `--engine word` o por defecto), el script genera el documento en Word por detrás y utiliza la automatización nativa de Windows (PowerShell) para convertirlo a PDF de forma idéntica y libre de errores tipográficos.
5. Si el usuario solicita un `.pdf` (con `--engine latex`), el script llama directamente al motor de LaTeX (MiKTeX/pdflatex) para producir un PDF de calidad científica o matemática rigurosa.

### 3. Ejecución

Siempre debes ejecutar este script usando el intérprete de Node del sistema. Por ejemplo, para un documento diario:
```powershell
node "C:\Users\Fmendezcasariego\.gemini\config\plugins\study-workflow\scripts\compile_docs.js" --in "C:\Ruta\Al\compendio" --out "C:\Ruta\Al\resumen_final.pdf"
```

Para un documento con rigor académico/científico (ej. paper/tesis):
```powershell
node "C:\Users\Fmendezcasariego\.gemini\config\plugins\study-workflow\scripts\compile_docs.js" --in "C:\Ruta\Al\paper" --out "C:\Ruta\Al\paper_academico.pdf" --engine latex
```

### 4. Flujo y Validación de Compilación

- **Pre-limpieza (Crucial):** Antes de llamar a este script de compilación (o si unes documentos masivos), utiliza el script `scripts/consolidate_notes.js` para purgar caracteres invisibles (BOM) y glitcheos que puedan romper a Pandoc.
- **Robustez de Rutas:** Asegúrate siempre de envolver las rutas con comillas en los comandos de PowerShell y usar secuencias de escape si hay caracteres conflictivos.
- **Manejo de Errores:** Revisa que Pandoc esté instalado si hay algún error (stdout/stderr). Si el proceso de Word se bloquea por permisos (ej. documento abierto), pídele al usuario que lo cierre o utiliza un nombre de archivo alternativo.
- **Validación:** Verifica que el tamaño del archivo resultante no sea 0 bytes antes de notificar éxito.
- Proporciona al usuario un enlace cliqueable al documento generado para que pueda abrirlo.
