type GroupTopics = `( ${string} )`;
type Topics = {
	[key: GroupTopics]: Record<string, string>;
};

type UserData = {
	[key: string]: Record<string, any>;
};

type ClassifiedTopic = {
	topic: string;
	revised_prompt: string;
}

type DataOrchestrator = {
	topic: string,
	input: Content,
	revised_prompt: Content,
	history: Messages,
	userData: UserData,
	eval?: Eval
}

type OrchestratorReturn = {
	price: {
		unit: "USD",
		value: number
	}
	data: DataOrchestrator;
}
