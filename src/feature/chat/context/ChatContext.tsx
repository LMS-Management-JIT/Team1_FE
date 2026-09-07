import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { useAuthContext } from "../../auth/context/AuthContext";
import { chatSocketService } from "../../../services/chatSocketService";
import type { ChatMessage } from "../../../types/chat";

interface ChatContextValue {
    isOpen: boolean;
    // Nếu mở từ nút "Nhắn tin" ở trang giảng viên thì có sẵn accountId người nhận
    initialReceiverId: string | null;
    openChat: (receiverId?: string) => void;
    closeChat: () => void;
    // 🔔 Số tin nhắn mới chưa xem, hiển thị badge đỏ trên icon "Tin nhắn" ở Header
    unreadCount: number;
    // Cuộc trò chuyện đang được mở xem trong ChatModal (để không toast trùng tin đã hiện sẵn trong khung chat)
    activeConversationId: string | null;
    setActiveConversationId: (id: string | null) => void;
    socketReady: boolean;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
    const { user } = useAuthContext();
    const accountId = user?.uid ?? null;

    const [isOpen, setIsOpen] = useState(false);
    const [initialReceiverId, setInitialReceiverId] = useState<string | null>(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [socketReady, setSocketReady] = useState(false);

    // Dùng ref để đọc giá trị mới nhất trong callback socket mà không phải re-subscribe liên tục
    const isOpenRef = useRef(isOpen);
    const activeConversationIdRef = useRef(activeConversationId);
    useEffect(() => { isOpenRef.current = isOpen; }, [isOpen]);
    useEffect(() => { activeConversationIdRef.current = activeConversationId; }, [activeConversationId]);

    // 🔌 Giữ 1 kết nối socket DUY NHẤT, SỐNG SUỐT PHIÊN ĐĂNG NHẬP — không phụ thuộc
    // việc mở/đóng khung chat, để vẫn nhận được thông báo tin nhắn mới dù đang đóng chat.
    useEffect(() => {
        if (!accountId) {
            chatSocketService.disconnect();
            setSocketReady(false);
            return;
        }

        chatSocketService.connect(
            () => {
                setSocketReady(true);
                chatSocketService.subscribeToUserNotifications(accountId, (message: ChatMessage) => {
                    // Đang mở đúng cuộc trò chuyện này trong khung chat -> tin nhắn đã tự hiện
                    // trong luồng chat rồi, không cần toast thêm để tránh trùng lặp.
                    const alreadyVisible =
                        isOpenRef.current && activeConversationIdRef.current === message.conversationId;
                    if (alreadyVisible) return;

                    setUnreadCount((prev) => prev + 1);
                    toast("Tin nhắn mới", {
                        description: message.content,
                        duration: 5000,
                        position: "top-right",
                        icon: "💬",
                        style: {
                            background: "#fff7ed",
                            border: "1px solid #ffedd5",
                            color: "#c2410c",
                            borderRadius: "12px",
                            fontWeight: "500",
                        },
                    });
                });
            },
            () => {
                // Lỗi kết nối: im lặng, ChatModal khi mở lên sẽ tự báo qua toast lỗi riêng nếu cần.
            }
        );

        return () => {
            chatSocketService.unsubscribeFromUserNotifications(accountId);
        };
    }, [accountId]);

    const openChat = (receiverId?: string) => {
        setInitialReceiverId(receiverId ?? null);
        setIsOpen(true);
        setUnreadCount(0); // Mở khung chat coi như đã xem hộp thư
    };

    const closeChat = () => {
        setIsOpen(false);
        setInitialReceiverId(null);
        setActiveConversationId(null);
    };

    return (
        <ChatContext.Provider
            value={{
                isOpen,
                initialReceiverId,
                openChat,
                closeChat,
                unreadCount,
                activeConversationId,
                setActiveConversationId,
                socketReady,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
}

export function useChatContext() {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error("useChatContext must be used within ChatProvider");
    }
    return context;
}