import { createContext, useContext, useState, type ReactNode } from "react";

interface ChatContextValue {
    isOpen: boolean;
    // Nếu mở từ nút "Nhắn tin" ở trang giảng viên thì có sẵn accountId người nhận
    initialReceiverId: string | null;
    openChat: (receiverId?: string) => void;
    closeChat: () => void;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [initialReceiverId, setInitialReceiverId] = useState<string | null>(null);

    const openChat = (receiverId?: string) => {
        setInitialReceiverId(receiverId ?? null);
        setIsOpen(true);
    };

    const closeChat = () => {
        setIsOpen(false);
        setInitialReceiverId(null);
    };

    return (
        <ChatContext.Provider value={{ isOpen, initialReceiverId, openChat, closeChat }}>
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