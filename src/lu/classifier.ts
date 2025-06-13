import { getAIResponse } from "./llm/openai";
import { JSONparse } from "./parse";

interface getTopicProps {
	topics: Topics;
	conversation: Messages;
	revised?: string;
	prompts?: {
		revised?: string;
		topic?: string;
	},
	temperature?: number;
	model?: Model;
}

interface getRevisedPromptProps {
	metadata?: any,
	conversation: Messages;
	prompt?: string;
	temperature?: number;
	model?: Model;
}

export const getTopic = async ({ topics, conversation, revised, prompts, model = "gpt-4o-mini", temperature = .5 }: getTopicProps) => {

	//get revised prompt
	const revisedPrompt = (revised) ? { content: revised, price: 0 } : await getRevisedPrompt({ prompt: prompts?.revised, conversation, model, temperature });

	const developerInstruction = prompts?.topic || `Clasifica la entrada del usuario con las siguientes categorías de topics:
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

const getRevisedPrompt = async ({ prompt, conversation, model = "gpt-4o-mini", temperature = 1, metadata = {} }: getRevisedPromptProps) => {
	const developerInstruction = prompt || `ERES UN REFORMULADOR. A que se refiere el usuario con la última entrada? Reformula la entrada del usuario para que sea más clara y responde como si fuese el mismo usuario, es decir en primera persona.

	PASO 1 — ANÁLISIS DE CONTEXTO:
Antes de reformular, analiza si el mensaje del usuario indica una despedida, agradecimiento o un reinicio de conversación (por ejemplo: "ok", "gracias", "ah bueno", "hola", etc.).
Si es así, **ignora completamente los mensajes anteriores** y reformula el mensaje como una expresión aislada, sin suposiciones ni añadidos.

PASO 2 — REFORMULACIÓN:
Si el mensaje no es un cierre o saludo, interpreta a qué se refiere usando el contexto anterior y reformula el mensaje del usuario con claridad, en primera persona.

IMPORTANTE:
- No agregues nada extra ni expliques lo que haces.
- Solo responde con la reformulación del usuario, como si él mismo lo dijera.

Información adicional que podrías considerar: ${JSON.stringify(metadata)}`;

	// Create the message to be sent
	const messages: Messages = [
		...conversation,
		{ role: "developer", content: developerInstruction },
	];

	return await getAIResponse({ messages, model, temperature });
};