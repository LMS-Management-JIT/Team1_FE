import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthContext } from "../feature/auth/context/AuthContext";
import {
    getContactsOfUser,
    getMessages,
    getOrCreateConversation,
} from "../services/chatService";
import { chatSocketService } from "../services/chatSocketService";
import type { ChatMessage } from "../types/chat";

export function useChat(isOpen: boolean, initialReceiverId: string | null) {
    const { user } = useAuthContext();
    const accountId = user?.uid ?? null;
    const queryClient = useQueryClient();

    // Chọn theo otherAccountId (luôn tồn tại) thay vì conversationId,
    // vì với người chưa từng chat thì conversationId = null (chưa có document thật)
    const [selectedOtherAccountId, setSelectedOtherAccountId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [socketReady, setSocketReady] = useState(false);
    const [isSending, setIsSending] = useState(false);

    // Lấy TOÀN BỘ giáo viên/học sinh có thể chat, không chỉ những người đã có hội thoại
    const conversationsQuery = useQuery({
        queryKey: ["chat-contacts", accountId],
        queryFn: () => getContactsOfUser(accountId as string),
        enabled: Boolean(accountId) && isOpen,
    });

    const conversations = conversationsQuery.data ?? [];
    const selectedConversation =
        conversations.find((c) => c.otherAccountId === selectedOtherAccountId) ?? null;
    const selectedConversationId = selectedConversation?.id ?? null;

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
            setSelectedOtherAccountId(null);
        };
    }, [isOpen]);

    // Nếu mở modal kèm sẵn 1 người nhận (bấm "Nhắn tin" từ trang giảng viên)
    // -> tự chọn luôn người đó, dù đã có hội thoại hay chưa
    useEffect(() => {
        if (!isOpen || !accountId || !initialReceiverId) return;
        setSelectedOtherAccountId(initialReceiverId);
    }, [isOpen, accountId, initialReceiverId]);

    // Tải lịch sử tin nhắn mỗi khi đổi hội thoại đang xem (chỉ khi đã có conversation thật)
    useEffect(() => {
        if (!selectedConversationId) {
            setMessages([]);
            return;
        }
        getMessages(selectedConversationId)
            .then(setMessages)
            .catch(() => {
                setMessages([]);
                toast.error("Không tải được lịch sử tin nhắn, thử lại sau.");
            });
    }, [selectedConversationId]);

    // Subscribe socket đúng hội thoại đang chọn
    useEffect(() => {
        if (!socketReady || !selectedConversationId) return;

        chatSocketService.subscribeToConversation(selectedConversationId, (message) => {
            setMessages((prev) => [...prev, message]);
            queryClient.invalidateQueries({ queryKey: ["chat-contacts", accountId] });
        });

        return () => chatSocketService.unsubscribeFromConversation(selectedConversationId);
    }, [socketReady, selectedConversationId, queryClient, accountId]);

    const sendMessage = async (content: string) => {
        if (!accountId || !selectedConversation || !content.trim()) return;

        const receiverId = selectedConversation.otherAccountId;
        if (!receiverId) return;

        let conversationId = selectedConversation.id;

        // Chưa từng chat với người này -> tạo conversation thật ngay khi gửi tin nhắn đầu tiên
        if (!conversationId) {
            try {
                setIsSending(true);
                const created = await getOrCreateConversation(accountId, receiverId);
                conversationId = created.id;

                if (conversationId) {
                    chatSocketService.subscribeToConversation(conversationId, (message) => {
                        setMessages((prev) => [...prev, message]);
                        queryClient.invalidateQueries({ queryKey: ["chat-contacts", accountId] });
                    });
                }

                queryClient.invalidateQueries({ queryKey: ["chat-contacts", accountId] });
            } catch {
                toast.error("Không thể bắt đầu cuộc trò chuyện, thử lại sau.");
                return;
            } finally {
                setIsSending(false);
            }
        }

        if (!conversationId) return;

        chatSocketService.sendMessage({
            conversationId,
            senderId: accountId,
            receiverId,
            content: content.trim(),
        });
    };

    return {
        accountId,
        conversations,
        isLoadingConversations: conversationsQuery.isLoading,
        selectedConversationId,
        selectedConversation,
        messages,
        selectConversation: setSelectedOtherAccountId,
        sendMessage,
        isSending,
    };
}