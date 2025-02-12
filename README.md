# LU (Layer Understanding)

LU is a lightweight, modular library designed to harness the power of Large Language Models (LLMs) while keeping chatbot conversations controlled. Built for chatbot developers, LU leverages LLM understanding to generate natural, human-like interactions while ensuring conversations stay on track.

> **Note:** Although the project development continues under the name **LU**, the npm package has been published as `ludmi` due to naming conflicts with an existing package.

## Objective

In today’s AI revolution, chatbots often wander off-topic if left completely free. LU was created to:
- **Control the conversation:** Use LLM understanding to guide and restrict chatbot responses.
- **Generate an illusion of freedom:** Provide engaging, natural interactions without sacrificing control.
- **Trigger custom actions:** Execute developer-defined actions (e.g., onboarding a new user) based on the classified topic.
- **Enhance contextual responses:** Retrieve and integrate relevant knowledge from a database using cosine similarity and generate contextually enriched answers.

## Features

- **OpenAI Integration:** Seamlessly obtain AI responses and text embeddings using OpenAI.
- **Conversation Control:** Maintain focused interactions through topic classification.
- **Topic Classification:** Analyze user input to identify the primary topic and generate a revised prompt.
- **Action Orchestration:** Execute custom actions based on the classified topic.
- **Memory Management:** Maintain context with conversation history management.
- **JSON Parsing:** Enforce strict JSON output for consistent downstream processing.
- **Retriever & RAG Functionality:**  
  - **Retriever:** Compute text embeddings and use cosine similarity to retrieve the most relevant chunks from your knowledge base.  
  - **RAG (Retrieval-Augmented Generation):** Combine user data, retrieved chunks, and conversation context to generate enriched responses with controlled styling (e.g., WhatsApp-like formatting with emojis and emphasized keywords).
<<<<<<< HEAD
- **Knowledge Base Generation:**  
  - **knowledgeBaseByText:** Splits a long text into manageable fragments with overlapping tokens and computes embeddings for each fragment.  
  - **knowledgeBaseByJSON:** Processes a JSON structure with knowledge elements, concatenates text content, and generates a structured knowledge base with fragments enriched with embeddings.
=======
>>>>>>> main

## Installation

Install LU (published as `ludmi`) via NPM:

```bash
npm i ludmi
```

## Usage

### Importing LU

You can import the main functions from LU as follows:

```js
import { orchestrator, getAIResponse, getEmbeddings, JSONparse, retriever, rag } from 'ludmi';
```

### Basic Example

Below is a simple example demonstrating how to classify user input and execute an action based on the identified topic:

```js
import { orchestrator } from 'ludmi';

const topics = {
  "(Technical Support)": {
    "inquiry": "user needs technical help"
  },
  "(Sales)": {
    "report": "sales inquiry"
  }
};

const actions = {
  "inquiry": async ({ input, revised_prompt, userData, history }) => {
    // Custom action for handling technical support inquiries
    console.log("Executing action for technical support inquiry");
    return { price: 0, eval: { type: "success", message: "Action executed" } };
  }
};

const conversationHistory = [];
const userInput = "I need help with a technical issue";
const userData = {};

orchestrator({
  history: conversationHistory,
  input: userInput,
  sizeHistory: 10,
  topics,
  actions,
  userData
}).then(result => {
  console.log("Result:", result);
});
```

### Using Retriever & RAG

The retriever functionality helps you retrieve the most relevant chunks of knowledge based on the revised prompt, and RAG uses these chunks along with the conversation context to generate a tailored response. For example:

```js
import { retriever, rag } from 'ludmi';

// Assume `data` is an array of objects with an `embedding` property and other metadata.
const knowledgeBase = [
  { embedding: [/* array of numbers */], title: "Introduction to LU", content: "LU is a modular library..." },
  // ... more items
];

const revisedPrompt = "Explain how LU manages conversation control.";
const conversation = [
  { role: "user", content: "Can you tell me more about LU?" }
];
const userData = { id: "user123", preferences: {} };

(async () => {
  // Retrieve the top 4 chunks most relevant to the revised prompt
  const chunks = await retriever({ revised_prompt: revisedPrompt, data: knowledgeBase, size: 4 });
  
  // Generate a response using RAG, which considers the retrieved chunks and conversation context
  const response = await rag({ chunks, conversation, userData, model: "gpt-4o-mini" });
  
  console.log("RAG Response:", response);
})();
```

---

## Knowledge Base Generation

LU now includes a powerful knowledge base module that allows you to process long texts or structured JSON content into indexed fragments with embeddings. This feature is essential for enabling effective retrieval-augmented generation (RAG) or simply for indexing and retrieving large documents.

### Module Overview

The module is located in `/lu/src/lu/knowledgeBase.ts` and exports two primary functions:

- **knowledgeBaseByText:**  
  Accepts a plain text string, tokenizes it using the encoder (for example, `"gpt-4o-mini"`), splits it into fragments based on the maximum token limit with a defined overlap, and computes the embedding for each fragment using the OpenAI API (via `getEmbeddings`).  
  Each fragment is returned as an object containing:
  - `fragmentIndex`: a sequential index.
  - `text`: the decoded text of the fragment.
  - `embedding`: an array of numbers representing the text embedding.

- **knowledgeBaseByJSON:**  
  Processes a JSON structure where each key represents a category and its value is an array of elements. Each element must contain a `content` property (an array of strings) along with any additional metadata.  
  The function concatenates the content into a single string, generates fragments (using `knowledgeBaseByText`), and then organizes the fragments by category. This allows you to build a structured and searchable knowledge base.

### Code Examples

#### Using knowledgeBaseByText

```js
import { knowledgeBaseByText } from 'ludmi';

const longText = "Your long text goes here...";
knowledgeBaseByText({ text: longText, maxTokens: 1000, overlapTokens: 100 })
  .then(fragments => {
    console.log("Text fragments with embeddings:", fragments);
  })
  .catch(err => {
    console.error("Error generating text knowledge base:", err);
  });
```

#### Using knowledgeBaseByJSON

```js
import { knowledgeBaseByJSON } from 'ludmi';

const jsonData = {
  "chapter1": [
    {
      content: [
        "This is the introduction of chapter 1.",
        "It covers the basics of LU."
      ],
      title: "Introduction"
    }
  ],
  "chapter2": [
    {
      content: [
        "This chapter dives into advanced topics.",
        "It includes detailed examples and use cases."
      ],
      title: "Advanced Topics"
    }
  ]
};

knowledgeBaseByJSON({ json: jsonData, maxTokens: 1000, overlapTokens: 100 })
  .then(knowledgeBase => {
    console.log("Generated Knowledge Base:", knowledgeBase);
  })
  .catch(err => {
    console.error("Error generating JSON knowledge base:", err);
  });
```

### Under the Hood

- **Tokenization & Fragmentation:**  
  The module uses `tiktoken` to convert the text into tokens (using an encoder for `"gpt-4o-mini"` in this example). It then divides the token array into fragments with a maximum length of `maxTokens` and an overlap defined by `overlapTokens`, ensuring contextual continuity between fragments.

- **Embedding Generation:**  
  Each fragment is decoded back to text using the encoder’s `decode` method (and a `TextDecoder` to obtain a proper string) before being passed to `getEmbeddings`, which communicates with the OpenAI API to compute the embedding vector.

- **Flexible Configuration:**  
  Both functions allow the configuration of `maxTokens` and `overlapTokens` to best fit your document structure or content requirements.

Integrating this module with LU's retriever and RAG functionalities greatly enhances your ability to build intelligent, context-aware chatbots that dynamically fetch and incorporate relevant information.

---

## Configuration

LU uses environment variables to configure its OpenAI integration. Create a `.env` file in your project root with the following variables:

```env
OPENAI_API_KEY=your_api_key_here
OPENAI_ORGANIZATION=your_organization_id (optional)
```

## Project Structure

LU is organized into modular components that separate responsibilities clearly. Here’s an overview of the project structure:

```
lu/
│── src/
│   ├── lu/
│   │   ├── llm/
│   │   │   ├── openai.ts         // OpenAI integration for chat and embeddings
│   │   ├── memory/
│   │   │   ├── queueMemory.ts    // Conversation history management
│   │   ├── classifier.ts         // Topic classification using LLM responses
│   │   ├── orchestrators.ts      // Orchestration of actions based on topics
│   │   ├── parse.ts              // JSON parsing utility
│   │   ├── retriever.ts          // Retriever/RAG utility
│   │   ├── knowledgeBase.ts      // Knowledge Base generation (text & JSON)
│   │   ├── services/
│   │   │   ├── openai.ts         // OpenAI service configuration
│   │   ├── types/
│   │   │   ├── action.d.ts       // Action type definitions
│   │   │   ├── globals.d.ts      // Global type definitions
│   │   │   ├── luOpenai.d.ts     // Types for OpenAI integration
│   │   ├── config.ts             // Configuration and environment variables
│   │   ├── index.ts              // Main entry point for the library
│── package.json
│── tsconfig.json
```

## Repository

The LU project is hosted on GitHub. Check out the repository here:  
[https://github.com/Danicof123/lu](https://github.com/Danicof123/lu)

## Contributing

Contributions are welcome! If you have suggestions, encounter issues, or want to add new features, please open an issue or submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE).

---

LU is an ideal starting point for developers seeking to build controlled yet natural chatbot interactions by leveraging modern LLM capabilities. Enjoy exploring LU and feel free to contribute to its evolution!