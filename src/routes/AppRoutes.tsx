import {Navigate, Route, Routes} from "react-router-dom";
import DashboardUserPage from "../feature/dashboard-user/DashboardUserPage";
import ModulesInCoursePage from "../feature/modules-in-course/ModulesInCoursePage";
import {LessonDetailPage} from "../feature/lesson/pages/LessonDetailPage";
import ListTopicPage from "../feature/Topic/ListTopicPage.tsx";

export const AppRoutes = () => {
    return (
        <Routes>
            {/* Trang Dashboard */}
            <Route path="/" element={<DashboardUserPage/>}/>

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
            {/* 404 */}
            {/* <Route path="*" element={<NotFoundPage />} /> */}
        </Routes>
    );
};