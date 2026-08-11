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

### 2. Qué hace este script mágicamente
1. Soluciona el renderizado de símbolos matemáticos conflictivos para Pandoc (ej. el símbolo `$` de Lacan).
2. Convierte todos los mapas conceptuales de texto (Mermaid) en imágenes PNG descargadas de internet vía Kroki, y las incrusta en el documento.
3. Llama silenciosamente a Pandoc para generar el Word/PDF final y borra los archivos temporales.

### 3. Ejecución

Siempre debes ejecutar este script usando el intérprete de Node del sistema. Por ejemplo:
```powershell
node "C:\Users\Fmendezcasariego\.gemini\config\plugins\study-workflow\scripts\compile_docs.js" --in "C:\Ruta\Al\compendio" --out "C:\Ruta\Al\resumen_final.docx" --ref "C:\Users\Fmendezcasariego\.gemini\config\plugins\study-workflow\resources\_plantilla.docx"
```

### 4. Flujo

- Revisa que Pandoc esté instalado si hay algún error.
- Proporciona al usuario un enlace cliqueable al documento generado para que pueda abrirlo.
