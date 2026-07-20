import { Navigate, Route, Routes } from "react-router-dom";
import DashboardUserPage from "../feature/dashboard-user/DashboardUserPage";
import ModulesInCoursePage from "../feature/modules-in-course/ModulesInCoursePage";
import { LessonDetailPage } from "../feature/lesson/pages/LessonDetailPage";
import ListTopicPage from "../feature/Topic/ListTopicPage.tsx";
import LoginPage from '../feature/login/LoginPage'
import { PublicRoute } from "../components/auth/PublicRoute.tsx";
import ForbiddenPage from '../pages/ForbiddenPage'
import RankPage from "../feature/rank/RankPage";

export const AppRoutes = () => {
    return (
        <Routes>
            {/* 1. Trang chủ mặc định - Nếu truy cập "/" sẽ tự động chuyển hướng sang login */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* 2. Public Route (Chỉ truy cập được khi chưa đăng nhập) */}
            <Route
                path="/login"
                element={
                    <PublicRoute>
                        <LoginPage />
                    </PublicRoute>
                }
            />

            {/* Trang báo lỗi phân quyền (Nếu cần dùng sau này) */}
            <Route path="/403" element={<ForbiddenPage />} />

            {/* Trang Dashboard */}
            <Route path="/dashboard" element={<DashboardUserPage/>}/>

            {/* Danh sách module của khóa học */}
            <Route
                path="/courses/:courseId/modules"
                element={<ModulesInCoursePage/>}
            />

            {/* Trang chi tiết bài học */}
            <Route
                path="topics/:topicId/lessons/:lessonId"
                element={<LessonDetailPage/>}
            />
            <Route path="/topics/:moduleId" element={<ListTopicPage/>}/>
            <Route path="/topics" element={<Navigate to="/topics/1" replace/>}/>
            <Route path="/rank" element={<RankPage />} />
            {/* 404 */}
            {/* <Route path="*" element={<NotFoundPage />} /> */}
        </Routes>
    );
};