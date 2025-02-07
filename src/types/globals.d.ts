type GroupTopics = `( ${string} )`;
type Topics = {
	[key: GroupTopics]: Record<string, string>;
};

type Action = () => void;
type Actions = {
	[key: string]: Action | undefined;
}

type ClassifiedTopic = {
	topic: string;
	revised_prompt: string;
}

type UserData = {
	[key: string]: Record<string, any>;
};

type Model = "gpt-4o-mini" | "text-embedding-3-small";

type DataOrchestrator = {
	topic: string,
	input: Content,
	revised_prompt: Content,
	history: Messages,
	[key: string]: any
}

type OrchestratorReturn = {
	price: {
		unit: "USD",
		value: number
	}
	data: DataOrchestrator;
}
