import type { DashboardCourse } from "../../../../types/dashboard";
import { getImageUrl } from "../../../../utils/image";

interface CourseCarouselProps {
    courses: DashboardCourse[];
    loading?: boolean;
    error?: string;
}

const gradients = [
    "from-[#7db7ff] to-[#3f7cff]",
    "from-[#5ee0a9] to-[#19c48c]",
    "from-[#ff7b83] to-[#ff4d57]",
];

const icons = ["🚀", "☕", "🌐"];

export function CourseCarousel({
                                   courses,
                                   loading = false,
                                   error,
                               }: CourseCarouselProps) {
    if (loading) return <section className="py-8">Đang tải khóa học...</section>;

    if (error) {
        return <section className="rounded-xl bg-white p-5 text-gray-500">{error}</section>;
    }

    if (courses.length === 0) {
        return (
            <section className="rounded-xl bg-white p-5 text-gray-500">
                Chưa có khóa học nào.
            </section>
        );
    }

    return (
        <section className="mb-10">
            <div className="grid grid-cols-3 gap-5">
                {courses.map((course, index) => {
                    const thumbnail = getImageUrl(course.thumbnailUrl);
                    const hasImage = Boolean(course.thumbnailUrl);

                    return (
                        <article
                            key={course.id}
                            className="overflow-hidden rounded-xl bg-white shadow-[0_16px_35px_rgba(0,0,0,0.12)]"
                        >
                            <div
                                className={`relative flex h-[155px] items-center justify-center bg-gradient-to-br ${
                                    gradients[index % gradients.length]
                                }`}
                            >
                <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-bold text-gray-600">
                  {course.courseName}
                </span>

                                {hasImage ? (
                                    <img
                                        src={thumbnail}
                                        alt={course.courseName}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="text-5xl">
                                        {icons[index % icons.length]}
                                    </div>
                                )}
                            </div>

                            <div className="p-4">
                                <h3 className="line-clamp-1 text-base font-extrabold text-[#202020]">
                                    {course.courseName}
                                </h3>

                                <p className="mt-2 line-clamp-1 text-sm text-gray-400">
                                    {course.description || "Chưa có mô tả khóa học"}
                                </p>
                            </div>
                        </article>
                    );
                })}
            </div>

            <div className="mt-8 flex justify-center gap-2">
                <span className="h-2 w-5 rounded-full bg-[#ff6b13]" />
                <span className="h-2 w-2 rounded-full bg-gray-200" />
            </div>
        </section>
    );
}