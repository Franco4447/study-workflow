# Study Workflow Plugin

Un ecosistema de herramientas (Skills y Scripts) para Antigravity diseñado para automatizar y optimizar el flujo de estudio universitario. 

## Estructura del Repositorio

- **`skills/`**: Contiene las instrucciones (`SKILL.md`) que los agentes utilizan para ejecutar tareas específicas.
  - `pdf-to-markdown`: Convierte bibliografía a texto plano.
  - `study-summarizer`: Genera resúmenes estructurados de nivel universitario.
  - `export-study-material`: Compila los markdowns a documentos Word/PDF.
  - `anki-flashcards`: Extrae conceptos y genera CSVs para Anki.
  - `interactive-evaluation`: Simula parciales para repasar.
- **`scripts/`**: Scripts técnicos que las skills invocan por detrás.
  - `extract_pdf.py`: Wrapper para extraer texto de PDFs.
  - `compile_docs.js`: Wrapper de Pandoc y Kroki (para Mermaid).
- **`resources/`**: Archivos estáticos como plantillas institucionales (`_plantilla.docx`).

## Instalación

Este repositorio está configurado como un Plugin global de Antigravity. Al estar ubicado en `~/.gemini/config/plugins/study-workflow/`, todas sus skills están disponibles globalmente en cualquier proyecto o carpeta.

## Dependencias

Para que los scripts funcionen correctamente, tu entorno debe contar con:
- **Node.js** (para `compile_docs.js`)
- **Python 3** (para `extract_pdf.py` y MinerU)
- **Pandoc** (para la conversión a Word/PDF)
- Librerías Python: `pdfplumber`
