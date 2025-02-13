import { getAIResponse } from "./llm/openai";

interface getTopicProps {
	topics: Topics;
	conversation: Messages;
	temperature?: number;
	model?: Model;
}

interface getRevisedPromptProps {
	conversation: Messages;
	temperature?: number;
	model?: Model;
}

export const getTopic = async ({ topics, conversation, model = "gpt-4o-mini", temperature = .5 }: getTopicProps) => {

//get revised prompt
const revisedPrompt = await getRevisedPrompt({ conversation, model, temperature });

const developerInstruction = `Clasifica la entrada del usuario con las siguientes categorías de topics:
${JSON.stringify(topics)}

NOTA:
- Los tópicos están organizados en grupos.
- Ignora los (GRUPOS) y enfócate en los tópicos.
- No agregues nada extra, solo respondes con el nombre del topic.`;

	const messages: Messages = [
		{ role: "developer", content: developerInstruction },
		{ role: "user", content: revisedPrompt.content },
	];

	const topic = await getAIResponse({ messages, model, temperature });

	return {
		price: topic.price + revisedPrompt.price,
		revised_prompt: revisedPrompt.content,
		topic: topic.content
	}
}

const getRevisedPrompt = async ({ conversation, model = "gpt-4o-mini", temperature=1, }: getRevisedPromptProps) => {
	const developerInstruction = `Reestructura la conversación con la intención del usuario con respecto al último mensaje y escribelo como si lo hubiese dicho el mismo usuario.`;

	// Create the message to be sent
	const messages: Messages = [
		...conversation,
		{ role: "developer", content: developerInstruction },
	];

	return await getAIResponse({ messages, model, temperature });
};