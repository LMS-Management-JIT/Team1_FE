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
export const processLeaderboardRanks = (leaderboard: RankResponse[]): RankResponse[] => {
    // 1. Clone và sắp xếp lại mảng theo XP giảm dần
    const sorted = [...leaderboard].sort((a, b) => b.totalXp - a.totalXp);

    if (sorted.length === 0) return [];

    let currentRank = 1;
    const RANK_CAP = 999;

    // Gán hạng cho người Top 1
    sorted[0].currentRank = currentRank;

    for (let i = 1; i < sorted.length; i++) {
        const prevUser = sorted[i - 1];
        const currUser = sorted[i];

        // 2. CÔNG THỨC MỚI: CHỈ ĐỒNG HẠNG KHI ĐIỂM BẰNG NHAU CHÍNH XÁC
        if (prevUser.totalXp === currUser.totalXp) {
            // Nhóm đồng hạng: Lấy hạng của người liền trước
            currUser.currentRank = currentRank;
        } else {
            // Không đồng hạng: Hạng tiếp theo sẽ bằng vị trí index + 1
            // Ví dụ: A (Hạng 1), B (Hạng 1) -> C sẽ là Hạng 3
            currentRank = i + 1;
            currUser.currentRank = currentRank;
        }

        // 3. GIỚI HẠN THẤP NHẤT LÀ #999
        if (currUser.currentRank > RANK_CAP) {
            currUser.currentRank = RANK_CAP;
        }
    }

    return sorted;
};
export const getLeaderboard = async () => {
    try {
        const response = await apiClient.get('/ranks/leaderboard');
        
        // Nhận dữ liệu gốc từ Backend
        const rawData: RankResponse[] = response.data;

        // Xử lý logic đồng hạng và chốt max 999 trước khi trả về cho UI
        const processedData = processLeaderboardRanks(rawData);

        return processedData;
    } catch (error: any) {
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