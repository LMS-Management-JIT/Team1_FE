import { Bell, Flag, Search } from "lucide-react";
import "./Header.css";

export function Header() {
    return (
        <header className="app-header">
            <div className="header-brand">
                <div className="header-logo">L</div>
                <span>codegym</span>
            </div>

            <nav className="header-nav">
                <a className="active" href="#">
                    Trang chủ
                </a>
                <a href="#">Khóa học</a>
                <a href="#">Liên hệ</a>
            </nav>

            <div className="header-actions">
                <div className="header-search">
                    <Search size={15} />
                    <input placeholder="Tìm khóa học, bài viết..." />
                </div>

                <button className="header-icon-btn" type="button">
                    <Flag size={15} />
                    <span>3</span>
                </button>

                <button className="header-icon-btn" type="button">
                    <Bell size={15} />
                    <span>5</span>
                </button>

                <button className="header-avatar" type="button">
                    HV
                </button>
            </div>
        </header>
    );
}