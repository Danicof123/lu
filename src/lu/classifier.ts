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
\`${JSON.stringify(topics)}\`

Pasos:
- Analizar con atención a todos los topics'.
- Seleccionar el topic que mejor se ajuste a la entrada del usuario.
- Importante responder solo con el nombre del topic seleccionado sin agregar nada extra.`;

	const messages: Messages = [
		{ role: "user", content: revisedPrompt.content },
		{ role: "developer", content: developerInstruction },
	];

	const topic = await getAIResponse({ messages, model, temperature });

	return {
		price: topic.price + revisedPrompt.price,
		revised_prompt: revisedPrompt.content,
		topic: topic.content
	}
}

const getRevisedPrompt = async ({ conversation, model = "gpt-4o-mini", temperature=1, }: getRevisedPromptProps) => {
	const developerInstruction = `ERES UN REFORMULADOR. A que se refiere el usuario con la última entrada? Reformula la entrada del usuario para que sea más clara y responde como si fuese el mismo usuario, es decir en primera persona. No agregues nada extra, solo responde con la reformulación.`;

	// Create the message to be sent
	const messages: Messages = [
		...conversation,
		{ role: "developer", content: developerInstruction },
	];

	return await getAIResponse({ messages, model, temperature });
};