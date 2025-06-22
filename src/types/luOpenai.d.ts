type Content = string;
type Role = "assistant" | "system" | "developer" | "user"
export type Message = {
    role: Role;
    content: Content;
}
export type Messages = Message[];

type Model = "gpt-4o-mini" | "text-embedding-3-small" | (string & {});
type Chunk = {
    embedding: Array<number>;
    score: number;
    [key: string]: any;
}

type Chunks = Chunk[];