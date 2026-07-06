import {Route} from "react-router-dom";
import {LessonDetailPage} from "../feature/lesson/index.ts";

const lessonRoutes = (
    <>
        <Route path="/lessons/:lessonId" element={<LessonDetailPage/>}/>
    </>
);

export default lessonRoutes;