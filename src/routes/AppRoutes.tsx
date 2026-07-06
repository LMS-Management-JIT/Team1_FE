import {BrowserRouter, Route, Routes} from "react-router-dom";

import DashboardUserPage from "../feature/dashboard-user/DashboardUserPage";
import LessonDetailPage from "../feature/lesson/pages/LessonDetailPage";

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<DashboardUserPage/>}/>
                <Route path="/lesson/:lessonId" element={<LessonDetailPage/>}/>
            </Routes>
        </BrowserRouter>
    );
}