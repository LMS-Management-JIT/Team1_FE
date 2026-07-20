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

export async function getLeaderboard(): Promise<RankResponse[]> {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";
    const url = `${API_BASE_URL}/ranks/leaderboard`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Không thể tải bảng xếp hạng");
        return await response.json();
    } catch (error) {
        throw error;
    }
}

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