import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import {LessonDetailPage} from "../feature/lesson/pages/LessonDetailPage";
import {ROUTES} from "../constants/routes";

function DashboardPlaceholder() {
    return <div className="p-8">Dashboard — sẽ code ở bước tiếp theo</div>;
}

export function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path={ROUTES.DASHBOARD} element={<DashboardPlaceholder/>}/>
                <Route path={ROUTES.LESSON_DETAIL} element={<LessonDetailPage/>}/>
                <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace/>}/>
            </Routes>
        </BrowserRouter>
    );
}