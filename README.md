Below is an updated README.md that incorporates the project’s primary objective and includes an example custom action for the “Create Account” topic, illustrating how the action returns an “eval” object that can drive specific chatbot flows.

---

# LU (Layer Understanding)

LU is a lightweight, modular library designed to harness the power of Large Language Models (LLMs) while keeping chatbot conversations controlled. Built for chatbot developers, LU leverages the understanding capabilities of LLMs to generate natural, human-like interactions while ensuring the conversation stays on track.

## Objective

In today’s AI revolution, chatbots can easily stray off-topic if left completely free. LU was created to:
- **Control the conversation:** Use LLM understanding to guide conversations and keep them focused.
- **Generate an illusion of freedom:** Provide natural and engaging interactions without compromising control.
- **Trigger custom actions:** Based on the identified topic, execute specific actions (e.g., onboarding a new user) and integrate them into chatbot platforms by returning an evaluation object (`eval`) with specific flow instructions.

## Features

- **OpenAI Integration:** Easily obtain AI responses and text embeddings.
- **Conversation Control:** Manage and restrict responses to stay within desired topics.
- **Topic Classification:** Analyze user inputs and generate a revised prompt for focused interactions.
- **Action Orchestration:** Execute developer-defined actions based on the classified topic.
- **Memory Management:** Maintain context with a conversation history mechanism.
- **JSON Parsing:** Ensure responses are in strict JSON format for consistent downstream processing.

## Installation

Install LU via NPM:

```bash
npm i lu
```

## Usage

### Importing LU

Import the main functions from LU as follows:

```js
import { orchestrator, getAIResponse, getEmbeddings, JSONparse } from 'lu';
```

### Basic Example

Below is a simple example that shows how to classify user input and execute an action based on the identified topic:

```js
import { orchestrator } from 'lu';

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

### Example Custom Action: Create Account

When building chatbots, you might want to trigger specific flows depending on the topic. For instance, consider an action for the “Create Account” topic. In this action, after obtaining a profile from the user, LU checks if the required data is complete. If not, it returns an `eval` object with a specific type and message that can be interpreted by your chatbot platform to manage the flow (e.g., asking for additional profile details).

Below is an example action for “Create Account”:

```js
const { getAIResponse } = require("lu");
const { UserUP } = require("../../../models/user");
const { BREAK_PROFILE, upDataProfile } = require("../types/profile");
const { getUpDataProfile } = require("./getUpDataProfile");

const actionCrearCuenta = async ({ input, revised_prompt, userData = {} }) => {
  const { price, ...profile } = await getUpDataProfile(
    input,
    revised_prompt,
    userData
  );

  userData.profile = { ...userData.profile, ...profile };

  // If none of the required profile fields are provided:
  if (!Object.keys(upDataProfile).some((key) => profile[key])) {
    console.log("Missing all required profile data", profile);

    return {
      price,
      eval: {
        type: BREAK_PROFILE.PROFILE_DATA,
        message: "User profile information is incomplete.",
      },
    };
  }

  // If some data is missing:
  if (!Object.keys(upDataProfile).every((key) => profile[key])) {
    const developerInstructionNoIntro = `Generate a message with the same personality, for example: "Some data is missing to complete your registration" or "Just one last detail is missing"
🔹 Full Name
🔹 Phone Number  
🔹 National ID
🔹 Email Address

Consider:
- Known user profile information: ${JSON.stringify(userData.profile)}
- The required fields with their descriptions: ${JSON.stringify(upDataProfile)}
- The conversation is already in progress—do not greet.
- List only the missing data.
- End the list without adding extra messages.`;

    const developerInstructionConIntro = `Generate a message with the same personality: "Perfect! 😊 To continue with your account creation, please provide the following information:\n\n (List the missing details) 
🔹 Full Name (username + lastname)
🔹 Phone Number  
🔹 National ID
🔹 Email Address"

Consider:
- Known user profile information: ${JSON.stringify(userData.profile)}
- The conversation is already in progress—do not greet.
- List only the missing data.
- End the list without adding extra messages.`;

    // Determine which instruction to use based on the user trace (if account creation has been initiated)
    const traces = JSON.parse(userData.traces || "{}");
    const developerInstruction = !traces.logup
      ? developerInstructionConIntro
      : developerInstructionNoIntro;

    const messages = [
      {
        role: "developer",
        content: developerInstruction,
      },
      {
        role: "user",
        content: `User input: ${input}.`,
      },
    ];

    const { content, price } = await getAIResponse({ messages });

    return {
      price,
      eval: {
        type: BREAK_PROFILE.PROFILE_DATA_RTA_GENERATIVE,
        message: content,
      },
    };
  }

  // Create the user
  const user = new UserUP(userData.profile);
  userData.profile.code = user.data.code;

  // Add the user to the database and send the confirmation code via email
  const resp = await user.add();
  await user.sendCode();

  return {
    price,
    eval: {
      type: BREAK_PROFILE.PROFILE_CREATED,
      message: "User created with the provided details.",
      data: resp
    },
  };
};

module.exports = {
  actionCrearCuenta,
};
```

> **Note:** In this action, the returned `eval` object (with a `type` and `message`) is intended for use with chatbot platforms. It lets you direct the conversation flow (e.g., prompting for additional data or confirming successful account creation) based on the evaluation type.

## Configuration

LU uses environment variables to set up the OpenAI integration. Create a `.env` file in your project root with the following:

```env
OPENAI_API_KEY=your_api_key_here
OPENAI_ORGANIZATION=your_organization_id (optional)
```

## Project Structure

LU is organized into modular components that separate responsibilities clearly. Below is an overview of the project structure:

```
lu/
│── src/
│   ├── lu/
│   │   ├── llm/
│   │   │   ├── openai.ts       // OpenAI integration for chat and embeddings
│   │   ├── memory/
│   │   │   ├── queueMemory.ts  // Conversation history management
│   │   ├── classifier.ts       // Topic classification using LLM responses
│   │   ├── orchestrators.ts    // Orchestration of actions based on topics
│   │   ├── parse.ts            // JSON parsing utility
│   │   ├── services/
│   │   │   ├── openai.ts       // OpenAI service configuration
│   │   ├── types/
│   │   │   ├── action.d.ts     // Action type definitions
│   │   │   ├── globals.d.ts    // Global type definitions
│   │   │   ├── luOpenai.d.ts   // Types for OpenAI integration
│   │   ├── config.ts           // Configuration and environment variables
│   │   ├── index.ts            // Main entry point for the library
│── package.json
│── tsconfig.json
```

## Contributing

Contributions are welcome! If you have suggestions, encounter issues, or want to add new features, please open an issue or submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE).

---

LU is an ideal starting point for developers seeking to build controlled yet natural chatbot interactions by leveraging LLMs. Enjoy exploring LU and feel free to contribute to its evolution!