import { openai } from "../../services/openai";
import { Messages } from "../../types/luTypes";

interface ToolFunction {
	type: "function";
	function: {
		name: string;
		description?: string;
		parameters: {
			type: "object";
			properties: Record<string, {
				type: string;
				description?: string;
			}>;
			required?: string[];
		};
	};
}

interface AIResponseProps {
	messages: Messages;
	model?: string;
	temperature?: number;
	tools?: ToolFunction[];
}

export interface ToolCall {
	id: string;
	type: "function";
	function: {
		name: string;
		arguments: string;
	};
}

export interface AIResponseReturn {
	content: string;
	calls?: ToolCall[];
}

/**
 * Get the response from the AI.
 * 
 * @param {AIResponseProps} props - The properties containing messages, model and temperature.
 * @param {Messages} props.messages - The messages to be sent to the AI.
 * @param {Model} props.model - The model to be used by the AI.
 * @param {number} props.temperature - The temperature to be used by the AI.
 * @param {ToolFunction[]} props.tools - The tools to be used by the AI (optional).
 * @returns {} { content, calls? }
 */
export const getAIResponse = async ({ messages, model = "gpt-4o-mini", temperature = 1, tools = [] }: AIResponseProps): Promise<AIResponseReturn> => {

	const configCompletions = {
		model,
		messages,
		temperature,
		...(tools.length ? { tools, tool_choice: "auto" as const } : {}),
	};

	const completions = await openai.chat.completions.create(configCompletions);

	return {
		content: completions.choices[0].message.content || "",
		calls: completions.choices[0].message.tool_calls || []
	};
};

/**
 * Get the embeddings of a text.
 * @param text - The text to be embedded.
 * @returns The embeddings of the text.
 */
export const getEmbeddings = async (text: string): Promise<number[]> => {
	const embeddingResponse = await openai.embeddings.create({
		model: "text-embedding-3-small" as const,
		input: text,
	});

	return embeddingResponse.data[0].embedding;
}
