interface MessageToHistoryProps {
	history: Messages;
	message: Message;
}

interface ContextHistory {
	history: Messages;
	size: number;
}

/**
 * Adds a message to the history array.
 *
 * @param {MessageToHistoryProps} props - The properties containing history and message.
 * @param {History} props.history - The array where the message will be added.
 * @param {Message} props.message - The message to be added to history.
 * @returns {void}
 */
export const addMessageToHistory = ({ history, message }: MessageToHistoryProps): void => {
	history.push({ role: message.role, content: message.content });
}

/**
 * Returns the last n messages from the history.
 * 
 * @param {ContextHistory} props - The properties containing history and size.
 * @param {Messages} props.history - The array where the messages are stored.
 * @param {number} props.size - The number of messages to be returned.
 * @returns {Messages} - The last n messages from the history.
 */
export const getContextHistory = ({ history, size }: ContextHistory): Messages => history.slice(-size);