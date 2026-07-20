import axios from 'axios'
import { useQuery, useMutation, useQueryClient, QueryClient } from '@tanstack/react-query'

export type User = {
    id: string         // Đây là Account ID
    studentId?: string // ID học viên trả về từ UserResponse ở Backend
    email: string
    role?: string
    username?: string
    createdAt?: string
}

export const authClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
    withCredentials: true,
    timeout: 15000,
})

// Hàm đọc token từ cookie
const getAccessToken = (): string | null => {
    const match = document.cookie.match(/(?:^|;\s*)accessToken=([^;]*)/)
    return match ? match[1] : null
}

export const getAuthConfig = () => {
    const token = getAccessToken()
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {}
}

// Interceptor request mặc định cho các API gọi sau này
authClient.interceptors.request.use(
    (config) => {
        const token = getAccessToken()
        if (token && !config.headers.Authorization) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

let globalQueryClient: QueryClient | null = null

// --- CÁC HÀM API CHÍNH ---

export async function login({ email, password }: { email: string; password: string }): Promise<{ token: string, studentId: string | null } | null> {
    const response = await authClient.post('/auth/login', { email, password })

    // ✅ ĐÃ SỬA: Backend trả về flat JSON, đọc thẳng từ response.data (không có wrapper accessTokenResponse)
    const tokenData = response.data;

    if (tokenData && tokenData.accessToken) {
        const token = tokenData.accessToken;
        const studentId = tokenData.studentId || null;

        // Lưu token vào Cookie
        document.cookie = `accessToken=${token}; path=/; SameSite=Lax;`

        // Đội thẳng token vào axios default header để request tiếp theo không cần chờ cookie
        authClient.defaults.headers.common['Authorization'] = `Bearer ${token}`

        // Lưu studentId vào localStorage dự phòng
        if (studentId) {
            localStorage.setItem('studentId', studentId);
        } else {
            localStorage.removeItem('studentId');
        }

        return { token, studentId };
    }

    return null;
}

// Lấy thông tin User hiện tại
export async function getCurrentUser(explicitToken?: string | null): Promise<User | null> {
    try {
        const token = explicitToken || getAccessToken()
        if (!token) return null;

        const config = { headers: { Authorization: `Bearer ${token}` } }
        const response = await authClient.get<User>('/auth/me', config)

        if (response.data?.studentId) {
            localStorage.setItem('studentId', response.data.studentId);
        } else {
            localStorage.removeItem('studentId');
        }

        return response.data
    } catch (error: any) {
        if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem('studentId');
            return null
        }
        throw error
    }
}

export async function logoutUser(): Promise<void> {
    try {
        await authClient.post('/auth/logout', {})
    } catch (e) {
        console.error("Logout API error", e)
    } finally {
        document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;'
        delete authClient.defaults.headers.common['Authorization']
        localStorage.removeItem('studentId');
        if (globalQueryClient) {
            globalQueryClient.clear()
            globalQueryClient.setQueryData(['auth', 'me'], null)
        }
    }
}

// --- CUSTOM HOOK ---
export function useAuth() {
    const qc = useQueryClient()
    globalQueryClient = qc

    const { data: user, isLoading, error } = useQuery({
        queryKey: ['auth', 'me'],
        queryFn: () => getCurrentUser(),
        retry: false,
        staleTime: 15 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: true,
    })

    const loginMutation = useMutation({
        mutationFn: login,
        onSuccess: async (loginResult) => {
            if (loginResult?.token) {
                authClient.defaults.headers.common['Authorization'] = `Bearer ${loginResult.token}`;

                // Lấy thông tin user ngay bằng token tươi — KHÔNG invalidate để tránh vòng lặp
                const freshUser = await getCurrentUser(loginResult.token)
                qc.setQueryData(['auth', 'me'], freshUser)
            }
        },
    })

    const logoutMutation = useMutation({
        mutationFn: logoutUser,
        onSuccess: () => {
            delete authClient.defaults.headers.common['Authorization'];
            qc.clear();
            qc.setQueryData(['auth', 'me'], null)
        },
    })

    return {
        user,
        accountId: user?.id || null,
        studentId: user ? (user.studentId || localStorage.getItem('studentId') || null) : null,
        isAuthenticated: !!user && !error,
        isLoading,
        error,
        login: loginMutation.mutateAsync,
        logout: logoutMutation.mutate,
        isLoggingIn: loginMutation.isPending,
        isLoggingOut: logoutMutation.isPending,
    }
}

// Response Interceptors tự động clear khi hết hạn token
authClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && globalQueryClient) {
            document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;'
            localStorage.removeItem('studentId');
            delete authClient.defaults.headers.common['Authorization'];
            globalQueryClient.setQueryData(['auth', 'me'], null)
        }
        return Promise.reject(error)
    }
)