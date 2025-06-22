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
    mainTheme: "Vender verduras y frutas frescas."
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