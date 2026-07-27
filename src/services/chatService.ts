import { apiClient } from "./apiClient";
import type { ChatConversation, ChatMessage } from "../types/chat";

export async function getOrCreateConversation(
    senderId: string,
    receiverId: string
): Promise<ChatConversation> {
    const response = await apiClient.post<ChatConversation>("chat/conversations", {
        senderId,
        receiverId,
    });
    return response.data;
}

export async function getConversationsOfUser(accountId: string): Promise<ChatConversation[]> {
    const response = await apiClient.get<ChatConversation[]>("chat/conversations", {
        params: { accountId },
    });
    return response.data;
}

// Danh sách TẤT CẢ giáo viên/học sinh có thể nhắn tin (kể cả chưa từng chat lần nào)
export async function getContactsOfUser(accountId: string): Promise<ChatConversation[]> {
    const response = await apiClient.get<ChatConversation[]>("chat/contacts", {
        params: { accountId },
    });
    return response.data;
}

export async function getMessages(conversationId: string): Promise<ChatMessage[]> {
    const response = await apiClient.get<ChatMessage[]>(
        `chat/conversations/${conversationId}/messages`
    );
    return response.data;
}

export async function markConversationAsRead(
    conversationId: string,
    receiverId: string
): Promise<void> {
    await apiClient.put(`chat/conversations/${conversationId}/read`, null, {
        params: { receiverId },
    });
}