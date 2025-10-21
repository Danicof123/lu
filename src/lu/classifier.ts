import { LlmOrq, Messages } from "../types/luTypes";
import { getAIResponse } from "./llm/openai";
import { JSONparse } from "./parse";

interface getTopicProps {
	metadata?: any,
	topics: any;
	subtopic?: boolean;
	conversation: Messages;
	llm?: LlmOrq;
}

interface getRevisedPromptProps {
	metadata?: any,
	conversation: Messages;
	llm: LlmOrq
}

export interface classifierProps {
	topics: any;
	subtopic?: boolean;
	input: string;
	llm: LlmOrq
}

const defaultLlm: LlmOrq = {
	temperature: .5,
	model: "gpt-4o-mini"
}

export const getTopic = async ({ topics, subtopic = false, conversation, llm = defaultLlm, metadata = {} }: getTopicProps) => {

	//get revised prompt
	const revisedPrompt = (llm?.revised) ? { content: llm.revised } : await getRevisedPrompt({ llm, conversation, metadata });

	const respTopic = await classifier({
		topics,
		subtopic,
		input: revisedPrompt.content,
		llm
	});

	return {
		revised_prompt: revisedPrompt.content,
		topic: respTopic.topic,
		stopic: respTopic.stopic
	}
}


//Solo clasifica el topic de la entrada del usuario
export const classifier = async ({ topics, subtopic = false, input, llm }: classifierProps) => {

	const output = {
		"topic": "nombre",
		...(subtopic ? { "subtopic": "auto" } : {})
	}

	const developerInstruction = llm.classifierPrompt || `Clasifica la entrada del usuario con las siguientes categorías de topics:
\`${JSON.stringify(topics)}\`

Pasos:
- Analizar con atención a todos los topics'.
- Seleccionar el topic que mejor se ajuste a la entrada del usuario.
- Importante responder SOLO con el nombre del topic seleccionado sin agregar nada extra.
${subtopic && "Seleccionar el mejor subtopic dentro del topic clasificado"}

Formato respuesta:
${JSON.stringify(output)}
`;

	const messages: Messages = [
		{ role: "developer", content: developerInstruction },
		{ role: "user", content: input },
	];

	const respTopic = await getAIResponse({ messages, model: llm.model, temperature: llm.temperature });

	let topic = "ne";
	let stopic;
	let dev = "";

	try {
		const parse = JSONparse(respTopic.content) as { topic?: string, name?: string, subtopic?: string, dev?: string };
		topic = parse?.topic || parse?.name || "ne";
		stopic = parse?.subtopic
		dev = parse?.dev || ""

		if(dev)
			console.log(dev);

	} catch (error) {
		console.error(error);
	}

	return {
		topic,
		stopic,
		dev
	}
}

const getRevisedPrompt = async ({ conversation, llm, metadata = {} }: getRevisedPromptProps) => {
	const developerInstruction = llm.revisedPrompt || `ERES UN REFORMULADOR. A qué se refiere el usuario con la última entrada? Reformula el mensaje para que sea más claro, manteniendo el estilo y la intención original.

	PASO 1 — ANÁLISIS DE CONTEXTO:
Antes de reformular, analiza si el mensaje del usuario indica una despedida, agradecimiento o un reinicio de conversación (por ejemplo: "ok", "gracias", "ah bueno", "hola", etc.).
Si es así, **ignora completamente los mensajes anteriores** y reformula el mensaje como una expresión aislada, sin suposiciones ni añadidos.

PASO 2 - DIRECCIÓN DEL MENSAJE:
- **Mantén el sujeto, el destinatario y la intención original del mensaje.**  
- Si el mensaje está dirigido al asistente, la reformulación debe seguir dirigida al asistente.  
- No cambies preguntas en segunda persona ("¿te gusta...?") a primera persona ("¿me gusta...?").

PASO 3 — REFORMULACIÓN:
- Si el mensaje no es un cierre o saludo, interpreta a qué se refiere usando el contexto anterior y reformula el mensaje del usuario con claridad. 

IMPORTANTE:
- No agregues nada extra ni expliques lo que haces.
- No cambies el sujeto ni la dirección del mensaje.
- Solo responde con la reformulación del usuario, como si él mismo lo dijera.
- En caso de ser necesario nutrir la entrada del usuario con estos metadatos: ${JSON.stringify(metadata)}`;

	// Create the message to be sent
	const messages: Messages = [
		{ role: "developer", content: developerInstruction },
		...conversation,
	];

	return await getAIResponse({ messages, model: llm.model, temperature: llm.temperature });
};