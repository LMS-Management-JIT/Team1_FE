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
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const url = `${API_BASE_URL}/ranks/leaderboard`;
    
    console.log("👉 1. Đang gọi API lấy Bảng xếp hạng tại đường dẫn:", url);
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            console.error("❌ 2. Lỗi API Bảng xếp hạng - Status:", response.status, response.statusText);
            throw new Error("Không thể tải bảng xếp hạng");
        }
        
        const data = await response.json();
        console.log("📦 3. Dữ liệu thô (JSON) nhận về từ Backend là:", data);
        return data;
        
    } catch (error) {
        console.error("🚨 4. Lỗi mạng hoặc lỗi hệ thống khi gọi API:", error);
        throw error;
    }
}