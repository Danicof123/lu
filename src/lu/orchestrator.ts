import { Actions, DataOrq, Messages, ResultOrq } from "../types/luTypes";
import { getTopic } from "./classifier";
import { addMessageToHistory, getContextHistory } from "./memory/queueMemory";

interface OrchestratorProps {
	metadata?: any,
	topics: any;
	input: string;
	temperature?: number;
	revised?: string;
	history?: Messages;
	sizeHistory?: number;
	actions?: Actions;
	userData: any;

}

export const orchestrator = async ({ history = [], input, revised, sizeHistory = 10, topics, userData = {}, actions = {}, metadata, temperature=1	 }: OrchestratorProps): Promise<ResultOrq> => {
	//Update the history with the new input
	addMessageToHistory({ history, message: { role: "user", content: input } });

	//Get the last n messages from the history
	history = getContextHistory({ history, size: sizeHistory });

	let { price, topic, revised_prompt } = await getTopic({ topics, conversation: history, revised, metadata, temperature });

	//Base Data creation
	const data: DataOrq = {
		history,
		input,
		revised_prompt,
		topic,
		userData
	}

	//Exist the actions for the topic
	const action = actions[topic];
	if (action) {
		const resultAction = await action({ input, revised_prompt, userData, history });
		price += resultAction.price;
		data.eval = resultAction.eval;
	}

	//Orchestrator END
	return {
		price: {
			unit: "USD",
			value: price
		},
		data
	}
}