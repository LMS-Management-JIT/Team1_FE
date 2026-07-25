import { apiClient } from "./apiClient";
import type {
    ChangePasswordRequest,
    StudentProfile,
    UpdateProfileRequest,
} from "../types/student";


// GET /api/students/me — lấy hồ sơ đầy đủ của học viên đang đăng nhập
export async function getMyProfile(): Promise<StudentProfile> {
    const response = await apiClient.get<StudentProfile>("/students/me");
    return response.data;
}

// PUT /api/students/me — cập nhật hồ sơ (chỉ 3 trường: fullName, gender, dayOfBirth)
// Lưu ý: Backend trả về String thông báo (không trả lại profile mới),
// nên sau khi gọi thành công phải tự refetch lại getMyProfile().
export async function updateMyProfile(payload: UpdateProfileRequest): Promise<string> {
    const response = await apiClient.put<string>("/students/me", payload);
    return response.data;
}

// PUT /api/students/me/password — đổi mật khẩu, trả về String thông báo
export async function changeMyPassword(payload: ChangePasswordRequest): Promise<string> {
    const response = await apiClient.put<string>("/students/me/password", payload);
    return response.data;
}