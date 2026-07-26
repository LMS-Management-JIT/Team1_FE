// Giới tính: backend trả về sẵn text tiếng Việt trong field "gender" (vd: "Nam")
export type Gender = "Nam" | "Nữ" | "Khác";

// Khớp với com.lms.backend.dto.response.ProfileResponse
// GET /api/students/me
export interface StudentProfile {
    id: string;
    fullName: string;
    dayOfBirth: string | null; // LocalDateTime
    gender: string | null;
    email: string;
    phoneNumber: string | null;
    address: string | null;
}

// Khớp với com.lms.backend.dto.request.UpdateProfileRequest
// PUT /api/students/me — CHỈ 3 trường được phép sửa
export interface UpdateProfileRequest {
    fullName: string;
    dayOfBirth: string; // gửi dạng LocalDateTime ISO, vd: "2003-03-27T00:00:00"
    gender: Gender;
}

// Khớp với com.lms.backend.dto.request.ChangePasswordRequest
// PUT /api/students/me/password
export interface ChangePasswordRequest {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
}