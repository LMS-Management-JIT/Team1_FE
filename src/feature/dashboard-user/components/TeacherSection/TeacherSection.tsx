import { useState } from "react";
import {
    ChevronLeft,
    ChevronRight,
    MessageCircle,
    UserRound,
} from "lucide-react";
import type { DashboardTeacher } from "../../../../types/dashboard";
import { useChatContext } from "../../../chat/context/ChatContext";

interface TeacherSectionProps {
    teachers: DashboardTeacher[];
    loading?: boolean;
    error?: string;
    onViewProfile: (teacher: DashboardTeacher) => void;
}

export function TeacherSection({
                                   teachers,
                                   loading = false,
                                   error,
                                   onViewProfile,
                               }: TeacherSectionProps) {
    const { openChat } = useChatContext();

    const visibleCount = 3;

    const maxIndex = Math.max(teachers.length - visibleCount, 0);

    const [currentIndex, setCurrentIndex] = useState(0);

    const handlePrev = () => {
        setCurrentIndex((prev) => Math.max(prev - 1, 0));
    };

    const handleNext = () => {
        setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
    };

    if (loading) {
        return <section className="mt-8">Đang tải giảng viên...</section>;
    }

    if (error) {
        return (
            <section className="mt-8 rounded-xl bg-white p-5">
                {error}
            </section>
        );
    }

    return (
        <section className="mt-10">
            <div className="mb-5 flex items-center justify-between">
                <h2 className="text-2xl font-extrabold text-[#202020]">
                    Giảng viên
                </h2>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handlePrev}
                        disabled={currentIndex === 0}
                        className="flex h-10 w-10 items-center justify-center rounded-full border bg-white transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <ChevronLeft size={18} />
                    </button>

                    <button
                        onClick={handleNext}
                        disabled={currentIndex === maxIndex}
                        className="flex h-10 w-10 items-center justify-center rounded-full border bg-white transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            <div className="overflow-hidden">
                <div
                    className="flex gap-5 transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)]"
                    style={{
                        transform: `translateX(calc(-${currentIndex} * (100% / ${visibleCount})))`,
                    }}
                >
                    {teachers.map((teacher) => (
                        <div
                            key={teacher.id}
                            className="min-w-[calc((100%-40px)/3)] flex-shrink-0"
                        >
                            <article className="group relative min-h-[190px] overflow-hidden rounded-xl bg-white p-6 text-center shadow-[0_14px_32px_rgba(0,0,0,0.08)]">
                                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-orange-50 text-[#ff6b13]">
                                    <UserRound size={30} />
                                </div>

                                <h3 className="mt-4 font-extrabold text-[#202020]">
                                    {teacher.fullName || "Chưa cập nhật tên"}
                                </h3>

                                <p className="mt-2 text-sm text-gray-500">
                                    {teacher.specialization ||
                                        "Chưa cập nhật chuyên môn"}
                                </p>

                                <p className="mt-3 inline-block rounded-full bg-orange-50 px-4 py-1 text-xs font-semibold text-[#ff6b13]">
                                    {teacher.available
                                        ? "Đang hoạt động"
                                        : "Chưa online"}
                                </p>

                                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[#ff7a2a]/95 opacity-0 transition duration-300 group-hover:opacity-100">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            onViewProfile(teacher)
                                        }
                                        className="flex h-9 w-[150px] items-center justify-center gap-2 rounded-md bg-white text-sm font-bold text-[#ff6b13]"
                                    >
                                        <UserRound size={15} />
                                        Xem hồ sơ
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            openChat(teacher.accountId)
                                        }
                                        className="flex h-9 w-[150px] items-center justify-center gap-2 rounded-md bg-white text-sm font-bold text-[#ff6b13]"
                                    >
                                        <MessageCircle size={15} />
                                        Nhắn tin
                                    </button>
                                </div>
                            </article>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}