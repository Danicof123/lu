import { Messages, Model } from "../types/luOpenai";
import { getAIResponse } from "./llm/openai";
import { JSONparse } from "./parse";

interface getTopicProps {
	metadata?: any,
	topics: any;
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

export interface classifierProps {
	topics: any;
	input: string;
	prompt?: string;
	model?: string;
	temperature?: number;
}

export const getTopic = async ({ topics, conversation, revised, prompts, model = "gpt-4o-mini", temperature = .5, metadata = {} }: getTopicProps) => {

	//get revised prompt
	const revisedPrompt = (revised) ? { content: revised, price: 0 } : await getRevisedPrompt({ prompt: prompts?.revised, conversation, model, temperature, metadata });

	const respTopic = await classifier({
		topics,
		input: revisedPrompt.content,
		prompt: prompts?.topic,
		model,
		temperature
	}); 

	return {
		price: respTopic.price + revisedPrompt.price,
		revised_prompt: revisedPrompt.content,
		topic: respTopic.topic
	}
}


//Solo clasifica el topic de la entrada del usuario
export const classifier = async ({ topics, input, prompt, model = "gpt-4o-mini", temperature = .5 }: classifierProps) => {
	
	const developerInstruction = prompt || `Clasifica la entrada del usuario con las siguientes categorías de topics:
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
		{ role: "user", content: input },
		{ role: "developer", content: developerInstruction },
	];

	const respTopic = await getAIResponse({ messages, model, temperature });

	let topic = "ne";
	try {
		const parse = JSONparse(respTopic.content) as { topic?: string, name?: string };
		topic = parse?.topic || parse?.name || "ne";
		console.log("Topic clasificado:", topic);
		
	} catch (error) {
		console.error(error);
		topic = respTopic.content;
	}

	return {
		price: respTopic.price,
		topic
	}
}

const getRevisedPrompt = async ({ prompt, conversation, model = "gpt-4o-mini", temperature = 1, metadata = {} }: getRevisedPromptProps) => {
	const developerInstruction = prompt || `ERES UN REFORMULADOR. A qué se refiere el usuario con la última entrada? Reformula el mensaje para que sea más claro, manteniendo el estilo y la intención original.

	PASO 1 — ANÁLISIS DE CONTEXTO:
Antes de reformular, analiza si el mensaje del usuario indica una despedida, agradecimiento o un reinicio de conversación (por ejemplo: "ok", "gracias", "ah bueno", "hola", etc.).
Si es así, **ignora completamente los mensajes anteriores** y reformula el mensaje como una expresión aislada, sin suposiciones ni añadidos.

PASO 2 - DIRECCIÓN DEL MENSAJE:
- **Mantén el sujeto, el destinatario y la intención original del mensaje.**  
- Si el mensaje está dirigido al asistente, la reformulación debe seguir dirigida al asistente.  
- No cambies preguntas en segunda persona ("¿te gusta...?") a primera persona ("¿me gusta...?").

PASO 2 — REFORMULACIÓN:
- Si el mensaje no es un cierre o saludo, interpreta a qué se refiere usando el contexto anterior y reformula el mensaje del usuario con claridad. 

IMPORTANTE:
- No agregues nada extra ni expliques lo que haces.
- No cambies el sujeto ni la dirección del mensaje.
- Solo responde con la reformulación del usuario, como si él mismo lo dijera.
- En caso de ser necesario nutrir la entrada del usuario con estos metadatos: ${JSON.stringify(metadata)}`;;

	// Create the message to be sent
	const messages: Messages = [
		...conversation,
		{ role: "developer", content: developerInstruction },
	];

	return await getAIResponse({ messages, model, temperature });
};