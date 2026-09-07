export interface ChatConversation {
    // id = null nghĩa là chưa từng nhắn tin với người này (liên hệ "ảo" từ danh sách giáo viên/học sinh)
    // -> chỉ tạo conversation thật khi người dùng gửi tin nhắn đầu tiên
    id: string | null;
    participants: string[] | null;
    lastMessage: string | null;
    lastMessageTime: string | null;
    createdAt: string | null;
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