import { openai } from "../../services/openai";
import { Messages } from "../../types/luTypes";

interface ToolFunction {
  type: "function";
  function: {
    name: string;
    description?: string;
    parameters: {
      type: "object";
      properties: {
        [key: string]: {
          type: string;
          description?: string;
        };
      };
      required?: string[];
    };
  };
}

interface AIResponseProps {
	messages: Messages;
	model: string;
	temperature: number;
	tools?: ToolFunction[];
}

export interface AIResponseReturn {
	content: string;
	price: number;
	calls?: any;
}

const PRICE = {
	"gpt-4o-mini": {
		INPUT: 0.00000015,
		OUTPUT: 0.000000075
	},
	"text-embedding-3-small" : { //TODO: Change this to the real price
		INPUT: 0,
		OUTPUT: 0
	},
	default: {
		INPUT: 0.00000015,
		OUTPUT: 0.000000075
	}
} as const;

/**
 * Get the response from the AI.
 * 
 * @param {AIResponseProps} props - The properties containing messages, model and temperature.
 * @param {Messages} props.messages - The messages to be sent to the AI.
 * @param {Model} props.model - The model to be used by the AI.
 * @param {number} props.temperature - The temperature to be used by the AI.
 * @param {string[]} props.tools - The tools to be used by the AI (optional).
 * @returns {} { price, content }
 */
export const getAIResponse = async ({ messages, model = "gpt-4o-mini", temperature = 1, tools = [] }: AIResponseProps): Promise<AIResponseReturn> => {
	const completions = await openai.chat.completions.create({
		model,
		messages,
		temperature,
		tools,
		tool_choice: "auto",
	});

	const usage = completions.usage!;
	const itokens = Number(usage.prompt_tokens);
	const otokens = Number(usage.completion_tokens);

	const priceModel = PRICE[model as keyof typeof PRICE] || PRICE.default;
	const price = itokens * priceModel.INPUT + otokens * priceModel.OUTPUT;

	console.log(`INPUT: $${itokens * priceModel.INPUT} (${itokens} it) - OUTPUT: $${otokens * priceModel.OUTPUT} (${otokens} it) - Total: $${price} (${itokens + otokens} it)`);


	console.log(0, completions.choices[0].message.tool_calls || "No tool calls made");

	return {
		content: completions.choices[0].message.content || "",
		price,
		calls: completions.choices[0].message.tool_calls || []
	};
};

/**
 * Get the embeddings of a text.
 * 
 * @param text - The text to be embedded.
 * @returns The embeddings of the text.
 */
export const getEmbeddings = async (text: string) : Promise<number[]> => {
	const embeddingResponse = await openai.embeddings.create({
		model: "text-embedding-3-small",
		input: text,
	});

	return embeddingResponse.data[0].embedding;
}
