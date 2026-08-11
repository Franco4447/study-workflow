---
name: pdf-to-markdown
description: Convierte archivos PDF a formato Markdown para facilitar el procesamiento por parte de agentes, utilizando herramientas como MinerU o pdfplumber.
---

# PDF to Markdown Extractor

Utiliza esta skill cuando el usuario necesite digitalizar bibliografía o apuntes en formato PDF para poder estudiarlos, resumirlos o procesarlos.

## Instrucciones de Uso

Para extraer PDFs, debes utilizar el script de Python incluido en este plugin:
`C:\Users\Fmendezcasariego\.gemini\config\plugins\study-workflow\scripts\extract_pdf.py`

### 1. Parámetros del Script

El script acepta los siguientes argumentos:
- `--input` o `-i`: (Requerido) Ruta absoluta al archivo PDF o al directorio que contiene los PDFs.
- `--outdir` o `-o`: (Requerido) Ruta absoluta al directorio donde se guardarán los archivos Markdown generados.
- `--engine` o `-e`: (Opcional) El motor de extracción a usar. Puede ser `mineru` (por defecto) o `pdfplumber`. Si MinerU falla, el script intentará automáticamente usar `pdfplumber`.

### 2. Ejecución

Siempre debes ejecutar este script usando el intérprete de Python del sistema. Por ejemplo:
```powershell
python "C:\Users\Fmendezcasariego\.gemini\config\plugins\study-workflow\scripts\extract_pdf.py" --input "C:\Ruta\Al\Archivo.pdf" --outdir "C:\Ruta\Al\Destino"
```

### 3. Consideraciones Adicionales

1. Si el usuario te proporciona un directorio, revisa si la carpeta de destino existe. Si no, el script la creará automáticamente.
2. Avisa al usuario que el proceso puede tomar algunos segundos o minutos dependiendo de la cantidad y tamaño de los PDFs.
3. Una vez finalizada la extracción, informa al usuario qué archivos se generaron y ofrécele continuar con la skill `study-summarizer` para resumirlos.
