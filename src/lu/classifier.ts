import { getAIResponse } from "./llm/openai";
import { JSONparse } from "./parse";

interface getTopicProps {
	topics: Topics;
	conversation: Messages;
	temperature?: number;
	model?: Model;
}
export const getTopic = async ({ topics, conversation, model = "gpt-4o-mini", temperature = .5 }: getTopicProps) => {
	//Create the developer instruction
	const developerInstruction = `ERES UN CLASIFICADOR.
JSON PARA CLASIFICAR:
\`\`\`json${JSON.stringify(topics)}\`\`\`

TIPO DE RESPUESTA:
\`\`\`json
{
	"topic": "topic_que_mas_se_ajusta",
	"revised_prompt": "resumen_contexto_usuario_primera_persona (Dandole énfasis a la última entrada)"
}\`\`\`

REGLAS:
- En el JSON para clasificar aparecen (GRUPOS), ignorar e ir al subnivel.
- UTILIZAR la subcategoría específica para el topic.
- El topic debe tener coherencia con 'revised_prompt'
- El tipo de respuesta debe tener forma JSON, NUNCA texto plano.
- No debes responder a las preguntas del usuario, solo clasificar.
- No agregues texto extra ni explicaciones fuera del JSON.`;

	// Create the message to be sent
	const messages: Messages = [
		{ role: "developer", content: developerInstruction },
		...conversation
	];

	const { price, content } = await getAIResponse({ messages, model, temperature });
	const json = JSONparse(content) as ClassifiedTopic;

	return {
		price,
		...json
	}
}