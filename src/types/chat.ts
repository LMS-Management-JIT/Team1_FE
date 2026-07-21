export interface ChatConversation {
    id: string;
    participants: string[];
    lastMessage: string | null;
    lastMessageTime: string | null;
    createdAt: string;
    otherAccountId: string | null;
    otherFullName: string | null;
    otherRole: string | null;
}

export interface ChatMessage {
    id: string;
    conversationId: string;
    senderId: string;
    receiverId: string;
    content: string;
    createdAt: string;
    status: "SENT" | "READ";
}

export interface SendMessagePayload {
    conversationId: string;
    senderId: string;
    receiverId: string;
    content: string;
}