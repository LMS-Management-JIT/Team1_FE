import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Bot, CircleAlert, Grip, LoaderCircle, MessageCircle, Send, Sparkles, X } from "lucide-react";
import { apiClient } from "../../../services/apiClient";

type Message = {
    id: string;
    role: "assistant" | "user";
    content: string;
    lessonId: string;
    lessonTitle: string;
};

type StoredTopicChat = {
    messages: Message[];
    remainingPrompts: number | null;
};

type AIChatResponse = {
    answer: string;
    remainingPrompts: number;
};

type AIUsageResponse = {
    limit: number;
    remainingPrompts: number;
};

type LessonAiAssistantProps = {
    topicId: string;
    topicName: string;
    lessonId: string;
    lessonTitle: string;
};

const DAILY_LIMIT = 5;
const suggestions = ["Tóm tắt bài này", "Giải thích dễ hiểu hơn", "Cho mình một ví dụ"];
const PANEL_SIZE_KEY = "lesson-ai-panel-size";
const MIN_PANEL_WIDTH = 360;
const MIN_PANEL_HEIGHT = 480;

type PanelSize = { width: number; height: number };

function clampPanelSize(size: PanelSize): PanelSize {
    const maxWidth = Math.max(320, window.innerWidth - 32);
    const maxHeight = Math.max(420, window.innerHeight - 120);
    return {
        width: Math.min(Math.max(size.width, Math.min(MIN_PANEL_WIDTH, maxWidth)), maxWidth),
        height: Math.min(Math.max(size.height, Math.min(MIN_PANEL_HEIGHT, maxHeight)), maxHeight),
    };
}

function loadPanelSize(): PanelSize {
    try {
        const raw = localStorage.getItem(PANEL_SIZE_KEY);
        if (raw) return clampPanelSize(JSON.parse(raw) as PanelSize);
    } catch {
        // Dùng kích thước mặc định nếu dữ liệu lưu trước đó không hợp lệ.
    }
    return clampPanelSize({ width: 420, height: 650 });
}

function storageKey(topicId: string) {
    return `lesson-ai-chat:${topicId}`;
}

function loadTopicChat(topicId: string): StoredTopicChat {
    try {
        const raw = localStorage.getItem(storageKey(topicId));
        if (!raw) return { messages: [], remainingPrompts: null };
        const parsed = JSON.parse(raw) as StoredTopicChat;
        return {
            messages: Array.isArray(parsed.messages) ? parsed.messages : [],
            remainingPrompts:
                typeof parsed.remainingPrompts === "number" && parsed.remainingPrompts >= 0
                    ? parsed.remainingPrompts
                    : null,
        };
    } catch {
        return { messages: [], remainingPrompts: null };
    }
}

export function LessonAiAssistant({ topicId, topicName, lessonId, lessonTitle }: LessonAiAssistantProps) {
    const initialChat = useMemo(() => loadTopicChat(topicId), [topicId]);
    const [isOpen, setIsOpen] = useState(false);
    const [draft, setDraft] = useState("");
    const [isReplying, setIsReplying] = useState(false);
    const [messages, setMessages] = useState<Message[]>(initialChat.messages);
    const [remainingPrompts, setRemainingPrompts] = useState<number | null>(initialChat.remainingPrompts);
    const [promptLimit, setPromptLimit] = useState(DAILY_LIMIT);
    const [error, setError] = useState<string | null>(null);
    const [panelSize, setPanelSize] = useState<PanelSize>(loadPanelSize);
    const [isResizing, setIsResizing] = useState(false);
    const endRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const resizeRef = useRef<{
        startX: number;
        startY: number;
        startWidth: number;
        startHeight: number;
    } | null>(null);

    useEffect(() => {
        const topicChat = loadTopicChat(topicId);
        setMessages(topicChat.messages);
        setRemainingPrompts(topicChat.remainingPrompts);
        setError(null);

        let cancelled = false;
        apiClient.get<AIUsageResponse>(`/ai/usage/${topicId}`)
            .then(({ data }) => {
                if (!cancelled) {
                    setPromptLimit(data.limit);
                    setRemainingPrompts(data.remainingPrompts);
                }
            })
            .catch(() => {
                if (!cancelled) setError("Chưa thể tải số lượt hỏi AI còn lại.");
            });

        return () => { cancelled = true; };
    }, [topicId]);

    useEffect(() => {
        localStorage.setItem(storageKey(topicId), JSON.stringify({ messages, remainingPrompts }));
    }, [messages, remainingPrompts, topicId]);

    useEffect(() => {
        const container = messagesContainerRef.current;
        if (!container) return;
        container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    }, [messages, isReplying]);

    useEffect(() => {
        if (!isOpen) return;
        const frameId = window.requestAnimationFrame(() => {
            const container = messagesContainerRef.current;
            if (container) container.scrollTop = container.scrollHeight;
        });
        return () => window.cancelAnimationFrame(frameId);
    }, [isOpen, lessonId, topicId]);

    useEffect(() => {
        const fitPanelToViewport = () => setPanelSize((current) => clampPanelSize(current));
        window.addEventListener("resize", fitPanelToViewport);
        return () => window.removeEventListener("resize", fitPanelToViewport);
    }, []);

    useEffect(() => {
        localStorage.setItem(PANEL_SIZE_KEY, JSON.stringify(panelSize));
    }, [panelSize]);

    useEffect(() => {
        if (!isResizing) return;

        const handlePointerMove = (event: PointerEvent) => {
            const start = resizeRef.current;
            if (!start) return;
            setPanelSize(clampPanelSize({
                width: start.startWidth + (start.startX - event.clientX),
                height: start.startHeight + (start.startY - event.clientY),
            }));
        };
        const stopResizing = () => {
            resizeRef.current = null;
            setIsResizing(false);
        };

        window.addEventListener("pointermove", handlePointerMove);
        window.addEventListener("pointerup", stopResizing);
        window.addEventListener("pointercancel", stopResizing);
        return () => {
            window.removeEventListener("pointermove", handlePointerMove);
            window.removeEventListener("pointerup", stopResizing);
            window.removeEventListener("pointercancel", stopResizing);
        };
    }, [isResizing]);

    const startResizing = (event: ReactPointerEvent<HTMLButtonElement>) => {
        event.preventDefault();
        resizeRef.current = {
            startX: event.clientX,
            startY: event.clientY,
            startWidth: panelSize.width,
            startHeight: panelSize.height,
        };
        setIsResizing(true);
    };

    const sendQuestion = async (question: string) => {
        const cleanQuestion = question.trim();
        if (!cleanQuestion || isReplying || remainingPrompts === 0) return;

        const userMessage: Message = {
            id: crypto.randomUUID(),
            role: "user",
            content: cleanQuestion,
            lessonId,
            lessonTitle,
        };

        setMessages((current) => [...current, userMessage]);
        setDraft("");
        setError(null);
        setIsReplying(true);

        try {
            const { data } = await apiClient.post<AIChatResponse>("/ai/chat", {
                topicId,
                lessonId,
                message: cleanQuestion,
                history: messages.slice(-8).map((message) => ({
                    role: message.role,
                    content: message.content,
                })),
            });

            setMessages((current) => [
                ...current,
                {
                    id: crypto.randomUUID(),
                    role: "assistant",
                    content: data.answer,
                    lessonId,
                    lessonTitle,
                },
            ]);
            if (data.remainingPrompts >= 0) {
                setRemainingPrompts(data.remainingPrompts);
            } else {
                setRemainingPrompts(null);
                setError("Chưa thể kiểm tra số lượt hỏi AI còn lại.");
            }
        } catch (requestError: any) {
            const status = requestError?.response?.status;
            setError(status === 401
                ? "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
                : "Chưa thể kết nối với trợ lý AI. Bạn thử lại sau nhé.");
        } finally {
            setIsReplying(false);
        }
    };

    const groupedMessages = messages.map((message, index) => ({
        ...message,
        showLessonLabel: index === 0 || messages[index - 1]?.lessonId !== message.lessonId,
    }));

    return (
        <>
            {isOpen && (
                <section
                    style={{ width: panelSize.width, height: panelSize.height }}
                    className={`fixed bottom-24 right-4 z-[80] flex max-h-[calc(100vh-120px)] max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-2xl shadow-slate-900/20 sm:right-6 ${isResizing ? "select-none" : ""}`}
                >
                    <button
                        type="button"
                        onPointerDown={startResizing}
                        aria-label="Kéo để thay đổi kích thước khung chat"
                        title="Kéo để phóng to hoặc thu nhỏ"
                        className="absolute left-1 top-1 z-10 hidden h-8 w-8 touch-none cursor-nwse-resize items-center justify-center rounded-full text-white/70 transition hover:bg-white/15 hover:text-white sm:flex"
                    >
                        <Grip size={16} className="-rotate-45" />
                    </button>
                    <header className="bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-4 text-white">
                        <div className="flex items-center gap-3">
                            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white/20"><Bot size={22} /></div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 font-bold">Trợ lý học tập <Sparkles size={14} /></div>
                                <p className="truncate text-xs text-orange-50">{topicName}</p>
                            </div>
                            <button onClick={() => setIsOpen(false)} aria-label="Đóng trợ lý AI" className="grid h-9 w-9 place-items-center rounded-full hover:bg-white/15"><X size={19} /></button>
                        </div>
                        <div className="mt-3 flex items-center justify-between rounded-xl bg-white/15 px-3 py-2 text-xs">
                            <span className="truncate pr-2">Đang xem: {lessonTitle}</span>
                            <strong className="shrink-0 rounded-full bg-white px-2.5 py-1 text-orange-600">
                                {remainingPrompts === null ? `${promptLimit} lượt/chương` : `Còn ${remainingPrompts}/${promptLimit} lượt`}
                            </strong>
                        </div>
                    </header>

                    <div ref={messagesContainerRef} className="flex-1 overflow-y-auto bg-orange-50/30 px-4 py-4">
                        {messages.length === 0 && (
                            <div className="rounded-2xl border border-orange-100 bg-white p-4 text-sm leading-6 text-slate-600 shadow-sm">
                                <p className="font-semibold text-slate-800">Chào bạn! Mình có thể hỗ trợ cả chương này.</p>
                                <p className="mt-1">Bạn có thể đổi qua các bài khác mà lịch sử trò chuyện vẫn được giữ lại.</p>
                            </div>
                        )}
                        <div className="flex flex-col gap-3">
                            {groupedMessages.map((message) => (
                                <div key={message.id}>
                                    {message.showLessonLabel && (
                                        <div className="my-3 flex items-center gap-2 text-[11px] font-medium text-slate-400 before:h-px before:flex-1 before:bg-slate-200 after:h-px after:flex-1 after:bg-slate-200">
                                            {message.lessonTitle}
                                        </div>
                                    )}
                                    <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                                        <div className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === "user" ? "rounded-br-md bg-orange-500 text-white" : "rounded-bl-md border border-slate-100 bg-white text-slate-700 shadow-sm"}`}>{message.content}</div>
                                    </div>
                                </div>
                            ))}
                            {isReplying && <div className="flex items-center gap-2 self-start rounded-2xl rounded-bl-md bg-white px-4 py-3 text-sm text-slate-500 shadow-sm"><LoaderCircle size={15} className="animate-spin text-orange-500" /> Đang phân tích bài học…</div>}
                            {error && <div className="flex gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-xs text-red-700"><CircleAlert size={16} className="shrink-0" />{error}</div>}
                            <div ref={endRef} />
                        </div>
                    </div>

                    <div className="border-t border-slate-100 bg-white p-3">
                        <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
                            {suggestions.map((suggestion) => <button key={suggestion} onClick={() => sendQuestion(suggestion)} disabled={isReplying || remainingPrompts === 0} className="shrink-0 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-700 hover:bg-orange-100 disabled:opacity-40">{suggestion}</button>)}
                        </div>
                        <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100">
                            <textarea value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void sendQuestion(draft); } }} disabled={remainingPrompts === 0} rows={1} placeholder={remainingPrompts === 0 ? "Bạn đã dùng hết lượt hỏi của chương này" : "Hỏi về nội dung bài học…"} className="max-h-28 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed" />
                            <button onClick={() => void sendQuestion(draft)} disabled={!draft.trim() || isReplying || remainingPrompts === 0} aria-label="Gửi câu hỏi" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-500 text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-40"><Send size={17} /></button>
                        </div>
                        <p className="mt-2 text-center text-[10px] text-slate-400">Lịch sử được lưu theo chương trên thiết bị này</p>
                    </div>
                </section>
            )}

            <button onClick={() => setIsOpen((current) => !current)} aria-label={isOpen ? "Đóng trợ lý AI" : "Mở trợ lý AI"} className="fixed bottom-5 right-4 z-[81] flex h-14 items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-4 text-white shadow-xl shadow-orange-500/30 transition hover:-translate-y-0.5 hover:shadow-2xl sm:right-6">
                {isOpen ? <X size={22} /> : <MessageCircle size={22} />}<span className="pr-1 text-sm font-bold">Hỏi AI</span>
                {remainingPrompts !== null && !isOpen && <span className="grid h-6 min-w-6 place-items-center rounded-full bg-white px-1 text-xs font-bold text-orange-600">{remainingPrompts}</span>}
            </button>
        </>
    );
}
