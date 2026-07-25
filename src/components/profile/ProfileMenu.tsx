import { useState } from "react";
import { LogOut, UserRound, KeyRound } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { AppUser } from "../../feature/auth/context/AuthContext.tsx";
import { EditProfileModal } from "./EditProfileModal";
import { ChangePasswordModal } from "./ChangePasswordModal";
import { getMyProfile } from "../../services/studentService";

interface ProfileMenuProps {
    user: AppUser | null;
    isLoggingOut: boolean;
    onLogout: () => void;
}

export function ProfileMenu({ user, isLoggingOut, onLogout }: ProfileMenuProps) {
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);


    const { data: profile } = useQuery({
        queryKey: ["student", "profile", "me"],
        queryFn: getMyProfile,
        enabled: !!user,
        staleTime: 60 * 1000,
    });

    const displayName = profile?.fullName || user?.displayName || "Học viên";
    const initials = displayName.substring(0, 2).toUpperCase();

    const handleLogout = () => {
        setShowProfileMenu(false);
        onLogout();
    };

    return (
        <div className="relative">
            <button
                onClick={() => setShowProfileMenu((prev) => !prev)}
                disabled={isLoggingOut}
                className="h-8 w-8 shrink-0 rounded-full bg-orange-100 text-sm font-bold text-[#ff6b13] transition-transform active:scale-95 disabled:opacity-50"
            >
                {isLoggingOut ? "..." : initials}
            </button>

            {showProfileMenu && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />

                    <div className="absolute right-0 z-50 mt-2 w-64 animate-in fade-in slide-in-from-top-1 rounded-xl bg-white py-1 shadow-xl ring-1 ring-black/5 duration-100">
                        <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
                            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-orange-100 text-sm font-bold text-[#ff6b13]">
                                {initials}
                            </div>
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-[#202020]">
                                    {displayName}  {/* ← dùng displayName đã lấy từ profile */}
                                </p>
                                <p className="truncate text-xs text-gray-500">
                                    {profile?.email || user?.email || "Chưa có email"}
                                </p>
                            </div>
                        </div>

                        <div className="py-1">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowProfileMenu(false);
                                    setShowEditProfile(true);
                                }}
                                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-orange-50 hover:text-[#ff6b13]"
                            >
                                <UserRound size={16} />
                                Chỉnh sửa thông tin
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setShowProfileMenu(false);
                                    setShowChangePassword(true);

                                }}
                                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-orange-50 hover:text-[#ff6b13]"
                            >
                                <KeyRound size={16} />
                                Đổi mật khẩu
                            </button>

                            <button
                                type="button"
                                onClick={handleLogout}
                                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-orange-50 hover:text-[#ff6b13]"
                            >
                                <LogOut size={16} />
                                {isLoggingOut ? "Đang xử lý..." : "Đăng xuất"}
                            </button>
                        </div>
                    </div>
                </>
            )}

            {showEditProfile && (
                <EditProfileModal onClose={() => setShowEditProfile(false)} />
            )}

            {showChangePassword && (
                <ChangePasswordModal onClose={() => setShowChangePassword(false)}
                                     onLogout={onLogout}
                />
            )}
        </div>
    );
}