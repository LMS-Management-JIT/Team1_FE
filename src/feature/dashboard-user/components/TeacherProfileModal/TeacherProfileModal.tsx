import { X, Phone, MapPin, UserRound, GraduationCap } from "lucide-react";
import type { DashboardTeacher } from "../../../../types/dashboard";
import "./TeacherProfileModal.css";

interface TeacherProfileModalProps {
    teacher: DashboardTeacher | null;
    onClose: () => void;
}

export function TeacherProfileModal({
                                        teacher,
                                        onClose,
                                    }: TeacherProfileModalProps) {
    if (!teacher) {
        return null;
    }

    return (
        <div className="teacher-modal-backdrop">
            <section className="teacher-modal">
                <button className="teacher-modal-close" type="button" onClick={onClose}>
                    <X size={18} />
                </button>

                <div className="teacher-modal-avatar">
                    <UserRound size={42} />
                </div>

                <h2>{teacher.fullName || "Chưa cập nhật tên"}</h2>
                <p className="teacher-modal-role">
                    {teacher.specialization || "Giảng viên"}
                </p>

                <div className="teacher-modal-info">
                    <div>
                        <GraduationCap size={17} />
                        <span>{teacher.qualification || "Chưa cập nhật bằng cấp"}</span>
                    </div>

                    <div>
                        <Phone size={17} />
                        <span>{teacher.phoneNumber || "Chưa cập nhật số điện thoại"}</span>
                    </div>

                    <div>
                        <MapPin size={17} />
                        <span>{teacher.address || "Chưa cập nhật địa chỉ"}</span>
                    </div>
                </div>

                <div className="teacher-modal-cert">
                    <h3>Chứng chỉ</h3>
                    <p>{teacher.certifications || "Chưa có thông tin chứng chỉ."}</p>
                </div>
            </section>
        </div>
    );
}