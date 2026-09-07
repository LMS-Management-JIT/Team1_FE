import { useQuery } from '@tanstack/react-query'
import { getDashboardData } from '../services/dashboardService'
import { useAuth } from '../services/authService' // 1. Đường dẫn tới file authService hoàn chỉnh của bạn

export function useDashboard() {
    // 2. Lấy trực tiếp studentId từ useAuth (useAuth đã lo việc bốc từ user hoặc localStorage dự phòng rồi)
    const { studentId } = useAuth()

    return useQuery({
        // 3. Thêm studentId vào queryKey để React Query tự động làm mới khi đổi tài khoản khác
        queryKey: ['dashboard', studentId],

        // 4. Truyền studentId vào hàm queryFn để gửi lên Backend
        queryFn: () => {
            if (!studentId) return null // Nếu không tìm thấy studentId thì chặn lại, không gọi API bậy
            return getDashboardData(studentId)
        },

        // 5. Chỉ cho phép kích hoạt gọi API khi studentId thực sự tồn tại và hợp lệ
        enabled: !!studentId,
        retry: false,
        staleTime: 5 * 60 * 1000,
    })
}