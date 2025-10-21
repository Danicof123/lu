import { Actions, DataOrq, LlmOrq, Messages, ResultOrq } from "../types/luTypes";
import { getTopic } from "./classifier";
import { addMessageToHistory, getContextHistory } from "./memory/queueMemory";

interface OrchestratorProps {
	metadata?: any,
	topics: any;
	subtopic?: boolean;
	input: string;
	llm?: LlmOrq;
	history?: Messages;
	sizeHistory?: number;
	actions?: Actions;
	userData: any;

}

const defaultLlm: LlmOrq = {
	temperature: .5,
	model: "gpt-4o-mini"
}

export const orchestrator = async ({ history = [], input, subtopic = false, sizeHistory = 10, topics, userData = {}, actions = {}, metadata, llm }: OrchestratorProps): Promise<ResultOrq> => {
	llm = { ...defaultLlm, ...(llm || {}) };

	//Update the history with the new input
	addMessageToHistory({ history, message: { role: "user", content: input } });

	//Get the last n messages from the history
	history = getContextHistory({ history, size: sizeHistory });

	let { topic, stopic, revised_prompt } = await getTopic({ topics, subtopic, conversation: history, llm, metadata });

	//Base Data creation
	const data: DataOrq = {
		history,
		input,
		revised_prompt,
		topic,
		stopic,
		userData
	}

	//Asegurar que topic siempre esté completo
	topic = topic || "ne";

	// If an action exists for the topic
	const action = actions?.[topic];
	if (action) {
		const resultAction = await action({ input, revised_prompt, userData, history });
		return { data: { ...data, eval: resultAction.eval } };
	}

	//Orchestrator END
	return {
		data
	}
}