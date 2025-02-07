type Eval = {
	type: string;
	message?: string;
	[key: string]: any;
}

interface ActionProps {
	input: Content;
	revised_prompt: Content;
	userData: UserData;
	history?: Messages
}

interface ActionReturn {
	price: number;
	eval: Eval
}

type Action = ({input, revised_prompt, userData = {}, history = []}: ActionProps) => Promise<ActionReturn>;
type Actions = {
	[key: string]: Action | undefined;
}