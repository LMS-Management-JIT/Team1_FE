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

export const initStudentRankIfNeeded = async (_studentId: string) => {
    return;
};

export const getLeaderboard = async () => {
    try {
        // apiClient tự động gắn Bearer token qua interceptor (xem apiClient.ts)
        const response = await apiClient.get('/ranks/leaderboard');
        return response.data;
    } catch (error: any) {
        if (error.response && error.response.status === 401) {
            throw new Error("Hết phiên đăng nhập. Vui lòng đăng nhập lại.");
        }
        throw new Error("Không thể tải bảng xếp hạng");
    }
};

export async function addXpToRank(studentId: string, xp: number, sourceId?: string): Promise<void> {
    try {
        console.log(`⭐ [API RANK PUT] Đang gọi API cộng +${xp} XP. Nguồn: ${sourceId || 'Không xác định'}`);

        await apiClient.put(`/ranks/student/${studentId}/add-xp`, null, {
            params: { xp, sourceId },
        });

    } catch (error) {
        console.error("🚨 [API RANK FAILED] Lỗi khi cộng điểm:", error);
        throw error;
    }
}
