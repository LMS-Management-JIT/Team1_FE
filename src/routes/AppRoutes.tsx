import { Navigate, Route, Routes } from "react-router-dom";
import DashboardUserPage from "../feature/dashboard-user/DashboardUserPage";
import ModulesInCoursePage from "../feature/modules-in-course/ModulesInCoursePage";
import { LessonDetailPage } from "../feature/lesson/pages/LessonDetailPage";
import ListTopicPage from "../feature/Topic/ListTopicPage.tsx";
import LoginPage from '../feature/login/LoginPage'
import { PublicRoute } from "../components/auth/PublicRoute.tsx";
import { ProtectedRoute } from "../components/auth/PrivateRoute.tsx";
import NotificationsPage from '../feature/notifications/NotificationsPage';
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

            {/* Trang Dashboard — cần đăng nhập */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <DashboardUserPage/>
                    </ProtectedRoute>
                }
            />

            {/* Danh sách module của khóa học — cần đăng nhập */}
            <Route
                path="/courses/:courseId/modules"
                element={
                    <ProtectedRoute>
                        <ModulesInCoursePage/>
                    </ProtectedRoute>
                }
            />

            {/* Trang chi tiết bài học — cần đăng nhập */}
            <Route
                path="topics/:topicId/lessons/:lessonId"
                element={
                    <ProtectedRoute>
                        <LessonDetailPage/>
                    </ProtectedRoute>
                }
            />

            {/* Danh sách chương trong module — cần đăng nhập */}
            <Route
                path="/topics/:moduleId"
                element={
                    <ProtectedRoute>
                        <ListTopicPage/>
                    </ProtectedRoute>
                }
            />
            <Route path="/topics" element={<Navigate to="/topics/1" replace/>}/>
<Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
            {/* Bảng xếp hạng — cần đăng nhập */}
            <Route
                path="/rank"
                element={
                    <ProtectedRoute>
                        <RankPage />
                    </ProtectedRoute>
                }
            />
            {/* 404 */}
            {/* <Route path="*" element={<NotFoundPage />} /> */}
        </Routes>
    );
};