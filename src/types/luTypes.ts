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