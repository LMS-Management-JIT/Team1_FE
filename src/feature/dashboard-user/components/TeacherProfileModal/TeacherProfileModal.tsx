import { X, Phone, MapPin, UserRound, GraduationCap, MessageCircle } from "lucide-react";
import type { DashboardTeacher } from "../../../../types/dashboard";
import { useChatContext } from "../../../chat/context/ChatContext";

interface TeacherProfileModalProps {
    teacher: DashboardTeacher | null;
    onClose: () => void;
}

export function TeacherProfileModal({ teacher, onClose }: TeacherProfileModalProps) {
    const { openChat } = useChatContext();

    if (!teacher) return null;

    const handleMessage = () => {
        if (!teacher.accountId) return;
        onClose();
        openChat(teacher.accountId);
    };

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 px-4">
            <section className="relative w-full max-w-[460px] rounded-2xl bg-white p-7 text-center shadow-[0_20px_50px_rgba(0,0,0,0.25)]">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                >
                    <X size={18} />
                </button>

                <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-orange-50 text-[#ff6b13]">
                    <UserRound size={42} />
                </div>

                <h2 className="mt-4 text-2xl font-extrabold text-[#202020]">
                    {teacher.fullName || "Chưa cập nhật tên"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                    {teacher.specialization || "Giảng viên"}
                </p>

                <div className="mt-6 space-y-3 text-left">
                    <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3 text-sm text-gray-600">
                        <GraduationCap size={18} className="text-[#ff6b13]" />
                        <span>{teacher.qualification || "Chưa cập nhật bằng cấp"}</span>
                    </div>

                    <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3 text-sm text-gray-600">
                        <Phone size={18} className="text-[#ff6b13]" />
                        <span>{teacher.phoneNumber || "Chưa cập nhật số điện thoại"}</span>
                    </div>

                    <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3 text-sm text-gray-600">
                        <MapPin size={18} className="text-[#ff6b13]" />
                        <span>{teacher.address || "Chưa cập nhật địa chỉ"}</span>
                    </div>
                </div>

                <div className="mt-5 rounded-xl bg-orange-50 p-4 text-left">
                    <h3 className="font-bold text-[#202020]">Chứng chỉ</h3>
                    <p className="mt-2 text-sm text-gray-600">
                        {teacher.certifications || "Chưa có thông tin chứng chỉ."}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleMessage}
                    disabled={!teacher.accountId}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#ff6b13] py-3 text-sm font-semibold text-white transition hover:bg-[#e05f0f] disabled:opacity-50"
                >
                    <MessageCircle size={18} />
                    Nhắn tin
                </button>
            </section>
        </div>
    );
}