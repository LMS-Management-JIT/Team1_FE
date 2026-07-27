import { useEffect, useMemo, useRef, useState } from "react";
import { Send, X } from "lucide-react";
import { useChatContext } from "../context/ChatContext";
import { useChat } from "../../../hooks/useChat";
import type { ChatConversation } from "../../../types/chat";

function getInitials(name: string | null): string {
    if (!name) return "??";
    const parts = name.trim().split(/\s+/);
    const lastTwo = parts.slice(-2);
    return lastTwo.map((p) => p[0]?.toUpperCase() ?? "").join("");
}

function formatTime(iso: string | null): string {
    if (!iso) return "";
    const date = new Date(iso);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
        return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    }
    return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
}

export function ChatModal() {
    const { isOpen, initialReceiverId, closeChat } = useChatContext();
    const {
        accountId,
        conversations,
        isLoadingConversations,
        selectedConversation,
        messages,
        selectConversation,
        sendMessage,
    } = useChat(isOpen, initialReceiverId);

    const [activeTab, setActiveTab] = useState<"TEACHER" | "STUDENT">("TEACHER");
    const [draft, setDraft] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const filteredConversations = useMemo(
        () => conversations.filter((c) => c.otherRole === activeTab),
        [conversations, activeTab]
    );

    if (!isOpen) return null;

    const handleSend = () => {
        if (!draft.trim()) return;
        sendMessage(draft);
        setDraft("");
    };

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 px-4">
            <div className="flex h-[560px] w-full max-w-[820px] overflow-hidden rounded-2xl bg-white shadow-2xl">

                {/* Khung trái: danh sách hội thoại */}
                <div className="flex w-[280px] shrink-0 flex-col border-r border-gray-100">
                    <div className="px-4 pb-2 pt-4 text-[15px] font-semibold text-[#202020]">
                        Tin nhắn
                    </div>

                    <div className="flex gap-1.5 px-3 pb-3">
                        <button
                            onClick={() => setActiveTab("TEACHER")}
                            className={`h-8 flex-1 rounded-full text-[13px] transition ${
                                activeTab === "TEACHER"
                                    ? "bg-[#ff6b13] text-white"
                                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                            }`}
                        >
                            Giảng viên
                        </button>
                        <button
                            onClick={() => setActiveTab("STUDENT")}
                            className={`h-8 flex-1 rounded-full text-[13px] transition ${
                                activeTab === "STUDENT"
                                    ? "bg-[#ff6b13] text-white"
                                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                            }`}
                        >
                            Học sinh
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {isLoadingConversations && (
                            <p className="px-4 py-6 text-center text-sm text-gray-400">
                                Đang tải...
                            </p>
                        )}

                        {!isLoadingConversations && filteredConversations.length === 0 && (
                            <p className="px-4 py-6 text-center text-sm text-gray-400">
                                Chưa có cuộc trò chuyện nào.
                            </p>
                        )}

                        {filteredConversations.map((conversation: ChatConversation) => (
                            <button
                                key={conversation.otherAccountId}
                                onClick={() => selectConversation(conversation.otherAccountId)}
                                className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-left transition ${
                                    conversation.otherAccountId === selectedConversation?.otherAccountId
                                        ? "bg-orange-50"
                                        : "hover:bg-gray-50"
                                }`}
                            >
                                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-orange-100 text-[13px] font-semibold text-[#ff6b13]">
                                    {getInitials(conversation.otherFullName)}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-[13.5px] font-medium text-[#202020]">
                                        {conversation.otherFullName || "Người dùng"}
                                    </p>
                                    <p className="truncate text-xs text-gray-500">
                                        {conversation.lastMessage || "Hãy bắt đầu cuộc trò chuyện"}
                                    </p>
                                </div>
                                <span className="shrink-0 text-[11px] text-gray-400">
                                    {formatTime(conversation.lastMessageTime)}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Khung phải: nội dung trò chuyện */}
                <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-gray-100 px-4.5">
                        {selectedConversation ? (
                            <>
                                <div className="grid h-8.5 w-8.5 place-items-center rounded-full bg-orange-100 text-xs font-semibold text-[#ff6b13]">
                                    {getInitials(selectedConversation.otherFullName)}
                                </div>
                                <p className="flex-1 truncate text-sm font-semibold text-[#202020]">
                                    {selectedConversation.otherFullName || "Người dùng"}
                                </p>
                            </>
                        ) : (
                            <p className="flex-1 text-sm text-gray-400">
                                Chọn 1 cuộc trò chuyện để bắt đầu
                            </p>
                        )}
                        <button
                            onClick={closeChat}
                            className="grid h-8 w-8 place-items-center rounded-full text-gray-500 hover:bg-gray-100"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4.5 py-4">
                        {!selectedConversation && (
                            <div className="grid h-full place-items-center text-sm text-gray-400">
                                Chưa có tin nhắn nào được chọn
                            </div>
                        )}

                        {selectedConversation && messages.length === 0 && (
                            <div className="grid h-full place-items-center text-sm text-gray-400">
                                Hãy bắt đầu cuộc trò chuyện
                            </div>
                        )}

                        <div className="flex flex-col gap-2">
                            {messages.map((message) => {
                                const isMine = message.senderId === accountId;
                                return (
                                    <div
                                        key={message.id}
                                        className={`max-w-[70%] rounded-2xl px-3.5 py-2 text-[13.5px] ${
                                            isMine
                                                ? "self-end rounded-br-md bg-[#ff6b13] text-white"
                                                : "self-start rounded-bl-md bg-gray-100 text-[#202020]"
                                        }`}
                                    >
                                        {message.content}
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2 border-t border-gray-100 px-3.5 py-2.5">
                        <input
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            disabled={!selectedConversation}
                            placeholder="Nhập tin nhắn..."
                            className="h-9 flex-1 rounded-full bg-gray-100 px-4 text-sm outline-none placeholder:text-gray-400 disabled:opacity-50"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!selectedConversation || !draft.trim()}
                            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#ff6b13] text-white transition disabled:opacity-40"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}