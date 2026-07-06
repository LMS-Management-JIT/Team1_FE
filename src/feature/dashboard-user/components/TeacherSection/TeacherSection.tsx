import { Mail, MapPin, Phone, UserRound } from "lucide-react";
import type { DashboardTeacher } from "../../../../types/dashboard";
import "./TeacherSection.css";

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
    if (loading) {
        return <section className="teacher-section">Đang tải giảng viên...</section>;
    }

    if (error) {
        return <section className="teacher-section error">{error}</section>;
    }

    if (teachers.length === 0) {
        return (
            <section className="teacher-section empty">
                Chưa có thông tin giảng viên.
            </section>
        );
    }

    return (
        <section className="teacher-section">
            <div className="teacher-section-header">
                <h2>Giảng viên phụ trách</h2>
                <p>Thông tin giảng viên đang hỗ trợ lớp học của bạn</p>
            </div>

            <div className="teacher-list">
                {teachers.map((teacher) => (
                    <article className="teacher-card" key={teacher.id}>
                        <div className="teacher-avatar">
                            <UserRound size={28} />
                        </div>

                        <div className="teacher-info">
                            <div className="teacher-name-row">
                                <h3>{teacher.fullName || "Chưa cập nhật tên"}</h3>

                                <span
                                    className={
                                        teacher.available
                                            ? "teacher-status available"
                                            : "teacher-status unavailable"
                                    }
                                >
                  {teacher.available ? "Online" : "Offline"}
                </span>
                            </div>

                            <p className="teacher-specialization">
                                {teacher.specialization || "Chưa cập nhật chuyên môn"}
                            </p>

                            <div className="teacher-meta">
                                {teacher.phoneNumber && (
                                    <span>
                    <Phone size={14} />
                                        {teacher.phoneNumber}
                  </span>
                                )}

                                {teacher.address && (
                                    <span>
                    <MapPin size={14} />
                                        {teacher.address}
                  </span>
                                )}

                                {teacher.profileId && (
                                    <span>
                    <Mail size={14} />
                    Profile: {teacher.profileId}
                  </span>
                                )}
                            </div>

                            <button type="button" onClick={() => onViewProfile(teacher)}>
                                Xem hồ sơ
                            </button>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}