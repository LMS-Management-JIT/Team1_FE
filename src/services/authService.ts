import axios from 'axios'
import { useQuery, useMutation, useQueryClient, QueryClient } from '@tanstack/react-query'
import { logoutOneSignal } from '../config/oneSignal';
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

export async function login({ email, password }: { email: string; password: string }): Promise<{ token: string, studentId: string | null, oneSignalHash: string | null } | null> {
    const response = await authClient.post('/auth/login', { email, password })

    const tokenData = response.data;

    if (tokenData && tokenData.accessToken) {
        const token = tokenData.accessToken;
        const studentId = tokenData.studentId || null;
        const oneSignalHash = tokenData.oneSignalHash || null; // BỔ SUNG

        document.cookie = `accessToken=${token}; path=/; SameSite=Lax;`
        authClient.defaults.headers.common['Authorization'] = `Bearer ${token}`

        if (studentId) {
            localStorage.setItem('studentId', studentId);
        } else {
            localStorage.removeItem('studentId');
        }

        // BỔ SUNG: lưu hash để dùng lại khi F5 (DashboardUserPage mount lại, không qua LoginPage)
        if (oneSignalHash) {
            localStorage.setItem('oneSignalHash', oneSignalHash);
        } else {
            localStorage.removeItem('oneSignalHash');
        }

        return { token, studentId, oneSignalHash };
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
        await logoutOneSignal();
    } catch (e) {
        console.error("Lỗi khi đăng xuất OneSignal:", e);
    }
    try {
        await authClient.post('/auth/logout', {})
    } catch (e) {
        console.error("Logout API error", e)
    } finally {
        document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;'
        delete authClient.defaults.headers.common['Authorization']
        localStorage.removeItem('studentId');
        localStorage.removeItem('oneSignalHash'); // BỔ SUNG
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
            // Gộp bước đăng nhập và lấy thông tin User vào chung 1 luồng
            mutationFn: async (credentials: { email: string; password: string }) => {
                const loginResult = await login(credentials);
                if (loginResult?.token) {
                    // Đội token vào header ngay lập tức
                    authClient.defaults.headers.common['Authorization'] = `Bearer ${loginResult.token}`;

                    // Lấy thông tin user ngay bằng token tươi
                    const freshUser = await getCurrentUser(loginResult.token);

                    // Trả về cả token data và user profile
                    return { ...loginResult, user: freshUser };
                }
                return null;
            },
            onSuccess: (data) => {
                if (data?.user) {
                    // Cập nhật state của React Query
                    qc.setQueryData(['auth', 'me'], data.user);
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
        oneSignalHash: user ? localStorage.getItem('oneSignalHash') : null, // BỔ SUNG
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
            logoutOneSignal().catch(console.error);
            document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;'
            localStorage.removeItem('studentId');
            localStorage.removeItem('oneSignalHash'); // BỔ SUNG
            delete authClient.defaults.headers.common['Authorization'];
            globalQueryClient.setQueryData(['auth', 'me'], null)
        }
        return Promise.reject(error)
    }
)