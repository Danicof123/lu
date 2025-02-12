import { getAIResponse } from "./llm/openai";
import { JSONparse } from "./parse";

interface getTopicProps {
	topics: Topics;
	conversation: Messages;
	temperature?: number;
	model?: Model;
}
export const getTopic = async ({ topics, conversation, model = "gpt-4o-mini", temperature = .5 }: getTopicProps) => {
	console.log(3);
	
	//Create the developer instruction
	const developerInstruction = `Eres un CLASIFICADOR JSON. Tu única tarea es analizar la conversación y extraer la intención del usuario, respondiendo estrictamente con un objeto JSON que siga este formato EXACTO:
{
  "revised_prompt": "<mensaje reestructurado de la conversación>" //Centrarse en un solo tópico
  "topic": "<categoría identificada>"
}

Topics para clasificar:
${JSON.stringify(topics)}

NOTA:
- Los tópicos están organizados en grupos.
- Ignora los (GRUPOS) y enfócate en los tópicos.

Instrucciones estrictas:
- El campo "topic" debe derivarse exclusivamente del contenido de "revised_prompt". Si existe discrepancia entre el contenido textual y el topic asignado, **prioriza lo que indica "revised_prompt"**.
- Debes responder ÚNICAMENTE con el objeto JSON exacto, sin ningún texto adicional, explicaciones, comentarios o markdown.
- Si el input es una pregunta o contiene información mixta, ignora el formato textual y extrae la intención real según toda la conversación.
- Revisa toda la conversación: si la última entrada no aporta suficiente información, utiliza mensajes anteriores para completar el contexto.
- Ignora cualquier dato o texto que no pertenezca al formato JSON requerido.
- **IMPORTANTE:** Si generas una respuesta que no sea exclusivamente el JSON solicitado, se considerará incorrecto.

Instrucciones para topic:
- No puede ser un (GRUPO).
- Debe ser un topic de "Topics para clasificar".
- Debe ser el topic que mejor se ajuste a la revised_prompt.

Cadena de pensamiento:
- Analizo la entrada del usuario.
- No me interesa responderle, no es mi trabajo.
- Busco el topic de "Topics para clasificar" que mejor se ajuste a la revised_prompt, ignoro los (GRUPOS).
- Genero una respuesta en formato JSON.
- Me aseguro que topic y revised_prompt sean coherentes.
`;

	// Create the message to be sent
	const messages: Messages = [
		...conversation,
		{ role: "developer", content: developerInstruction },
	];

	const { price, content } = await getAIResponse({ messages, model, temperature });
	const json = JSONparse(content) as ClassifiedTopic;

	return {
		price,
		...json
	}
}