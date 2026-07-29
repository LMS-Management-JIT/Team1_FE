import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthContext } from "../feature/auth/context/AuthContext";
import { useChatContext } from "../feature/chat/context/ChatContext";
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

    // socketReady giờ do ChatContext quản lý (kết nối sống suốt phiên đăng nhập,
    // không phụ thuộc việc modal chat đang mở hay đóng)
    const { socketReady, setActiveConversationId } = useChatContext();

    // Chọn theo otherAccountId (luôn tồn tại) thay vì conversationId,
    // vì với người chưa từng chat thì conversationId = null (chưa có document thật)
    const [selectedOtherAccountId, setSelectedOtherAccountId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
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

    // Giữ id hội thoại đang mở trong ref để dùng lại trong callback onConnect (tránh closure cũ)
    const activeConversationIdRef = useRef<string | null>(null);
    useEffect(() => {
        activeConversationIdRef.current = selectedConversationId;
    }, [selectedConversationId]);

    // Báo lên ChatContext biết đang xem cuộc trò chuyện nào, để kênh thông báo toàn cục
    // (chat-notify) không toast trùng tin đã hiện sẵn ngay trong khung chat này.
    useEffect(() => {
        setActiveConversationId(isOpen ? selectedConversationId : null);
        return () => setActiveConversationId(null);
    }, [isOpen, selectedConversationId, setActiveConversationId]);

    // Gộp 1 nơi xử lý tin nhắn đến từ socket, dùng chung cho lần subscribe đầu
    // và lần subscribe khi vừa tạo conversation mới trong sendMessage()
    const handleIncomingMessage = (message: ChatMessage) => {
        setMessages((prev) => {
            // Nếu đây là tin nhắn do CHÍNH mình gửi vọng lại (đã hiển thị optimistic trước đó
            // với id tạm "temp-..."), thay thế bản tạm bằng bản thật từ server thay vì thêm trùng
            if (message.senderId === accountId) {
                const withoutOptimistic = prev.filter(
                    (m) => !(m.id.startsWith("temp-") && m.content === message.content)
                );
                if (withoutOptimistic.some((m) => m.id === message.id)) return withoutOptimistic;
                return [...withoutOptimistic, message];
            }
            if (prev.some((m) => m.id === message.id)) return prev; // tránh trùng lặp
            return [...prev, message];
        });
        queryClient.invalidateQueries({ queryKey: ["chat-contacts", accountId] });
    };

    // Nếu mở modal kèm sẵn 1 người nhận (bấm "Nhắn tin" từ trang giảng viên)
    // -> tự chọn luôn người đó, dù đã có hội thoại hay chưa
    useEffect(() => {
        if (!isOpen || !accountId || !initialReceiverId) return;
        setSelectedOtherAccountId(initialReceiverId);
    }, [isOpen, accountId, initialReceiverId]);

    useEffect(() => {
        if (!isOpen) setSelectedOtherAccountId(null);
    }, [isOpen]);

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

    // Đồng bộ lại lịch sử mỗi khi socket vừa (re)connect thành công — phòng trường hợp
    // vừa mất kết nối tạm thời và bỏ lỡ tin nhắn của đối phương trong lúc đó.
    useEffect(() => {
        if (!socketReady) return;
        const currentId = activeConversationIdRef.current;
        if (!currentId) return;
        getMessages(currentId)
            .then((history) => {
                setMessages((prev) => {
                    const pendingOptimistic = prev.filter((m) => m.id.startsWith("temp-"));
                    return [...history, ...pendingOptimistic];
                });
            })
            .catch(() => {
                /* im lặng bỏ qua, không phải lỗi nghiêm trọng */
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socketReady]);

    // Subscribe socket đúng hội thoại đang chọn
    useEffect(() => {
        if (!socketReady || !selectedConversationId) return;

        chatSocketService.subscribeToConversation(selectedConversationId, handleIncomingMessage);

        return () => chatSocketService.unsubscribeFromConversation(selectedConversationId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socketReady, selectedConversationId, queryClient, accountId]);

    const sendMessage = async (content: string) => {
        if (!accountId || !selectedConversation || !content.trim()) return;

        const trimmed = content.trim();
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
                    chatSocketService.subscribeToConversation(conversationId, handleIncomingMessage);
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

        // 🔑 OPTIMISTIC UPDATE: hiển thị ngay tin nhắn vừa gửi trên UI của người gửi,
        // không đợi server đẩy ngược lại qua WebSocket mới render.
        const optimisticMessage: ChatMessage = {
            id: `temp-${Date.now()}`,
            conversationId,
            senderId: accountId,
            receiverId,
            content: trimmed,
            createdAt: new Date().toISOString(),
            status: "SENT",
        };
        setMessages((prev) => [...prev, optimisticMessage]);

        chatSocketService.sendMessage({
            conversationId,
            senderId: accountId,
            receiverId,
            content: trimmed,
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