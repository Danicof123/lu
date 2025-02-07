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

export const Orchestrator = async ({ history = [], input, sizeHistory = 10, topics, userData = {}, actions = {} }: OrchestratorProps): Promise<OrchestratorReturn> => {
	//Update the history with the new input
	addMessageToHistory({ history, message: { role: "user", content: input } });

	//Get the last n messages from the history
	const contextMessages = getContextHistory({ history, size: sizeHistory });

	const { price, topic, revised_prompt } = await getTopic({ topics, conversation: contextMessages });

	//Base Data creation
	const data: DataOrchestrator = {
		history,
		input,
		revised_prompt,
		topic
	}

	//Exist the actions for the topic
	const action = actions[topic];
	if (action) {
		data.asd = 123;
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