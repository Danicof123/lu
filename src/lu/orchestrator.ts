import { getTopic } from "./classifier";
import { addMessageToHistory, getContextHistory } from "./memory/queueMemory";

interface OrchestratorProps {
	topics: Topics;
	input: Content;
	history: Messages;
	sizeHistory: number;
	actions?: Actions;
	userData: UserData;
}

export const orchestrator = async ({ history = [], input, sizeHistory = 10, topics, userData = {}, actions = {} }: OrchestratorProps): Promise<OrchestratorReturn> => {
	//Update the history with the new input
	addMessageToHistory({ history, message: { role: "user", content: input } });

	//Get the last n messages from the history
	const contextMessages = getContextHistory({ history, size: sizeHistory });

	let { price, topic, revised_prompt } = await getTopic({ topics, conversation: contextMessages });

	//Base Data creation
	const data: DataOrchestrator = {
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