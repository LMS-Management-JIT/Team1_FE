import {BrowserRouter, Routes} from "react-router-dom";
import lessonRoutes from "./lessonRoutes";

const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>{lessonRoutes}</Routes>
        </BrowserRouter>
    );
};

export default AppRoutes;