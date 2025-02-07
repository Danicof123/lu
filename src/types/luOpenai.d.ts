type Content = string;
type Role = "assistant" | "system" | "developer" | "user"
type Message = {
    role: Role;
    content: Content;
}
type Messages = Message[];