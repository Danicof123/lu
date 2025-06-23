import { Chunks, Content, Messages, Model } from "../types/luOpenai";
import { getAIResponse, getEmbeddings } from "./llm/openai";

interface retrieverProps {
	revised_prompt: Content;
	data: Array<{
		embedding: Array<number>;
		[key: string]: any;
	}>;
	size?: number;
}

interface ragProps {
	userData?: UserData;
	conversation?: Messages;
	revised_prompt?: string;
	chunks: Chunks;
	model?: Model;
	prompt?: string;
}

//get the cosine similarity between two vectors
const cosineSimilarity = (vecA: Array<number>, vecB: Array<number>) => {
	const dotProduct = vecA.reduce((acc, cur, idx) => acc + cur * vecB[idx], 0);
	const normA = Math.sqrt(vecA.reduce((acc, cur) => acc + cur * cur, 0));
	const normB = Math.sqrt(vecB.reduce((acc, cur) => acc + cur * cur, 0));
	return dotProduct / (normA * normB);
}

//get chunks with the highest cosine similarity to the revised prompt
export const retriever = async ({ revised_prompt, data, size = 4 }: retrieverProps): Promise<Chunks> => {
	const embedding = await getEmbeddings(revised_prompt);

	const chunks = data.map(item => ({
		...item,
		score: cosineSimilarity(embedding, item.embedding)
	}))

	chunks.sort((a, b) => b.score - a.score);

	return chunks.slice(0, size);
}

export const rag = async ({ chunks, conversation, revised_prompt, userData={}, model="gpt-4o-mini", prompt }: ragProps) => {
	//conversation o revised_promp, uno debe venir
	if (!conversation?.length && !revised_prompt) throw new Error("Debe enviar revised_prompt o conversation");

	const developerInstruction = prompt || `Responder solo usando la información extraída de la BD:
\`${JSON.stringify(chunks)}\`

REGLAS DE RESPUESTA:
- Mismo idioma del usuario.
- Estilo whatsapp, ejemplo para destacar palabra clave: *palabra* (No usar doble asteriscos; **MAL**).
- Emojis con coherencia.

Datos que conocemos del usuario: \`${JSON.stringify(userData)}\`
`;

	const messages: Messages = [
		{
			role: "developer",
			content: developerInstruction
		}
	]

	if (revised_prompt)
		messages.push({
			role: "user",
			content: revised_prompt
		});
	else if (conversation)
		messages.push(...conversation);

	const AIresponse = await getAIResponse({ messages, model, temperature: 1 })
	return AIresponse;
};
