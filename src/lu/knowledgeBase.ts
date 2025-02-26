import { encoding_for_model } from "tiktoken";
import { getEmbeddings } from "./llm/openai";

type JSONElement = {
	[key: string]: any;
}

type JSONData = JSONElement[];

interface KnowledgeBaseByJSONProps {
	json: JSONData;
	id?: string;
	maxTokens?: number;
	overlapTokens?: number;
}

interface KnowledgeBaseByTextProps {
	text: string;
	maxTokens?: number;
	overlapTokens?: number;
}

type Fragment = {
	fragmentIndex: number;
	id?: string;
	text: string;
	embedding: number[];
}

export interface KnowledgeBaseReturn {
	[key: string]: Fragment[];
}
const MODEL = "text-embedding-3-small";

export const knowledgeBaseByJSON = async ({ json, maxTokens = 1000, overlapTokens = 100, id }: KnowledgeBaseByJSONProps) => {
	if (maxTokens <= overlapTokens) {
		throw new Error('maxTokens debe ser mayor que overlapTokens');
	}

	const data: Fragment[] = [];
	for (const element of json) {

		const text = JSON.stringify(element);
		const fragments = await knowledgeBaseByText({ text, maxTokens, overlapTokens });
		
		//add fragments to the data
		fragments.forEach(fragment => {
			data.push({
				id: id && element[id],
				...fragment
			})
		});
	}

	return data;
}

export const knowledgeBaseByText = async ({ text, maxTokens = 1000, overlapTokens = 100 }: KnowledgeBaseByTextProps) => {
	if (maxTokens <= overlapTokens) {
		throw new Error('maxTokens debe ser mayor que overlapTokens');
	}
	const fragments: Fragment[] = [];
	const encoder = encoding_for_model(MODEL);
	const tokens = encoder.encode(text);

	const step = maxTokens - overlapTokens;
	// Recorremos los tokens y vamos creando fragmentos de tamaño maxTokens con el solapamiento indicado
	let contadorFragment = 0;
	for (let i = 0; i < tokens.length; i += step) {
		const fragmentTokens = tokens.slice(i, i + maxTokens);
		const fragmentText = encoder.decode(fragmentTokens);

		//Decoding the fragment
		const content = new TextDecoder().decode(fragmentText)
		const embedding = await getEmbeddings(content);

		//Adding the fragment to the list
		fragments.push({
			fragmentIndex: contadorFragment++,
			text: content,
			embedding
		});
	}

	return fragments;
}