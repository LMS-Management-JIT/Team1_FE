import type { DashboardCourseProgress } from "../../../../types/dashboard";

interface ProgressSectionProps {
    progresses: DashboardCourseProgress[];
    loading?: boolean;
    error?: string;
}

export function ProgressSection({
                                    progresses,
                                    loading = false,
                                    error,
                                }: ProgressSectionProps) {
    if (loading) return <section className="py-8">Đang tải tiến độ...</section>;

    if (error) {
        return <section className="rounded-xl bg-white p-5 text-gray-500">{error}</section>;
    }

    if (progresses.length === 0) {
        return (
            <section className="rounded-xl bg-white p-5 text-gray-500">
                Chưa có dữ liệu tiến độ học.
            </section>
        );
    }

    return (
        <section className="mb-10 rounded-xl bg-white p-6 shadow-[0_12px_28px_rgba(0,0,0,0.06)]">
            <div className="mb-5">
                <h2 className="text-xl font-bold text-[#202020]">Tiến độ học tập</h2>
                <p className="text-sm text-gray-500">
                    Theo dõi quá trình hoàn thành khóa học của bạn
                </p>
            </div>

            <div className="space-y-5">
                {progresses.map((item) => (
                    <article key={item.courseId}>
                        <div className="mb-2 flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-[#202020]">{item.courseName}</h3>
                                <p className="text-sm text-gray-500">
                                    {item.completedLessons}/{item.totalLessons} bài học đã hoàn thành
                                </p>
                            </div>

                            <span
                                className={
                                    item.progress === 100
                                        ? "font-bold text-green-500"
                                        : "font-bold text-[#ff6b13]"
                                }
                            >
                {item.progress}%
              </span>
                        </div>

                        <div className="h-2 rounded-full bg-gray-100">
                            <div
                                className={
                                    item.progress === 100
                                        ? "h-2 rounded-full bg-green-500"
                                        : "h-2 rounded-full bg-[#ff6b13]"
                                }
                                style={{ width: `${item.progress}%` }}
                            />
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}