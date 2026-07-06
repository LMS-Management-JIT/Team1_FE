import type { DashboardCourseProgress } from "../../../../types/dashboard";
import "./ProgressSection.css";

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
    if (loading) {
        return <section className="progress-section">Đang tải tiến độ...</section>;
    }

    if (error) {
        return <section className="progress-section error">{error}</section>;
    }

    if (progresses.length === 0) {
        return (
            <section className="progress-section empty">
                Chưa có dữ liệu tiến độ học.
            </section>
        );
    }

    return (
        <section className="progress-section">
            <div className="progress-section-header">
                <h2>Tiến độ học tập</h2>
                <p>Theo dõi quá trình hoàn thành khóa học của bạn</p>
            </div>

            <div className="progress-list">
                {progresses.map((item) => (
                    <article className="progress-card" key={item.courseId}>
                        <div className="progress-card-info">
                            <h3>{item.courseName}</h3>
                            <p>
                                {item.completedLessons}/{item.totalLessons} bài học đã hoàn thành
                            </p>
                        </div>

                        <div className="progress-value">{item.progress}%</div>

                        <div className="progress-bar">
                            <div
                                className="progress-bar-fill"
                                style={{ width: `${item.progress}%` }}
                            />
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}