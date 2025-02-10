import { getEmbeddings } from "./llm/openai";

interface retrieverProps {
	revised_prompt: Content;
	data: Array<{
		embedding: Array<number>;
		[key: string]: any;
	}>;
	filter: string;
	size?: number;
}

//get the cosine similarity between two vectors
const cosineSimilarity = (vecA: Array<number>, vecB: Array<number>) => {
	const dotProduct = vecA.reduce((acc, cur, idx) => acc + cur * vecB[idx], 0);
	const normA = Math.sqrt(vecA.reduce((acc, cur) => acc + cur * cur, 0));
	const normB = Math.sqrt(vecB.reduce((acc, cur) => acc + cur * cur, 0));
	return dotProduct / (normA * normB);
}

//get chunks with the highest cosine similarity to the revised prompt
export const retriever = async ({ revised_prompt, data, size = 4 }: retrieverProps) => {
	const embedding = await getEmbeddings(revised_prompt);

	const chunks = data.map(item => ({
		...item,
		score: cosineSimilarity(embedding, item.embedding)
	}))

	chunks.sort((a, b) => b.score - a.score);

	return chunks.slice(0, size);
}
