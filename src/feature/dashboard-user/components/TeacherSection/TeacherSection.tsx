import { MessageCircle, UserRound } from "lucide-react";
import type { DashboardTeacher } from "../../../../types/dashboard";

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
    if (loading) return <section className="mt-8">Đang tải giảng viên...</section>;

    if (error) return <section className="mt-8 rounded-xl bg-white p-5">{error}</section>;

    return (
        <section className="mt-10">
            <div className="mb-5 flex items-center justify-between">
                <h2 className="text-2xl font-extrabold text-[#202020]">Giảng viên</h2>
                <button className="text-sm font-medium text-[#ff6b13]">Xem tất cả →</button>
            </div>

            <div className="grid grid-cols-3 gap-5">
                {teachers.map((teacher) => (
                    <article
                        key={teacher.id}
                        className="group relative min-h-[190px] overflow-hidden rounded-xl bg-white p-6 text-center shadow-[0_14px_32px_rgba(0,0,0,0.08)]"
                    >
                        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-orange-50 text-[#ff6b13]">
                            <UserRound size={30} />
                        </div>

                        <h3 className="mt-4 font-extrabold text-[#202020]">
                            {teacher.fullName || "Chưa cập nhật tên"}
                        </h3>

                        <p className="mt-2 text-sm text-gray-500">
                            {teacher.specialization || "Chưa cập nhật chuyên môn"}
                        </p>

                        <p className="mt-3 inline-block rounded-full bg-orange-50 px-4 py-1 text-xs font-semibold text-[#ff6b13]">
                            {teacher.available ? "Đang hoạt động" : "Chưa online"}
                        </p>

                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[#ff7a2a]/95 opacity-0 transition duration-200 group-hover:opacity-100">
                            <button
                                type="button"
                                onClick={() => onViewProfile(teacher)}
                                className="flex h-9 w-[150px] items-center justify-center gap-2 rounded-md bg-white text-sm font-bold text-[#ff6b13]"
                            >
                                <UserRound size={15} />
                                Xem hồ sơ
                            </button>

                            <button
                                type="button"
                                onClick={() => alert(`Chat với ${teacher.fullName}`)}
                                className="flex h-9 w-[150px] items-center justify-center gap-2 rounded-md bg-white text-sm font-bold text-[#ff6b13]"
                            >
                                <MessageCircle size={15} />
                                Nhắn tin
                            </button>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}