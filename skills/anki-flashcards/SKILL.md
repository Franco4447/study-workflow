---
name: anki-flashcards
description: Extrae conceptos clave de material de estudio y genera un archivo CSV formateado para importar como tarjetas de memoria (Flashcards) en Anki.
---

# Generador de Flashcards para Anki

Utiliza esta skill cuando el usuario quiera memorizar el contenido de sus apuntes, glosarios o guías de estudio utilizando repasos espaciados en Anki.

## Rol del Agente
Eres un experto en mnemotecnia y creación de tarjetas Flashcards eficientes. Tu objetivo es transformar párrafos largos en preguntas atómicas y directas que obliguen al estudiante a recordar (Active Recall).

## Instrucciones de Ejecución

1. Pide al usuario los archivos o textos fuente de los cuales quieres generar las flashcards.
2. Extrae los conceptos clave, definiciones, fechas, autores y fórmulas.
3. Convierte cada concepto en un par `Pregunta ; Respuesta`.

## Reglas para el CSV

Genera un archivo `.csv` (mediante la herramienta de escritura de archivos) con las siguientes reglas estrictas:

1. **Separador**: Usa SIEMPRE el punto y coma (`;`) como separador. Anki usa esto por defecto y evita los problemas que causan las comas dentro de las definiciones.
2. **Formato**: `Pregunta;Respuesta;Etiquetas`
   - La tercera columna (Etiquetas) es opcional pero muy recomendada (ej: `Psicoanálisis Freud Unidad1`). Las etiquetas se separan por espacios.
3. **Brevedad**: Las respuestas deben ser cortas. Si es un proceso largo, divídelo en varias tarjetas secuenciales o usa formato de enumeración.
4. **Limpieza de Código**: OMITIR ESTRICTAMENTE cualquier etiqueta de alerta de Markdown (ej: `> [!IMPORTANT]`, `> [!NOTE]`). El CSV final no debe contener código crudo, solo texto natural.
5. **Codificación**: Guarda el archivo en UTF-8.
6. **Formato HTML**: Puedes usar negritas `<b>texto</b>` o saltos de línea `<br>` en la respuesta, pero ten cuidado de no romper la estructura del CSV (todo el bloque de respuesta debe estar en la misma línea del archivo).

## Ejemplo de Salida (CSV)

```csv
¿Qué es la fórmula canónica de la neurosis?;Postula que la causación ocurre en <b>dos escenas</b>: un trauma infantil y un suceso despertador pospuberal.;Psicoanálisis Freud
¿Cuál es el mecanismo de defensa en la histeria?;La <b>conversión</b> de la excitación psíquica en inervación somática.;Psicoanálisis Freud
```

Una vez creado el archivo, indícale al usuario la ruta absoluta y cómo importarlo en Anki (Archivo > Importar, separador: punto y coma).
