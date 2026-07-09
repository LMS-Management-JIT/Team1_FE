import { Routes, Route } from "react-router-dom";
import DashboardUserPage from "../feature/dashboard-user/DashboardUserPage";
import ModulesInCoursePage from "../feature/modules-in-course/ModulesInCoursePage";

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Đường dẫn mặc định (Trang chủ Dashboard) */}
      <Route path="/" element={<DashboardUserPage />} />
      
      {/* Đường dẫn chi tiết Module của một Khóa học */}
      <Route path="/courses/:courseId/modules" element={<ModulesInCoursePage />} />
      
      {/* Bạn có thể dễ dàng thêm các Route khác ở đây sau này */}
      {/* <Route path="/profile" element={<ProfilePage />} /> */}
      {/* <Route path="*" element={<NotFoundPage />} /> */}
    </Routes>
  );
};