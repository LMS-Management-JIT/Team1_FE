import type { Topic, CourseDocument } from "../types/topic";

const API_BASE_URL = "http://localhost:8080/api/modules";

const mockDocuments: CourseDocument[] = [
    { id: "d1", title: "Giới thiệu khóa học", url: "#" },
    { id: "d2", title: "Slide tham khảo", url: "#" },
    { id: "d3", title: "Đề cương chi tiết môn học", url: "#" },
];

const mockTopics: Topic[] = [
    { id: "1", title: "Chương 1:  Tổng quan", lessons: [
            { id: "3.1", title: "3.1 Giới thiệu về vòng lặp", meta: "Bài đọc • 8 phút", type: "reading", status: "completed" },
            { id: "3.2", title: "3.2 Vòng lặp For/While & Cách Xử Lý Mảng", meta: "Đọc • Video • Thực hành", type: "video", status: "current" },
            { id: "3.3", title: "3.3 Kỹ thuật List Comprehension nâng cao", meta: "Bài giảng • 14 phút", type: "reading", status: "upcoming" },
            { id: "3.4", title: "3.4 Xử lý mảng 2 chiều và ma trận", meta: "Bài giảng • 18 phút", type: "code", status: "upcoming" },
            { id: "3.5", title: "3.5 Bài tập thực hành tổng hợp vòng lặp", meta: "Thực hành • 6 bài tập", type: "exercise", status: "upcoming" },
        ] },
    { id: "2", title: "Chương 2:  Kiểu dữ liệu", lessons: [
            { id: "3.1", title: "3.1 Giới thiệu về vòng lặp", meta: "Bài đọc • 8 phút", type: "reading", status: "completed" },
            { id: "3.2", title: "3.2 Vòng lặp For/While & Cách Xử Lý Mảng", meta: "Đọc • Video • Thực hành", type: "video", status: "current" },
            { id: "3.3", title: "3.3 Kỹ thuật List Comprehension nâng cao", meta: "Bài giảng • 14 phút", type: "reading", status: "upcoming" },
            { id: "3.4", title: "3.4 Xử lý mảng 2 chiều và ma trận", meta: "Bài giảng • 18 phút", type: "code", status: "upcoming" },
            { id: "3.5", title: "3.5 Bài tập thực hành tổng hợp vòng lặp", meta: "Thực hành • 6 bài tập", type: "exercise", status: "upcoming" },
        ] },
    {
        id: "3",
        title: "Chương 3: Cấu trúc Vòng lặp & Mảng trong Python",
        lessons: [
            { id: "3.1", title: "3.1 Giới thiệu về vòng lặp", meta: "Bài đọc • 8 phút", type: "reading", status: "completed" },
            { id: "3.2", title: "3.2 Vòng lặp For/While & Cách Xử Lý Mảng", meta: "Đọc • Video • Thực hành", type: "video", status: "current" },
            { id: "3.3", title: "3.3 Kỹ thuật List Comprehension nâng cao", meta: "Bài giảng • 14 phút", type: "reading", status: "upcoming" },
            { id: "3.4", title: "3.4 Xử lý mảng 2 chiều và ma trận", meta: "Bài giảng • 18 phút", type: "code", status: "upcoming" },
            { id: "3.5", title: "3.5 Bài tập thực hành tổng hợp vòng lặp", meta: "Thực hành • 6 bài tập", type: "exercise", status: "upcoming" },
        ],
    },
    { id: "4", title: "Chương 4: Hàm (Functions) & Định nghĩa hàm tự tạo", lessons: [] },
    { id: "5", title: "Chương 5: Lập trình hướng đối tượng (OOP) với Python", lessons: [] },
];

async function request<T>(url: string, mock: T): Promise<T> {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("API chưa sẵn sàng");
        return (await response.json()) as T;
    } catch {
        // Backend module chưa nối -> tạm trả mock để dựng UI
        return mock;
    }
}

export function getCourseDocuments(moduleId: string) {
    return request<CourseDocument[]>(`${API_BASE_URL}/${moduleId}/documents`, mockDocuments);
}

export function getTopicsByModule(moduleId: string) {
    return request<Topic[]>(`${API_BASE_URL}/${moduleId}/topics`, mockTopics);
}