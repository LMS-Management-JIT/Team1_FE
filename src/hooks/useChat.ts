import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthContext } from "../feature/auth/context/AuthContext";
import {
    getConversationsOfUser,
    getMessages,
    getOrCreateConversation,
} from "../services/chatService";
import { chatSocketService } from "../services/chatSocketService";
import type { ChatMessage } from "../types/chat";

export function useChat(isOpen: boolean, initialReceiverId: string | null) {
    const { user } = useAuthContext();
    const accountId = user?.uid ?? null;
    const queryClient = useQueryClient();

    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [socketReady, setSocketReady] = useState(false);

    const conversationsQuery = useQuery({
        queryKey: ["chat-conversations", accountId],
        queryFn: () => getConversationsOfUser(accountId as string),
        enabled: Boolean(accountId) && isOpen,
    });

    // Connect / disconnect socket theo trạng thái đóng mở modal
    useEffect(() => {
        if (!isOpen) return;

        chatSocketService.connect(
            () => setSocketReady(true),
            () => toast.error("Mất kết nối chat, đang thử kết nối lại...")
        );

        return () => {
            chatSocketService.disconnect();
            setSocketReady(false);
            setSelectedConversationId(null);
        };
    }, [isOpen]);

    // Nếu mở modal kèm sẵn 1 người nhận (bấm "Nhắn tin" từ trang giảng viên)
    // -> tạo/lấy conversation rồi tự chọn luôn hội thoại đó
    useEffect(() => {
        if (!isOpen || !accountId || !initialReceiverId) return;

        getOrCreateConversation(accountId, initialReceiverId).then((conversation) => {
            setSelectedConversationId(conversation.id);
            queryClient.invalidateQueries({ queryKey: ["chat-conversations", accountId] });
        });
    }, [isOpen, accountId, initialReceiverId, queryClient]);

    // Tải lịch sử tin nhắn mỗi khi đổi hội thoại đang xem
    useEffect(() => {
        if (!selectedConversationId) {
            setMessages([]);
            return;
        }
        getMessages(selectedConversationId).then(setMessages);
    }, [selectedConversationId]);

    // Subscribe socket đúng hội thoại đang chọn
    useEffect(() => {
        if (!socketReady || !selectedConversationId) return;

        chatSocketService.subscribeToConversation(selectedConversationId, (message) => {
            setMessages((prev) => [...prev, message]);
            queryClient.invalidateQueries({ queryKey: ["chat-conversations", accountId] });
        });

        return () => chatSocketService.unsubscribeFromConversation(selectedConversationId);
    }, [socketReady, selectedConversationId, queryClient, accountId]);

    const sendMessage = (content: string) => {
        if (!accountId || !selectedConversationId || !content.trim()) return;

        const conversation = conversationsQuery.data?.find((c) => c.id === selectedConversationId);
        if (!conversation?.otherAccountId) return;

        chatSocketService.sendMessage({
            conversationId: selectedConversationId,
            senderId: accountId,
            receiverId: conversation.otherAccountId,
            content: content.trim(),
        });
    };

    return {
        accountId,
        conversations: conversationsQuery.data ?? [],
        isLoadingConversations: conversationsQuery.isLoading,
        selectedConversationId,
        selectedConversation:
            conversationsQuery.data?.find((c) => c.id === selectedConversationId) ?? null,
        messages,
        selectConversation: setSelectedConversationId,
        sendMessage,
    };
}