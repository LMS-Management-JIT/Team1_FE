import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DashboardUserPage from "./feature/dashboard-user/DashboardUserPage";
import ListTopicPage from "./feature/Topic/ListTopicPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardUserPage />} />
        <Route path="/topics/:moduleId" element={<ListTopicPage />} />
        <Route path="/topics" element={<Navigate to="/topics/1" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;