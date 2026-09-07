import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { BookOpen, FileText, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Header } from "../../layouts/Header/Header";
import { Breadcrumb } from "../../components/common/Breadcrumb";
import { CourseDocuments } from "../../components/Topic/CourseDocuments/CourseDocuments";
import { TopicItem } from "../../components/Topic/TopicItem/TopicItem";
import { getTopicsByModule } from "../../services/topicService";
import { getModulesByCourseId } from "../../services/moduleService";
import { getProgressByStudent } from "../../services/lessonProgressService";
import { useAuthContext } from "../../feature/auth/context/AuthContext";
import { useCourseForModule } from "../../hooks/useCourseForModule";
import { ROUTES } from "../../constants/routes";
import type { TopicWithLessons } from "../../types/topic";
import "./ListTopicPage.css";

interface LocationState {
    courseName?: string;
    moduleName?: string;
}

export default function ListTopicPage() {
    // Lấy cả courseId và moduleId từ URL mới
    const { courseId, moduleId } = useParams<{ courseId: string; moduleId: string }>();
    const { studentId } = useAuthContext();
    const navigate = useNavigate();

    const location = useLocation();
    const state = location.state as LocationState | null;

    const [topics, setTopics] = useState<TopicWithLessons[]>([]);
    const [moduleName, setModuleName] = useState<string | null>(state?.moduleName ?? null);

    const { data: courseForModule } = useCourseForModule(moduleId, studentId);
    const courseName = courseForModule?.courseName ?? state?.courseName ?? null;

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // State chặn render UI nếu chưa xác thực xong quyền truy cập
    const [hasAccess, setHasAccess] = useState<boolean>(false);

    useEffect(() => {
        if (!courseId || !moduleId || !studentId) return;
        let active = true;

        const verifyAccess = async () => {
            try {
                // 1. Lấy danh sách module của khóa học và sắp xếp theo thời gian
                const mods = await getModulesByCourseId(courseId);
                mods.sort((a, b) => new Date(a.createDate || 0).getTime() - new Date(b.createDate || 0).getTime());

                const currentIndex = mods.findIndex(m => m.id === moduleId);

                if (currentIndex === -1) {
                    toast.error("Module không tồn tại trong khóa học này!");
                    navigate(`/courses/${courseId}/modules`, { replace: true });
                    return;
                }

                if (active && !state?.moduleName) setModuleName(mods[currentIndex].moduleName);

                // Nếu là module đầu tiên -> Luôn được phép truy cập
                if (currentIndex === 0) {
                    if (active) setHasAccess(true);
                    return;
                }

                // 2. Nếu là module > 0, kiểm tra tiến độ của module NGAY TRƯỚC ĐÓ
                const prevModule = mods[currentIndex - 1];
                const prevTopics = await getTopicsByModule(prevModule.id);

                let prevTotalLessons = 0;
                const prevLessonIds: string[] = [];

                prevTopics.forEach(t => {
                    t.lessons?.forEach(l => {
                        prevTotalLessons++;
                        prevLessonIds.push(l.id);
                    });
                });

                // Nếu module trước không có bài học nào -> Bỏ qua kiểm tra, cho phép vào
                if (prevTotalLessons === 0) {
                    if (active) setHasAccess(true);
                    return;
                }

                // 3. Lấy tiến độ hiện tại của học sinh
                const progressData = await getProgressByStudent(studentId);
                const progressArray = Array.isArray(progressData) ? progressData : (progressData.data || []);
                const completedLessonIds = new Set(
                    progressArray.filter((p: any) => p.completed).map((p: any) => p.lessonId || p.lesson_id)
                );

                let prevCompletedCount = 0;
                prevLessonIds.forEach(id => {
                    if (completedLessonIds.has(id)) prevCompletedCount++;
                });

                // 4. Ra quyết định
                if (prevCompletedCount === prevTotalLessons) {
                    if (active) setHasAccess(true);
                } else {
                    toast.error("Vượt rào thất bại! Bạn phải hoàn thành module trước đó.");
                    navigate(`/courses/${courseId}/modules`, { replace: true });
                }

            } catch (error) {
                console.error("Lỗi xác thực quyền truy cập module:", error);
                navigate(`/courses/${courseId}/modules`, { replace: true });
            }
        };

        verifyAccess();
        return () => { active = false; };
    }, [courseId, moduleId, studentId, navigate, state]);

    useEffect(() => {
        if (!hasAccess || !moduleId) return;
        let active = true;
        setLoading(true);

        getTopicsByModule(moduleId)
            .then((moduleTopics) => {
                if (!active) return;
                setTopics(moduleTopics);
                setLoading(false);
            })
            .catch((err: unknown) => {
                if (!active) return;
                const message = err instanceof Error ? err.message : "Failed to load module data";
                setError(message);
                setLoading(false);
            });

        return () => { active = false; };
    }, [hasAccess, moduleId]);

    const currentModuleTitle = moduleName ?? "Đang tải...";

    const currentCourseTitle = courseName ?? "Đang tải...";

    if (!hasAccess) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-[#f4f6f8] gap-4">
                <ShieldAlert className="w-12 h-12 text-orange-500 animate-pulse" />
                <p className="text-slate-600 font-medium">Đang kiểm tra tiến độ học tập...</p>
            </div>
        );
    }

    return (
        <div className="topic-page">
            <Header/>
            <main className="topic-page__main">
                <Breadcrumb
                    items={[
                        { label: "Khóa học của tôi", href: ROUTES.DASHBOARD },
                        { label: currentCourseTitle, href: `/courses/${courseId}/modules` },
                        { label: currentModuleTitle },
                    ]}
                />

                {loading && <p className="text-slate-500 my-4">Đang tải...</p>}

                {error && <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 my-4">{error}</p>}

                {!loading && !error && (
                    <>
                        <section className="topic-page__documents">
                            <div className="topic-page__section-title">
                                <FileText size={24}/>
                                <h2>Tài liệu khóa học</h2>
                            </div>
                            <CourseDocuments courseId={moduleId}/>
                        </section>

                        <section className="topic-page__lessons mt-8">
                            <div className="topic-page__section-title">
                                <BookOpen size={24}/>
                                <h2>Danh sách bài học</h2>
                            </div>
                            {topics.length === 0 ? (
                                <p className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-600">
                                    Không có topic nào cho module này
                                </p>
                            ) : (
                                <div className="topic-page__topic-list">
                                    {topics.map((topic) => (
                                        <TopicItem
                                            key={topic.topicId ?? topic.id}
                                            topic={topic}
                                            defaultOpen={false}
                                            courseId={courseId}
                                            moduleId={moduleId}
                                        />
                                    ))}
                                </div>
                            )}
                        </section>
                    </>
                )}
            </main>
        </div>
    );
}
