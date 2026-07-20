import React from 'react';
import { ShieldX, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/authService';

const ForbiddenPage: React.FC = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        navigate('/login', { replace: true });
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center">
                <div className="mx-auto w-24 h-24 bg-red-100 rounded-3xl flex items-center justify-center mb-8">
                    <ShieldX className="w-14 h-14 text-red-500" />
                </div>

                <h1 className="text-7xl font-bold text-gray-900 mb-2 tracking-tighter">403</h1>
                <h2 className="text-3xl font-semibold text-gray-800 mb-4">Truy cập bị từ chối</h2>

                <p className="text-gray-600 text-lg mb-10 leading-relaxed">
                    Bạn không có quyền truy cập vào trang này.<br />
                    Vui lòng liên hệ quản trị viên nếu bạn tin đây là lỗi.
                </p>

                <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-3 mx-auto px-10 py-3.5 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-medium transition-all active:scale-[0.985] shadow-sm"
                >
                    <LogOut size={20} />
                    Đăng xuất
                </button>

                <p className="mt-12 text-xs text-gray-400">Error Code: FORBIDDEN_403</p>
            </div>
        </div>
    );
};

export default ForbiddenPage;