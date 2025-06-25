export type Role = "assistant" | "system" | "developer" | "user"

export type Message = {
	role: Role;
	content: string;
}
export type Messages = Message[];

export type DataOrq = {
	topic: string;
	input: string;
	revised_prompt: string;
	history: Messages;
	userData: any;
	eval?: any;
}

export type ResultOrq = {
	price: {
		unit: "USD";
		value: number;
	};
	data: DataOrq;
}

// Acciones
export type ActionProps = {
	input: string;
	revised_prompt: string;
	userData: any;
	history?: Messages
}

export interface ActionReturn {
	price: number;
	eval: any
}

export type Action = ({input, revised_prompt, userData, history}: ActionProps) => Promise<ActionReturn>;
export type Actions = {
	[key: string]: Action;
}

//Classifier

export type ClassifiedTopic = {
	topic: string;
	revised_prompt: string;
}

// Retriever
export type Chunk = {
	embedding: Array<number>;
	score: number;
	[key: string]: any;
}

export type Chunks = Chunk[];