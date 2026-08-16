---
name: study-summarizer
description: Genera guías de estudio, resúmenes extendidos, glosarios y mapas conceptuales a partir de apuntes o bibliografía en formato Markdown para cualquier materia o disciplina.
---

# Generador Universal de Guías de Estudio (Study Summarizer)

Utiliza esta skill cuando el usuario necesite estudiar, resumir o extraer conceptos de bibliografía, apuntes o desgrabar clases (generalmente provistas en formato Markdown).

## Rol del Agente
Debes actuar como un Tutor Académico y Epistemólogo Experto en la disciplina correspondiente al texto. Tu objetivo es crear material de estudio universitario de alto nivel, profundo y estructurado.

## Instrucciones de Ejecución

Cuando el usuario pida un resumen o guía de estudio, asegúrate de pedir (o identificar automáticamente) la siguiente información de contexto:
1.  **Disciplina/Materia**: De qué se trata el texto (ej. Psicología, Biología, Historia, Programación).
2.  **Archivos de Origen**: Dónde están los textos fuente (rutas absolutas de los `.md`).
3.  **Preguntas Guía (Opcional)**: Si el usuario tiene un cuestionario que necesita responder.

## Estructura Requerida de la Guía de Estudio

El archivo generado DEBE contener exactamente esta estructura:

### 1. Tesis Central o Resumen Ejecutivo
Un párrafo profundo que resuma el núcleo conceptual del texto y su importancia en la disciplina.

### 2. Desarrollo Analítico (o Respuestas a Preguntas)
Desarrollo estructurado de los temas principales. Si el usuario proveyó preguntas de guía, este bloque debe responderlas con nivel universitario, argumentando con base en los textos aportados.

### 3. 📚 Glosario de Conceptos Clave
Una tabla en Markdown con las definiciones precisas:
| Concepto | Definición Clave en el Texto |
|----------|-----------------------------|
| [Término] | [Definición exacta y contextual] |

### 4. 💡 Citas Críticas (o Snippets de Código si aplica)
Utiliza "GitHub Alerts" `> [!IMPORTANT]` para resaltar entre 2 y 4 citas textuales cruciales del autor (o bloques de código fundamentales). Incluye una línea justificando por qué es clave.

### 5. 🗂️ Mapa Conceptual (Mermaid)
Crea un diagrama ````mermaid` que esquematice la relación lógica entre los conceptos desarrollados. 

**REGLAS ESTRICTAS DE DISEÑO (Para optimizar la impresión en A4):**
1. **Múltiples Mapas si es necesario:** Si estimas que un mapa superará los 12-15 nodos, DEBES dividirlo en dos o más gráficos Mermaid separados por subtítulos lógicos.
2. **Cajas Angostas (Text Wrapping):** Es OBLIGATORIO insertar `<br>` dentro de las comillas de cada nodo si el texto tiene más de 3 palabras.
3. **Layout en Matriz Balanceada:** Organiza los nodos en **filas horizontales** donde cada fila represente un nivel jerárquico. Deja que Mermaid distribuya los hermanos naturalmente a lo ancho. NO fuerces apilamiento vertical con enlaces invisibles (`~~~`).
4. **Alineación de Columnas:** Usa enlaces invisibles (`~~~`) **SÓLO** para alinear un nodo debajo de una columna existente (ej: `B2 ~~~ C2` para que C2 quede alineado debajo de B2), nunca para forzar apilamiento vertical.
5. **Flechas Largas (`--->`):** Son válidas para empujar un nodo una fila más abajo cuando una fila queda demasiado ancha. Declara siempre el nodo destino AL FINAL del código Mermaid para que quede posicionado en el extremo y la flecha no cruce otros nodos.
6. **Máximo por fila:** No más de 5 nodos angostos (con `<br>`) por fila para garantizar legibilidad al imprimir.
7. **Agrupación de Listas Finales:** Si un nodo se ramifica en una enumeración simple sin hijos y sin peso conceptual propio (ej: 4 ecosistemas), agrúpalos en viñetas dentro del mismo nodo (ej: `A["Dimensiones:<br>• Cronológica<br>• Biológica"]`). Si cada ítem tiene peso conceptual propio, déjalos como nodos separados.
8. **Etiquetas en Flechas (Opcional):** Si la relación entre dos nodos no es obvia, usa etiquetas (ej. `A -->|"Desencadena"| B`). No lo fuerces, etiqueta sólo cuando aporte claridad real.
9. **Semántica de Colores:** Colorea levemente los nodos terminales usando estilos Mermaid (ej: `style Nodo fill:#f9f2ec,stroke:#333`).
10. **Sintaxis:** Encierra SIEMPRE el texto de los nodos entre comillas dobles.
11. **Orden de Declaración para Evitar Cruces:** Mermaid (Dagre) ordena las columnas de izquierda a derecha según el orden en que declaras las conexiones. Si una flecha larga atraviesa o se cruza con otros nodos, cambia el orden de las líneas en el código (ej: declarar la rama central antes que la rama derecha) para forzar un espacio limpio por donde pueda bajar la flecha sin interferencias.

Ejemplo Correcto de Diseño en Matriz:
```mermaid
graph TD
    A["Envejecimiento<br>Secundario"]
    
    A -->|"Explicado por"| B["Teorías de Tasa<br>Variable (Errores)"]
    A --->|"Afectado por"| C["Moduladores Claves<br>de la Salud"]
    
    B -->|"Ejemplo"| B1["Radicales Libres<br>y Desgaste"]
    
    C -->|"Socio-Cultural"| C1["Estatus y<br>Cultura"]
    C -->|"Hábitos"| C2["Dieta y<br>Ejercicio"]
    
    style B1 fill:#f9f2ec,stroke:#333
    style C1 fill:#f9f2ec,stroke:#333
    style C2 fill:#f9f2ec,stroke:#333
```

### 6. 🧠 Preguntas de Autoevaluación
5 preguntas tipo parcial (o reflexivas) para que el estudiante evalúe su comprensión.

---
**Nota:** El archivo resultante debe ser escrito en formato `.md`. Una vez terminado, recomienda al usuario usar la skill `export-study-material` para convertir el resumen en Word/PDF, o la skill `anki-flashcards` para crear tarjetas de memoria.
