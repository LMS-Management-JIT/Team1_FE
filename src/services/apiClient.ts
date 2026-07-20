import axios from "axios";
import { authClient } from "./authService"; // 💡 ĐÃ THÊM: Import authClient để đồng bộ token tươi tức thì

console.log(import.meta.env.VITE_API_BASE_URL);

export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
    timeout: 30000,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// Hàm đọc nhanh token từ cookie dự phòng
const getFreshCookieToken = (): string | null => {
    const match = document.cookie.match(/(?:^|;\s*)accessToken=([^;]*)/);
    return match ? match[1] : null;
};

// 💡 ĐÃ TỐI ƯU INTERCEPTOR REQUEST: Lấy token tươi đồng bộ từ hệ thống, loại bỏ độ trễ của cookie
apiClient.interceptors.request.use((config) => {
    // 1. Ưu tiên lấy token đã được gán sẵn trong authClient (được gán ngay khi login thành công)
    let token = authClient.defaults.headers.common['Authorization'];

    // 2. Nếu chưa có (khi F5 làm mới trang), tiến hành bốc từ cookie mới nhất
    if (!token) {
        const rawToken = getFreshCookieToken();
        if (rawToken) token = `Bearer ${rawToken}`;
    }

    if (token) {
        config.headers.Authorization = token;
    }

    return config;
}, (error) => Promise.reject(error));

// 💡 ĐÃ TỐI ƯU INTERCEPTOR RESPONSE: Khi hết hạn hoặc lỗi xác thực, dọn sạch bộ nhớ đồng bộ toàn hệ thống
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.warn("🛑 Phiên đăng nhập hết hạn hoặc không hợp lệ tại apiClient. Tiến hành dọn dẹp bộ nhớ...");

            // Xóa sạch cookie token
            document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

            // Xóa sạch studentId để bảo vệ luồng dữ liệu học viên
            localStorage.removeItem('studentId');

            // Xóa token trong cấu hình mặc định
            delete authClient.defaults.headers.common['Authorization'];
        }
        return Promise.reject(error);
    }
);

export type ApiListEnvelope<T> = {
    data?: T;
    documents?: T;
    lessons?: T;
    topics?: T;
    content?: T;
};

export function asArray<T>(value: T[] | ApiListEnvelope<T> | unknown): T[] {
    if (Array.isArray(value)) {
        return value;
    }

    if (value && typeof value === "object") {
        const envelope = value as ApiListEnvelope<T>;

        return (
            (envelope.data as T[] | undefined) ??
            (envelope.documents as T[] | undefined) ??
            (envelope.lessons as T[] | undefined) ??
            (envelope.topics as T[] | undefined) ??
            (envelope.content as T[] | undefined) ??
            []
        );
    }

    return [];
}