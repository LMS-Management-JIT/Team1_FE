import { apiClient } from "./apiClient";

export interface RankResponse {
    studentId: string;
    studentName: string;
    avatarUrl: string;
    totalXp: number;
    currentRank: number;
    trend: 'UP' | 'DOWN' | 'SAME';
    badges: string[];
}
// Hàm giả định: Gọi API khởi tạo rank (Backend cần hỗ trợ logic: có rồi thì bỏ qua, chưa có thì insert rank=0)
export const initStudentRankIfNeeded = async (studentId: string) => {
    try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
        
        // Thay đổi endpoint này theo đúng thiết kế API thực tế của backend bạn
        await fetch(`${API_BASE_URL}/ranks/init`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentId, point: 0 }) 
        });
    } catch (error) {
        console.error("Lỗi khi khởi tạo rank cho học viên:", error);
    }
};

export const getLeaderboard = async () => {
    try {
        // apiClient sẽ tự động gắn token từ Cookie vào header
        // Đường dẫn ở đây phụ thuộc vào VITE_API_BASE_URL trong apiClient của bạn. 
        // Thường chỉ cần truyền '/ranks/leaderboard'
        const response = await apiClient.get('/ranks/leaderboard'); 
        
        // Axios tự động parse JSON, nên ta chỉ cần lấy response.data
        return response.data;
    } catch (error: any) {
        // Xử lý lỗi từ Axios
        if (error.response && error.response.status === 401) {
            throw new Error("Hết phiên đăng nhập. Vui lòng đăng nhập lại.");
        }
        throw new Error("Không thể tải bảng xếp hạng");
    }
};

export async function addXpToRank(studentId: string, xp: number, sourceId?: string): Promise<void> {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";
    
    // Gắn thêm sourceId vào URL nếu có
    let url = `${API_BASE_URL}/ranks/student/${studentId}/add-xp?xp=${xp}`;
    if (sourceId) {
        url += `&sourceId=${encodeURIComponent(sourceId)}`;
    }
    
    console.log(`⭐ [API RANK PUT] Đang gọi API cộng +${xp} XP. Nguồn: ${sourceId || 'Không xác định'}`);
    
    try {
        const response = await fetch(url, { method: 'PUT' });
        if (!response.ok) throw new Error(`Lỗi HTTP: ${response.status}`);
    } catch (error) {
        console.error("🚨 [API RANK FAILED] Lỗi Network khi cộng điểm:", error);
        throw error;
    }
}