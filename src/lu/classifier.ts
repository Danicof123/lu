import { getAIResponse } from "./llm/openai";
import { JSONparse } from "./parse";

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
- Importante responder SOLO con el nombre del topic seleccionado sin agregar nada extra.

Formato respuesta:
{
	"topic": "nombre del topic"
}`;


	const messages: Messages = [
		{ role: "user", content: revisedPrompt.content },
		{ role: "developer", content: developerInstruction },
	];

	const respTopic = await getAIResponse({ messages, model, temperature });
	let topic = "ne";
	try {
		const parse = JSONparse(respTopic.content) as { topic: string, name: string };
		topic = parse?.topic || parse?.name;
	} catch (error) {
		console.error(error);
		topic = respTopic.content;
	}

	return {
		price: respTopic.price + revisedPrompt.price,
		revised_prompt: revisedPrompt.content,
		topic
	}
}

const getRevisedPrompt = async ({ conversation, model = "gpt-4o-mini", temperature = 1, }: getRevisedPromptProps) => {
	const developerInstruction = `ERES UN REFORMULADOR. A que se refiere el usuario con la última entrada? Reformula la entrada del usuario para que sea más clara y responde como si fuese el mismo usuario, es decir en primera persona. No agregues nada extra, solo responde con la reformulación.`;

	// Create the message to be sent
	const messages: Messages = [
		...conversation,
		{ role: "developer", content: developerInstruction },
	];

	return await getAIResponse({ messages, model, temperature });
};