import { BookOpen } from "lucide-react";
import type { DashboardCourse } from "../../../../types/dashboard";
import { getImageUrl } from "../../../../utils/image";
import "./CourseCarousel.css";

interface CourseCarouselProps {
    courses: DashboardCourse[];
    loading?: boolean;
    error?: string;
}

export function CourseCarousel({
                                   courses,
                                   loading = false,
                                   error,
                               }: CourseCarouselProps) {
    if (loading) {
        return <section className="course-carousel">Đang tải khóa học...</section>;
    }

    if (error) {
        return <section className="course-carousel error">{error}</section>;
    }

    if (courses.length === 0) {
        return (
            <section className="course-carousel empty">
                Chưa có khóa học nào.
            </section>
        );
    }

    return (
        <section className="course-carousel">
            <div className="course-carousel-header">
                <h2>Khóa học của tôi</h2>
            </div>

            <div className="course-carousel-list">
                {courses.map((course) => (
                    <article className="course-card" key={course.id}>
                        <img
                            src={getImageUrl(course.thumbnailUrl)}
                            alt={course.courseName}
                        />

                        <div className="course-card-content">
                            <div className="course-icon">
                                <BookOpen size={18} />
                            </div>

                            <h3>{course.courseName}</h3>
                            <p>{course.description}</p>

                            <button type="button">Vào học</button>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}