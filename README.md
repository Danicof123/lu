# LU (Layer Understanding)

**LU** es un framework modular y liviano diseñado para aprovechar el potencial de los modelos de lenguaje (LLMs) manteniendo el control total sobre las conversaciones en chatbots. Utiliza la comprensión semántica avanzada de los LLMs para generar interacciones naturales y humanas, evitando que el diálogo se desvíe del propósito definido.

> **Nota**: Aunque el desarrollo del proyecto continúa bajo el nombre **LU**, el paquete publicado en npm se llama `ludmi` debido a un conflicto de nombres con otro paquete existente.

## Objetivo

En el contexto actual de la inteligencia artificial, los chatbots tienden a desviarse del tema cuando operan con libertad total. **LU** nace para resolver este desafío, combinando lo mejor del entendimiento conversacional con estructuras de control precisas:

- **Controlar la conversación**: Aprovecha la comprensión semántica de los LLMs para guiar y limitar las respuestas del chatbot de manera inteligente.

- **Simular libertad**: Ofrece interacciones fluidas y naturales sin perder el control del flujo conversacional.

- **Ejecutar acciones personalizadas**: Permite ejecutar acciones específicas definidas por el desarrollador según el tema clasificado.

- **Enriquecer las respuestas**: Integra conocimiento externo desde bases de datos u otras fuentes para generar respuestas con información precisa y contextual.

## Características

### Comprensión y control del diálogo
LU mantiene el foco conversacional mediante un sistema de clasificación inteligente que analiza cada mensaje del usuario y determina el tópico principal. Esta comprensión semántica permite guiar las respuestas, orquestar acciones personalizadas y asegurar que el chatbot actúe con coherencia según el contexto establecido.

### Gestión de contexto y memoria
LU conserva el historial completo de la conversación para mantener la coherencia entre turnos, adaptando las respuestas a lo que ya se ha discutido e integrando información del contexto cuando sea necesario para una experiencia conversacional fluida.

### Integración con OpenAI
Permite generar respuestas naturales y obtener embeddings semánticos de texto utilizando los modelos de OpenAI. Esta integración es clave para la recuperación inteligente de información y la clasificación precisa de temas conversacionales.

### Recuperación inteligente de conocimiento (Retriever + RAG)
LU puede recuperar fragmentos relevantes desde una base de conocimiento especializada para luego combinar estos datos con el mensaje del usuario y el historial conversacional, generando respuestas enriquecidas y fundamentadas en información específica.

### Construcción de bases de conocimiento embebidas
LU proporciona herramientas para generar bases de conocimiento personalizadas con embeddings semánticos:

- **`knowledgeBaseByText`**: Divide textos largos en fragmentos con solapamiento inteligente y calcula su representación semántica para recuperación eficiente.

- **`knowledgeBaseByJSON`**: Procesa estructuras JSON complejas, concatena el contenido de los elementos y los transforma en fragmentos embebidos listos para recuperación contextual.

## Uso básico

### Importación

Para comenzar a usar LU, importa la función principal `orchestrator`:

```javascript
const { orchestrator } = require("ludmi");

const response = await orchestrator({
  metadata,
  topics,
  input,
  userData,
  history,
  sizeHistory,
  actions
});
```

### El Orquestador

El **orquestador** es el núcleo de LU que coordina todo el flujo conversacional. Analiza la entrada del usuario, clasifica el tópico, gestiona el historial y ejecuta acciones específicas según el contexto.

**Parámetros principales:**
- `topics`: JSON con los tópicos para clasificar la entrada del usuario
- `input`: El mensaje del usuario (string)
- `history`: Historial de mensajes de la conversación
- `sizeHistory`: Tamaño máximo del historial a considerar
- `userData`: Variables y datos del usuario
- `metadata`: Contexto adicional (ej: año actual, configuraciones)
- `actions`: Acciones a ejecutar según el tópico clasificado

**Lo que devuelve:**
- `topic`: El tópico clasificado
- `revised_prompt`: Entrada enriquecida con contexto
- `price`: Costo de la operación en USD
- Historial y datos actualizados

### Enriquecimiento contextual

LU enriquece automáticamente la entrada del usuario combinándola con el historial conversacional y la metadata disponible, generando un `revised_prompt` que incluye contexto relevante para mejorar la comprensión y calidad de la respuesta.

## Guía paso a paso: Creando tu primer bot

Vamos a crear **Tomy**, un bot verdulero que te ayude a entender cómo integrar LU en tu proyecto.

### Paso 1: Instalación

```bash
npm install ludmi
```

### Paso 2: Configuración de OpenAI

Crea un archivo `.env` en la raíz de tu proyecto con tus credenciales de OpenAI:

```env
OPENAI_API_KEY=sk-abc123def
OPENAI_ORGANIZATION=org-456ghi789
```

### Paso 3: Definir los tópicos

Crea un archivo `topics.json` con los temas que tu bot puede manejar:

```json
[
  {
    "name": "Comienzo",
    "description": "El usuario saluda con el objetivo de iniciar una conversación. Ejemplo: 'Hola'."
  },
  {
    "name": "Cierre",
    "description": "El usuario saluda con el objetivo de terminar una conversación. Ejemplo: 'Chau', 'Muchas gracias por todo', etc."
  },
  {
    "name": "Consulta_Producto",
    "description": "El usuario pregunta sobre verduras, frutas, precios o disponibilidad. Ejemplo: '¿Tienen tomates?', '¿Cuánto cuesta la lechuga?'."
  },
  {
    "name": "Pedido",
    "description": "El usuario quiere realizar un pedido o compra. Ejemplo: 'Quiero comprar 2 kilos de papas'."
  }
]
```

### Paso 4: Implementación básica

```javascript
import { orchestrator } from 'ludmi';
import topics from './topics.json';

const response = await orchestrator({
  history,
  input,
  sizeHistory: 5,
  topics,
  userData,
  actions: {},
  metadata: {
    currentYear: Date.now(),
    mainTheme: "Soy Tomy, un asistente especializado en venta de verduras y frutas frescas."
  }
});
```

### Estructura del historial

El historial debe seguir este formato:

```javascript
const history = [
  {
    role: "assistant",
    content: "¡Hola! Soy Tomy, tu verdulero virtual. ¿En qué puedo ayudarte?"
  },
  {
    role: "user", 
    content: "¿Tienen tomates frescos?"
  }
];
```

### Respuesta del orquestador

LU devuelve una respuesta estructurada con toda la información procesada:

```json
{
  "price": {
    "unit": "USD",
    "value": 0.000080925
  },
  "data": {
    "topic": "Consulta_Producto",
    "input": "tienen tomates frescos?",
    "revised_prompt": "¿Tienen tomates frescos disponibles para la venta?",
    "history": [
      {
        "role": "assistant",
        "content": "¡Hola! Soy Tomy, tu verdulero virtual. ¿En qué puedo ayudarte?"
      },
      {
        "role": "user",
        "content": "tienen tomates frescos?"
      }
    ],
    "userData": {}
  }
}
```

### Elementos clave de la respuesta

- **`topic`**: Tópico clasificado automáticamente por LU
- **`revised_prompt`**: Versión mejorada de la entrada del usuario
- **`price`**: Costo de la operación para control de gastos
- **`history`**: Historial actualizado de la conversación

Con estos pasos básicos ya tienes a Tomy funcionando y clasificando las intenciones de tus usuarios. En las siguientes secciones veremos cómo añadir acciones personalizadas y bases de conocimiento.

## Acciones personalizadas

Las **acciones** te permiten ejecutar lógica específica cuando se clasifica un tópico determinado. Son ideales para crear subcategorizaciones o ejecutar procesos personalizados.

### Ejemplo: Consultas sobre productos

Supongamos que Tomy recibe muchas consultas sobre productos que requieren clasificación más específica. Podemos crear una acción para el tópico "Consulta_Producto":

```javascript
import { orchestrator } from 'ludmi';

const response = await orchestrator({
  history,
  input,
  sizeHistory: 5,
  topics,
  userData,
  actions: {
    "Consulta_Producto": consultaProductoAction
  },
  metadata: {
    currentYear: Date.now(),
    mainTheme: "Soy Tomy, especialista en verduras y frutas frescas de temporada."
  }
});
```

### Implementando la acción

```javascript
import { classifier } from 'ludmi';

export const consultaProductoAction = async ({ input, revised_prompt, userData, history }) => {
  
  // Segunda capa de clasificación para productos específicos
  const respClassifier = await classifier({
    input: revised_prompt,
    topics: [
      {
        name: "precios",
        description: "El usuario pregunta sobre precios de productos. Ejemplo: '¿Cuánto cuesta?', '¿Qué precio tiene?'"
      },
      {
        name: "disponibilidad", 
        description: "El usuario pregunta si hay stock o disponibilidad. Ejemplo: '¿Tienen tomates?', '¿Hay lechuga?'"
      },
      {
        name: "calidad",
        description: "El usuario pregunta sobre frescura, calidad o estado de los productos. Ejemplo: '¿Están frescos?', '¿Son orgánicos?'"
      },
      {
        name: "temporada",
        description: "El usuario pregunta sobre productos de temporada. Ejemplo: '¿Qué verduras hay ahora?', '¿Qué está en temporada?'"
      }
    ]
  });

  return {
    price: respClassifier.price,
    eval: {
      subtopic: respClassifier.topic,
      category: "producto"
    }
  };
};
```

### Cómo funcionan las acciones

1. **Ejecución automática**: Cuando el orquestador clasifica un tópico que tiene una acción asociada, la ejecuta automáticamente.

2. **Lógica personalizada**: Dentro de la acción puedes implementar cualquier lógica:
   - Subclasificaciones (como en el ejemplo)
   - Llamadas a APIs externas
   - Consultas a bases de datos
   - Validaciones específicas

3. **Información adicional**: Todo lo que devuelvas en `eval` se incluye en la respuesta final del orquestador.

4. **Control de costos**: Los precios de las acciones se suman al costo total de la operación.

### Respuesta con acción ejecutada

```json
{
  "price": {
    "unit": "USD", 
    "value": 0.00013065
  },
  "data": {
    "history": [
      {
        "role": "assistant",
        "content": "¡Hola! Soy Tomy, tu verdulero virtual."
      },
      {
        "role": "user",
        "content": "¿Tienen tomates frescos?"
      }
    ],
    "input": "¿Tienen tomates frescos?",
    "revised_prompt": "¿Tienen tomates frescos disponibles?",
    "topic": "Consulta_Producto", 
    "userData": {},
    "eval": {
      "subtopic": "disponibilidad",
      "category": "producto"
    }
  }
}
```

### Ventajas de las acciones

- **Clasificación multinivel**: Crea jerarquías de tópicos para mayor precisión
- **Flexibilidad total**: Ejecuta cualquier lógica personalizada
- **Integración externa**: Conecta con APIs, bases de datos o servicios externos
- **Información enriquecida**: Añade contexto adicional a las respuestas
- **Control granular**: Gestiona diferentes flujos según el contexto específico

Con las acciones, Tomy puede manejar consultas complejas y proporcionar respuestas mucho más precisas y contextuales.

## Generación de respuestas automáticas

Además de clasificar tópicos para que tu frontend decida qué mostrar, **LU puede generar respuestas automáticamente** usando inteligencia artificial. Esto es ideal para manejar consultas complejas o casos especiales.

### Configurando respuestas automáticas

Vamos a crear una acción que genere respuestas automáticas cuando Tomy no pueda categorizar bien una consulta:

```javascript
import { orchestrator } from 'ludmi';

const response = await orchestrator({
  history,
  input,
  sizeHistory: 5,
  topics,
  userData,
  actions: {
    "Consulta_Producto": consultaProductoAction,
    "Consulta_General": consultaGeneralAction  // Nueva acción con IA
  },
  metadata: {
    currentYear: Date.now(),
    mainTheme: "Soy Tomy, especialista en verduras y frutas frescas."
  }
});
```

### Implementando respuesta automática

```javascript
import { getAIResponse } from 'ludmi';

export const consultaGeneralAction = async ({ input, revised_prompt, userData, history }) => {

  const developerInstruction = `Eres Tomy, un verdulero experto que conoce todo sobre:
- Verduras y frutas frescas de temporada
- Precios actuales del mercado
- Consejos de conservación y preparación
- Recetas simples con ingredientes frescos
- Diferencias entre productos orgánicos y convencionales

Información del negocio:
- Horarios: Lunes a Sábado de 8:00 a 20:00
- Delivery disponible en zona norte
- Productos orgánicos certificados disponibles
- Especialidad en verduras de hoja y frutas de estación

# Personalidad de Tomy
- Amigable y cercano, como un verdulero de barrio
- Conocimiento profundo pero explicado de manera simple
- Siempre dispuesto a dar consejos prácticos
- Usa un lenguaje coloquial pero profesional
- Incluye recomendaciones personalizadas

# Reglas
- Si la consulta no está relacionada con verduras, frutas o el negocio, redirige amablemente
- Siempre sugiere productos frescos y de temporada
- Menciona beneficios nutricionales cuando sea relevante
- Ofrece alternativas si algo no está disponible
`;

  const messages = [
    {
      role: "developer", 
      content: developerInstruction
    },
    {
      role: "user",
      content: revised_prompt
    }
  ];

  // Generar respuesta automática con IA
  const { content, price } = await getAIResponse({
    messages,
    model: "gpt-4o-mini",
    temperature: 0.7
  });

  return {
    price: price,
    eval: {
      topic: "consulta_general",
      content,
      generated: true
    }
  };
};
```

### Respuesta con contenido generado

```json
{
  "price": {
    "unit": "USD",
    "value": 0.00025430
  },
  "data": {
    "history": [
      {
        "role": "assistant", 
        "content": "¡Hola! Soy Tomy, tu verdulero de confianza."
      },
      {
        "role": "user",
        "content": "¿Qué me recomendás para hacer una ensalada fresca?"
      }
    ],
    "input": "¿Qué me recomendás para hacer una ensalada fresca?",
    "revised_prompt": "¿Qué me recomendás para hacer una ensalada fresca y nutritiva?",
    "topic": "Consulta_General",
    "userData": {},
    "eval": {
      "topic": "consulta_general",
      "content": "¡Excelente pregunta! Para una ensalada fresca te recomiendo:\n\n**Base verde**: Lechuga mantecosa o rúcula (están perfectas ahora)\n**Colores**: Tomate cherry, zanahoria rallada y pimiento rojo\n**Frescura**: Pepino y apio para el crunch\n**Toque especial**: Palta madura y unos brotes de alfalfa\n\n💡 **Tip del día**: La rúcula que tengo hoy está súper fresca, le va a dar un sabor increíble a tu ensalada. ¡Y la palta está en su punto justo!\n\n¿Querés que te arme un combo con todo esto?",
      "generated": true
    }
  }
}
```

### Función auxiliar: JSONparse

LU incluye una utilidad especial para parsear respuestas JSON de LLMs:

```javascript
import { JSONparse } from 'ludmi';

// Los LLMs a veces devuelven JSON envuelto en markdown
const llmResponse = "```json\n{\"producto\": \"tomate\", \"precio\": 500}\n```";

// JSON.parse fallaría, pero JSONparse lo maneja
const parsed = JSONparse(llmResponse);
console.log(parsed); // { producto: "tomate", precio: 500 }
```

### Ventajas de las respuestas automáticas

- **Flexibilidad total**: Maneja consultas impredecibles con inteligencia artificial
- **Personalización**: Define la personalidad y conocimientos específicos del bot
- **Contextual**: Usa el historial y datos del usuario para respuestas relevantes
- **Control de costos**: Monitorea el gasto por cada respuesta generada
- **Fallback inteligente**: Ideal para casos que no encajan en tópicos predefinidos

Con esta funcionalidad, Tomy puede responder de manera inteligente a prácticamente cualquier consulta relacionada con su dominio de conocimiento.

## Creando bases de conocimiento

LU te permite convertir tus datos estructurados en bases de conocimiento inteligentes que pueden ser consultadas semánticamente. Esto es ideal para que Tomy acceda a información específica sobre productos, precios y stock.

### knowledgeBaseByJSON

Convierte datos JSON en fragmentos embebidos listos para búsqueda semántica:

```javascript
const { knowledgeBaseByJSON } = require("ludmi");
const productos = require("./db/productos.json");

const embeddings = await knowledgeBaseByJSON({
  json: productos,
  id: "nombre",          // Campo que se usará como identificador
  maxTokens: 800,        // Tokens máximos por fragmento
  overlapTokens: 40      // Tokens de solapamiento entre fragmentos
});
```

### Ejemplo de datos para Tomy

Supongamos que tienes un archivo `productos.json` con información estática de tus productos:

```json
[
  {
    "nombre": "Tomate perita",
    "categoria": "tomates",
    "unidad": "kg",
    "temporada": "todo el año",
    "origen": "Mendoza",
    "variedades": ["común", "orgánico"],
    "usos": ["salsas", "conservas", "ensaladas"],
    "descripcion": "Tomates peritas frescos, forma alargada, ideales para salsas y conservas por su pulpa carnosa"
  },
  {
    "nombre": "Lechuga mantecosa",
    "categoria": "verduras de hoja",
    "unidad": "unidad",
    "temporada": "otoño-invierno", 
    "origen": "Buenos Aires",
    "variedades": ["común", "orgánica"],
    "usos": ["ensaladas", "hamburguesas", "wraps"],
    "descripcion": "Lechuga de hojas tiernas y dulces, textura mantecosa, perfecta para ensaladas frescas"
  },
  {
    "nombre": "Papa colorada",
    "categoria": "tubérculos",
    "unidad": "kg",
    "temporada": "todo el año",
    "origen": "Balcarce",
    "variedades": ["común", "orgánica"],
    "usos": ["puré", "hervida", "al horno", "papas fritas"],
    "descripcion": "Papa de piel rojiza, pulpa amarilla, ideal para hervir y hacer puré"
  }
]
```

### Parámetros de configuración

- **`id`**: Campo del JSON que se conservará como identificador único
- **`maxTokens`**: Cantidad máxima de tokens por fragmento (recomendado: 800)
- **`overlapTokens`**: Tokens que se superponen entre fragmentos cuando el contenido es muy largo

### Resultado procesado

```json
[
  {
    "id": "Tomate perita",
    "fragmentIndex": 0,
    "text": "{\"nombre\":\"Tomate perita\", \"categoria\": \"tomates\", \"unidad\": \"kg\", \"temporada\": \"todo el año\", \"origen\": \"Mendoza\", \"variedades\": [\"común\", \"orgánico\"], \"usos\": [\"salsas\", \"conservas\", \"ensaladas\"]}",
    "embedding": [0.003612947, -0.023726178, -0.011756117, ...]
  },
  {
    "id": "Tomate perita",
    "fragmentIndex": 1,
    "text": "\"descripcion\": \"Tomates peritas frescos, forma alargada, ideales para salsas y conservas por su pulpa carnosa\"",
    "embedding": [0.002456789, -0.018765432, -0.009123456, ...]
  },
  {
    "id": "Lechuga mantecosa", 
    "fragmentIndex": 0,
    "text": "{\"nombre\":\"Lechuga mantecosa\", \"categoria\": \"verduras de hoja\", \"unidad\": \"unidad\", \"temporada\": \"otoño-invierno\", \"origen\": \"Buenos Aires\", \"variedades\": [\"común\", \"orgánica\"]}",
    "embedding": [-0.002345678, -0.015678912, -0.009876543, ...]
  }
]
```

### Flujo completo: KB + Base de datos

El enfoque recomendado es usar la base de conocimiento para **identificar productos** y luego consultar tu base de datos para **información dinámica**:

```javascript
// 1. Usuario pregunta: "¿Cuánto cuesta el tomate?"
// 2. La KB identifica: "Tomate perita" 
// 3. Consultas tu BD para precio/stock actual:

const productoIdentificado = "Tomate perita";
const infoDinamica = await consultarBD(productoIdentificado);
// { precio: 1200, stock: 45, oferta: false }

// 4. Combinas info estática + dinámica para responder
```

### Fragmentación inteligente

Cuando un producto tiene mucha información (descripción larga, múltiples campos), LU automáticamente:

1. **Divide el contenido** en fragmentos que no excedan `maxTokens`
2. **Mantiene conexión** usando `overlapTokens` para preservar contexto
3. **Asigna índices** (`fragmentIndex`) para identificar las partes
4. **Conserva el ID** para relacionar todos los fragmentos del mismo elemento

### Ventajas para Tomy

- **Identificación inteligente**: Encuentra productos por sinónimos ("tomate cherry" → "Tomate perita")
- **Información rica**: Accede a categorías, usos, temporadas y características
- **Separación clara**: KB para identificar, BD para datos que cambian
- **Búsqueda flexible**: "verdura para ensalada" puede encontrar múltiples opciones
- **Escalabilidad**: Maneja catálogos grandes manteniendo datos dinámicos separados

La base de conocimiento actúa como un "diccionario inteligente" que identifica productos, mientras que tu base de datos tradicional maneja precios y stock en tiempo real.

### knowledgeBaseByText

Convierte documentos de texto largo en fragmentos embebidos para búsqueda semántica. Ideal para manuales, guías o documentación que Tomy pueda consultar:

```javascript
const { knowledgeBaseByText } = require("ludmi");
const fs = require('fs');

// Leer un documento de texto
const guiaVerduras = fs.readFileSync('./docs/guia-verduras.txt', 'utf8');

const embeddings = await knowledgeBaseByText({
  text: guiaVerduras,
  maxTokens: 800,        // Tokens máximos por fragmento
  overlapTokens: 40      // Tokens de solapamiento entre fragmentos
});
```

### Ejemplo de documento para Tomy

Supongamos que tienes una guía con información especializada:

```text
# Guía del Verdulero Experto

## Temporadas de Verduras

Las verduras de temporada no solo son más sabrosas, sino también más económicas y nutritivas. Durante el otoño, las verduras de hoja como lechuga, espinaca y acelga están en su mejor momento. 

La lechuga mantecosa alcanza su máxima dulzura entre marzo y junio, cuando las temperaturas frescas favorecen el desarrollo de hojas tiernas. Es importante conservarla en el cajón de verduras de la heladera, envuelta en papel absorbente.

## Conservación y Almacenamiento

Los tomates nunca deben refrigerarse si no están completamente maduros, ya que el frío interrumpe el proceso de maduración y afecta su sabor. Los tomates peritas son ideales para conservas debido a su menor contenido de agua y mayor concentración de pulpa.

## Consejos Nutricionales

Las verduras de color verde oscuro como la espinaca y el brócoli son ricas en hierro y ácido fólico. Se recomienda consumirlas junto con alimentos ricos en vitamina C para mejorar la absorción del hierro.
```

### Resultado procesado

```json
[
  {
    "fragmentIndex": 0,
    "text": "# Guía del Verdulero Experto\n\n## Temporadas de Verduras\n\nLas verduras de temporada no solo son más sabrosas, sino también más económicas y nutritivas. Durante el otoño, las verduras de hoja como lechuga, espinaca y acelga están en su mejor momento.",
    "embedding": [-0.027951738, -0.027387531, 0.010966767, ...]
  },
  {
    "fragmentIndex": 1,
    "text": "están en su mejor momento.\n\nLa lechuga mantecosa alcanza su máxima dulzura entre marzo y junio, cuando las temperaturas frescas favorecen el desarrollo de hojas tiernas. Es importante conservarla en el cajón de verduras",
    "embedding": [-0.025413267, -0.023891045, 0.008745632, ...]
  },
  {
    "fragmentIndex": 2,
    "text": "conservarla en el cajón de verduras de la heladera, envuelta en papel absorbente.\n\n## Conservación y Almacenamiento\n\nLos tomates nunca deben refrigerarse si no están completamente maduros",
    "embedding": [-0.022876543, -0.021456789, 0.009876543, ...]
  }
]
```

### Diferencias con knowledgeBaseByJSON

- **Sin parámetro `id`**: No hay identificadores únicos, solo índices secuenciales
- **Fragmentación automática**: Divide el texto largo según `maxTokens`
- **Solapamiento crucial**: `overlapTokens` mantiene continuidad entre fragmentos
- **Contenido continuo**: Ideal para documentos narrativos o explicativos

### Casos de uso para Tomy

- **Guías de temporada**: Información sobre cuándo están mejor las verduras
- **Consejos de conservación**: Cómo mantener productos frescos
- **Recetas y preparación**: Sugerencias culinarias
- **Información nutricional**: Beneficios de cada producto
- **Historia y origen**: Datos curiosos sobre productos

### Ventajas del texto embebido

- **Búsqueda contextual**: Encuentra información relevante por contexto
- **Conocimiento profundo**: Accede a información especializada
- **Respuestas fundamentadas**: Basa respuestas en documentación real
- **Actualización fácil**: Modifica el documento y regenera embeddings
- **Flexibilidad**: Funciona con cualquier tipo de texto estructurado

Con ambas funciones (`knowledgeBaseByJSON` y `knowledgeBaseByText`), Tomy puede combinar datos estructurados de productos con conocimiento experto en formato de texto.

## Recuperación inteligente de información

Una vez que tienes tus bases de conocimiento embebidas, puedes usar **retriever** y **RAG** para que Tomy encuentre información específica y genere respuestas fundamentadas.

### Usando el retriever

El retriever busca los fragmentos más relevantes según la consulta del usuario:

```javascript
import { retriever } from 'ludmi';

const chunks = await retriever({
  revised_prompt,           // Entrada procesada por el orquestador
  data: baseConocimiento,   // Tu base de conocimiento embebida
  size: 3                   // Cantidad de fragmentos a recuperar
});
```

### Ejemplo con la guía de Tomy

```javascript
// El usuario pregunta: "¿Cómo conservar las lechugas?"
const chunks = await retriever({
  revised_prompt: "¿Cómo conservar las lechugas frescas por más tiempo?",
  data: guiaEmbebida,       // Base de conocimiento de la guía del verdulero
  size: 2                   // Los 2 fragmentos más relevantes
});

// Resultado: fragmentos sobre conservación de verduras de hoja
```

### Generando respuestas con RAG

RAG (Retrieval-Augmented Generation) combina los fragmentos recuperados con IA para generar respuestas contextuales:

```javascript
import { rag } from 'ludmi';

// Crear prompt personalizado para Tomy
const prompt = `Responder usando solo la información de la base de conocimiento: \`${JSON.stringify(chunks)}\`

# Reglas
- Solo ayudar con consultas sobre verduras, frutas y alimentación saludable
- Si no hay información relevante, sugerir consultar en el local

# Personalidad de Tomy
- Amigable y cercano, como un verdulero de barrio con experiencia
- Conocimiento práctico y consejos útiles
- Lenguaje sencillo pero informativo
- Siempre incluye tips extra cuando sea relevante
- Ocasionalmente menciona productos de temporada
`;

// Generar respuesta fundamentada
const respuesta = await rag({
  chunks,
  prompt,
  revised_prompt
});

console.log(respuesta);
// { content: "Para conservar lechugas frescas...", price: 0.00012 }
```

### Parámetros de RAG

La función `rag` acepta múltiples configuraciones:

```javascript
const respuesta = await rag({
  chunks,                    // Fragmentos recuperados
  revised_prompt,           // Entrada del usuario procesada
  prompt,                   // Prompt personalizado (opcional)
  conversation,             // Historial completo (alternativa a revised_prompt)
  userData,                 // Datos del usuario para personalización
  model: "gpt-4o-mini"     // Modelo a usar (por defecto gpt-4o-mini)
});
```

### Flujo completo: De consulta a respuesta

```javascript
// 1. Usuario pregunta sobre conservación
const userInput = "¿Cómo mantengo frescas las verduras de hoja?";

// 2. Orquestador procesa y enriquece
const { data } = await orchestrator({
  input: userInput,
  // ... otros parámetros
});

// 3. Retriever encuentra información relevante
const chunks = await retriever({
  revised_prompt: data.revised_prompt,
  data: guiaVerduleroEmbebida,
  size: 3
});

// 4. RAG genera respuesta fundamentada
const respuesta = await rag({
  chunks,
  prompt: promptTomy,
  revised_prompt: data.revised_prompt
});

// 5. Respuesta final para el usuario
console.log(respuesta.content);
// "Para mantener frescas las verduras de hoja como lechuga y espinaca, 
//  te recomiendo guardarlas en el cajón de verduras envueltas en papel 
//  absorbente. Esto mantiene la humedad justa sin que se pudran..."
```

### Ventajas del sistema RAG

- **Respuestas fundamentadas**: Basadas en información real de tu base de conocimiento
- **Actualizable**: Cambia la documentación y las respuestas se actualizan
- **Precisión**: Solo usa información que realmente tienes
- **Personalizable**: Adapta la personalidad y estilo de respuesta
- **Eficiente**: Encuentra información relevante sin procesar todo el conocimiento

Con retriever + RAG, Tomy puede actuar como un verdadero experto que consulta su conocimiento especializado para dar respuestas precisas y útiles.