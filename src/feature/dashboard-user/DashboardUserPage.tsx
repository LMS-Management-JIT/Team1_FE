import { Header } from "../../layouts/Header/Header";
import "./DashboardUserPage.css";

export default function DashboardUserPage() {
    return (
        <div className="dashboard-user-page">
            <Header />

            <main className="dashboard-user-main">
                <h1>Dashboard User</h1>
                <p>Header + cấu trúc dashboard đã sẵn sàng.</p>
            </main>
        </div>
    );
}