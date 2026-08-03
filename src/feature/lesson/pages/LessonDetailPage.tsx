import { useNavigate, useParams } from "react-router-dom";
import { useState, useMemo } from "react";
import { BookOpen } from "lucide-react";
import { toast } from "sonner";
import { useLessonDetail } from "../../../hooks/useLessonDetail";
import { useTopicDetail } from "../../../hooks/useTopicDetail";
import { useModuleIdForTopic } from "../../../hooks/useModuleIdForTopic";
import { useStudentProgress, useSubmitProgress } from "../../../hooks/useLessonProgress";
import {
    useDeleteLessonSubmission,
    useLessonSubmission,
    useSubmitLessonFile,
} from "../../../hooks/useLessonSubmission";
import { buildLessonDetailPath, ROUTES } from "../../../constants/routes";
import { Breadcrumb } from "../../../components/common/Breadcrumb.tsx";
import { Header } from "../../../layouts/Header/Header";
import { LessonSidebar } from "../components/LessonSidebar.tsx";
import { LessonPagination } from "../components/LessonPagination.tsx";
import { ReadingContent } from "../components/ReadingContent.tsx";
import { LectureContent } from "../components/LectureContent.tsx";
import { PracticeContent } from "../components/PracticeContent.tsx";
import { Loading } from "../../../components/lesson/ui/Loading";
import { addXpToRank } from "../../../services/rankService";
import { useAuthContext } from "../../../feature/auth/context/AuthContext";
import { LessonAiAssistant } from "../components/LessonAiAssistant";
import { useCourseForModule } from "../../../hooks/useCourseForModule";
import { apiClient } from "../../../services/apiClient";

export function LessonDetailPage() {
    const {
        courseId: courseIdFromUrl,
        moduleId: moduleIdFromUrl,
        topicId,
        lessonId,
    } = useParams<{
        courseId?: string;
        moduleId?: string;
        topicId: string;
        lessonId: string;
    }>();

    const navigate = useNavigate();
    const { studentId, user, isLoading: isAuthLoading } = useAuthContext();
    const studentName = user?.displayName || "Học viên";

    const { data: lesson, isLoading: isLessonLoading } = useLessonDetail(lessonId, !isAuthLoading);
    const { data: topic, isLoading: isTopicLoading } = useTopicDetail(topicId, !isAuthLoading);

    const { data: detectedModuleId } = useModuleIdForTopic(topicId, !isAuthLoading && !moduleIdFromUrl);
    const moduleId = moduleIdFromUrl ?? detectedModuleId;

    const { data: courseForModule } = useCourseForModule(moduleId, studentId);
    const courseId = courseIdFromUrl ?? courseForModule?.courseId;

    const topicsListHref = courseId && moduleId
            ? `/courses/${courseId}/modules/${moduleId}`
            : undefined;

    const { data: progressList = [] } = useStudentProgress(studentId ?? undefined);

    const { mutate: submitProgress, isPending: isSubmittingProgress } =
        useSubmitProgress(studentId ?? undefined, lesson?.id);

    const { data: existingSubmission } =
        useLessonSubmission(studentId ?? undefined, lesson?.id);

    const { mutateAsync: uploadFile, isPending: isUploadingFile } =
        useSubmitLessonFile(studentId ?? undefined, lesson?.id);

    const { mutate: removeSubmission, isPending: isDeletingSubmission } =
        useDeleteLessonSubmission(studentId ?? undefined, lesson?.id);

    const [pendingLessonRoute, setPendingLessonRoute] = useState<string | null>(null);

    const completedLessonIds = useMemo(() => new Set(
        Array.isArray(progressList)
            ? progressList
                .filter((p) => p.completed === true)
                .map((p) => p.lessonId || (p as any).lesson_id)
            : []
    ), [progressList]);

    if (isAuthLoading || isLessonLoading || isTopicLoading || !lesson || !topic) {
        return <div className="flex min-h-screen items-center justify-center"><Loading/></div>;
    }

    if (!studentId) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-center px-4">
                <p className="text-lg font-semibold text-gray-700">Không tìm thấy thông tin học viên</p>
                <p className="text-sm text-gray-400">Vui lòng đăng nhập lại bằng tài khoản học viên để tiếp tục học.</p>
                <button
                    onClick={() => navigate("/login", { replace: true })}
                    className="mt-2 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-orange-600"
                >
                    Về trang đăng nhập
                </button>
            </div>
        );
    }

    const currentLessonOrder = topic.lessons?.find((l) => l.id === lesson.id)?.lessonOrder;

    // 💡 LOGIC KIỂM TRA THƯỞNG TOPIC MỚI: Tách biệt hoàn toàn khỏi nút điều hướng
    const checkTopicCompletionReward = async (newCompletedSet: Set<string>) => {
        if (!topic?.lessons) return;
        const allDone = topic.lessons.every((l) => newCompletedSet.has(l.id));
        if (allDone) {
            try {
                await addXpToRank(studentId, 30, `TOPIC_${topic.id}`);
                toast.success("🏆 CHÚC MỪNG! Bạn đã hoàn thành trọn vẹn chương học và được thưởng +30 XP!", { duration: 5000 });
            } catch (e) {
                // Ignore XP error if already claimed
            }
        }
    };

    const handleLessonComplete = async (xpEarned: number) => {
        if (completedLessonIds.has(lesson.id)) return;

        // Lưu tiến độ REST cơ bản (Cho biết bài này xong)
        submitProgress({
            studentId, lessonId: lesson.id, progress: 100, completed: true, lastPosition: 0,
        });

        // 🚀 BẮN KAFKA ĐỂ XỬ LÝ XP VÀ COURSE PROGRESS NGẦM
        apiClient.post("/kafka/lesson-completed", {
            studentId: studentId,
            lessonId: lesson.id,
            courseId: courseId, // Đã có sẵn từ params URL
            xpEarned: xpEarned
        });

        // Giao diện (UI) hiện thành công luôn, ko cần đợi Backend
        const newCompletedSet = new Set(completedLessonIds);
        newCompletedSet.add(lesson.id);

        if (xpEarned > 0) {
            toast.success(`Tuyệt vời! Bạn nhận được +${xpEarned} XP!`, { duration: 4000 });
        } else {
            toast.success(`Đã lưu tiến độ hoàn thành bài học!`, { duration: 3000 });
        }
    };

    const handleSelectLesson = (nextLessonId: string) => {
        const nextRoute = buildLessonDetailPath(courseId!, moduleId!, topic.id, nextLessonId);
        const isCurrentLessonCompleted = completedLessonIds.has(lesson.id);

        if (lesson.type === "READING" && !isCurrentLessonCompleted) {
            setPendingLessonRoute(nextRoute);
        } else {
            navigate(nextRoute);
        }
    };

    // 💡 HÀM ĐIỀU HƯỚNG TRỞ VỀ TOPIC (NÚT XANH DƯƠNG MỚI)
    const handleNavigateBack = () => {
        const backRoute = topicsListHref || ROUTES.DASHBOARD;
        const isCurrentLessonCompleted = completedLessonIds.has(lesson.id);

        if (lesson.type === "READING" && !isCurrentLessonCompleted) {
            setPendingLessonRoute(backRoute);
        } else {
            navigate(backRoute);
        }
    };

    const handleSubmitPractice = async (file: File) => {
        try {
            await uploadFile({
                studentId, studentName, topicId: topic.id, topicName: topic.topicName,
                lessonId: lesson.id, lessonName: lesson.lessonName, file,
            });

            if (completedLessonIds.has(lesson.id)) {
                toast.success("Đã cập nhật bài nộp mới (Bạn đã nhận điểm XP của bài này trước đó rồi nhé)");
            } else {
                toast.success(`Đã nộp file "${file.name}" thành công`);
                handleLessonComplete(20);
            }
        } catch {
            toast.error("Nộp bài thất bại, vui lòng thử lại");
        }
    };

    const handleDeleteSubmission = () => {
        if (!existingSubmission) return;
        removeSubmission(existingSubmission.id, {
            onSuccess: () => toast.success("Đã xoá bài nộp"),
            onError: () => toast.error("Xoá bài nộp thất bại, vui lòng thử lại"),
        });
    };

    return (
        <div className="flex min-h-screen flex-col bg-white">
            <Header/>

            {pendingLessonRoute && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center">
                                <BookOpen className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">Xác nhận đọc xong?</h3>
                            <p className="text-slate-500 text-sm">Bạn đã đọc xong tài liệu này và muốn chuyển trang?</p>
                            <div className="flex gap-3 w-full mt-4">
                                <button onClick={() => setPendingLessonRoute(null)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors">Chưa xong</button>
                                <button onClick={() => { handleLessonComplete(0); navigate(pendingLessonRoute); setPendingLessonRoute(null); }} className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 transition-colors">Đã đọc xong</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="mx-auto w-full max-w-7xl flex-1 px-4 pt-6 pb-4 sm:px-6 sm:pt-8 lg:px-6">
                <Breadcrumb
                    items={[
                        { label: "Khoá học của tôi", href: "/" },
                        { label: topic.topicName, href: topicsListHref },
                        { label: lesson.lessonName },
                    ]}
                />

                <div className="flex flex-col gap-6 lg:flex-row">
                    <div className="min-w-0 flex-1">
                        {lesson.type === "READING" && (
                            <ReadingContent
                                lesson={lesson}
                                lessonOrder={currentLessonOrder}
                            />
                        )}
                        {lesson.type === "LECTURE" && <LectureContent lesson={lesson} onComplete={handleLessonComplete} />}

                        {lesson.type === "PRACTICE" && (
                            <PracticeContent
                                lesson={lesson} studentId={studentId} existingSubmission={existingSubmission} onSubmit={handleSubmitPractice}
                                onDeleteSubmission={handleDeleteSubmission} isSubmitting={isUploadingFile || isSubmittingProgress} isDeleting={isDeletingSubmission}
                                onQuizSubmitted={async (result, attempts) => {
                                    if (result.scorePercent === 100) {
                                        submitProgress({
                                            studentId,
                                            lessonId: lesson.id,
                                            progress: 99, 
                                            completed: true,
                                            lastPosition: 0
                                        });

                                        const xp = (attempts === 1) ? 15 : 10;
                                        try {
                                            await addXpToRank(studentId, xp, lesson.id); 
                                            toast.success(`Tuyệt vời! Bạn nhận được +${xp} XP!`, { duration: 5000 });
                                        } catch (e) {
                                            console.error("[LƯU XP] Thất bại:", e);
                                        }

                                        // Kiểm tra ngay xem pass Quiz thì có 100% Topic không
                                        const newCompletedSet = new Set(completedLessonIds);
                                        newCompletedSet.add(lesson.id);
                                        await checkTopicCompletionReward(newCompletedSet);

                                    } else {
                                        submitProgress({
                                            studentId,
                                            lessonId: lesson.id, 
                                            progress: 50,
                                            completed: false,
                                            lastPosition: 0
                                        });
                                    }
                                }}
                            />
                        )}

                        <LessonPagination
                            lessons={topic.lessons} 
                            currentLessonId={lesson.id} 
                            onSelectLesson={handleSelectLesson}
                            onNavigateBack={handleNavigateBack} // Sử dụng hàm điều hướng độc lập
                        />
                    </div>

                    <LessonSidebar
                        topicName={topic.topicName} lessons={topic.lessons} currentLessonId={lesson.id}
                        completedLessonIds={completedLessonIds} onSelectLesson={handleSelectLesson} backToTopicsHref={topicsListHref}
                    />
                </div>
            </div>
            <LessonAiAssistant
                topicId={topic.id}
                topicName={topic.topicName}
                lessonId={lesson.id}
                lessonTitle={lesson.lessonName}
            />
        </div>
    );
}