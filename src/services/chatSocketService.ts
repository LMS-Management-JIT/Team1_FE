import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import type { ChatMessage, SendMessagePayload } from "../types/chat";

// Tự suy ra URL socket từ VITE_API_BASE_URL (bỏ hậu tố /api, thêm /ws)
const SOCKET_URL =
    (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api").replace(/\/api\/?$/, "") +
    "/ws";

// Lấy JWT hiện tại để đính kèm vào STOMP CONNECT (giống cách apiClient lấy token).
// Không thể set header Authorization cho request handshake của SockJS (/ws/info, /ws/xhr...),
// nên token phải được gửi qua connectHeaders của STOMP, backend sẽ đọc ở CONNECT frame.
function getAuthToken(): string | null {
    const match = document.cookie.match(/(?:^|;\s*)accessToken=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : null;
}

class ChatSocketService {
    private client: Client | null = null;
    private subscriptions = new Map<string, StompSubscription>();

    connect(onConnected?: () => void, onError?: (error: unknown) => void) {
        if (this.client?.active) {
            onConnected?.();
            return;
        }

        const token = getAuthToken();

        this.client = new Client({
            webSocketFactory: () => new SockJS(SOCKET_URL) as any,
            connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
            reconnectDelay: 4000,
            onConnect: () => onConnected?.(),
            onStompError: (frame) => onError?.(frame),
            onWebSocketError: (event) => onError?.(event),
        });

        this.client.activate();
    }

    disconnect() {
        this.subscriptions.forEach((sub) => sub.unsubscribe());
        this.subscriptions.clear();
        this.client?.deactivate();
        this.client = null;
    }

    subscribeToConversation(conversationId: string, onMessage: (message: ChatMessage) => void) {
        if (!this.client || !this.client.active) return;

        // Tránh subscribe trùng khi user đổi qua đổi lại giữa các hội thoại
        this.unsubscribeFromConversation(conversationId);

        const subscription = this.client.subscribe(
            `/topic/chat/${conversationId}`,
            (frame: IMessage) => {
                const message: ChatMessage = JSON.parse(frame.body);
                onMessage(message);
            }
        );

        this.subscriptions.set(conversationId, subscription);
    }

    unsubscribeFromConversation(conversationId: string) {
        const existing = this.subscriptions.get(conversationId);
        if (existing) {
            existing.unsubscribe();
            this.subscriptions.delete(conversationId);
        }
    }

    sendMessage(payload: SendMessagePayload) {
        if (!this.client || !this.client.active) return;

        this.client.publish({
            destination: "/app/chat.send",
            body: JSON.stringify(payload),
        });
    }
}

// Singleton — dùng chung 1 kết nối cho toàn app, tránh mở nhiều socket cùng lúc
export const chatSocketService = new ChatSocketService();