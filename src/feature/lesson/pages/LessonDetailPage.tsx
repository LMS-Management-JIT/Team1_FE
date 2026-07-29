import { useNavigate, useParams} from "react-router-dom";
import { useState } from "react";
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
import { buildLessonDetailPath } from "../../../constants/routes";
import { Breadcrumb } from "../../../components/common/Breadcrumb.tsx";
import { Header } from "../../../layouts/Header/Header";
import { LessonSidebar } from "../components/LessonSidebar.tsx";
import { LessonPagination } from "../components/LessonPagination.tsx";
import { ReadingContent } from "../components/ReadingContent.tsx";
import { LectureContent } from "../components/LectureContent.tsx";
import { PracticeContent } from "../components/PracticeContent.tsx";
import { Loading } from "../../../components/lesson/ui/Loading";
import { addXpToRank } from "../../../services/rankService";
import { useAuthContext } from "../../../feature/auth/context/AuthContext"; // 🔑 THÊM
import { LessonAiAssistant } from "../components/LessonAiAssistant";
import { useCourseForModule } from "../../../hooks/useCourseForModule";

export function LessonDetailPage() {
    const { topicId, lessonId } = useParams<{ topicId: string; lessonId: string }>();
    const navigate = useNavigate();

    // 🔑 LẤY studentId & TÊN THẬT TỪ AUTH — KHÔNG DÙNG ID CỨNG NỮA
    const { studentId, user, isLoading: isAuthLoading } = useAuthContext();
    const studentName = user?.displayName || "Học viên";

    const { data: lesson, isLoading: isLessonLoading } = useLessonDetail(lessonId, !isAuthLoading);
    const { data: topic, isLoading: isTopicLoading } = useTopicDetail(topicId, !isAuthLoading);
    const { data: moduleId } = useModuleIdForTopic(topicId, !isAuthLoading);
    const { data: courseForModule } = useCourseForModule(moduleId, studentId);

    const courseId = courseForModule?.courseId;
    const topicsListHref =
        courseId && moduleId
            ? `/courses/${courseId}/modules/${moduleId}`
            : undefined;

    // FETCH TIẾN ĐỘ
    const { data: progressList = [] } = useStudentProgress(studentId ?? undefined);

    // KHỞI TẠO HOOKS & LOADING STATE
    const { mutate: submitProgress, isPending: isSubmittingProgress } =
        useSubmitProgress(studentId ?? undefined, lesson?.id);
    const { data: existingSubmission } =
        useLessonSubmission(studentId ?? undefined, lesson?.id);
    const { mutateAsync: uploadFile, isPending: isUploadingFile } =
        useSubmitLessonFile(studentId ?? undefined, lesson?.id);
    const { mutate: removeSubmission, isPending: isDeletingSubmission } =
        useDeleteLessonSubmission(studentId ?? undefined, lesson?.id);

    const [pendingLessonRoute, setPendingLessonRoute] = useState<string | null>(null);

    const completedLessonIds = new Set(
        Array.isArray(progressList)
            ? progressList
                .filter((p) => p.completed === true)
                .map((p) => p.lessonId || (p as any).lesson_id)
            : []
    );

    // CHỜ AUTH + LESSON + TOPIC LOAD XONG
    if (isAuthLoading || isLessonLoading || isTopicLoading || !lesson || !topic) {
        return <div className="flex min-h-screen items-center justify-center"><Loading/></div>;
    }

    // 🔑 ĐÃ XÁC THỰC XONG NHƯNG KHÔNG CÓ studentId -> chưa đăng nhập / tài khoản không gắn học viên
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

    const currentLessonOrder =
        topic.lessons?.find((l) => l.id === lesson.id)?.lessonOrder;

    const handleLessonComplete = async (xpEarned: number) => {
        if (completedLessonIds.has(lesson.id)) {
            console.log("[UI BLOCK] Bài đã hoàn thành, từ chối chạy hàm cộng điểm.");
            return;
        }

        submitProgress({
            studentId, lessonId: lesson.id, progress: 100, completed: true, lastPosition: 0,
        });

        if (xpEarned > 0) {
            try {
                await addXpToRank(studentId, xpEarned, lesson.id);
                toast.success(`Tuyệt vời! Bạn nhận được +${xpEarned} XP!`, { duration: 4000 });
            } catch (e) {
                console.error("[LỖI CỘNG XP] Thất bại:", e);
            }
        } else {
            toast.success(`Đã lưu tiến độ hoàn thành bài học!`, { duration: 3000 });
        }
    };

    const handleSelectLesson = (nextLessonId: string) => {
        const nextRoute = buildLessonDetailPath(
            courseForModule!.courseId,
            moduleId!,
            topic.id,
            nextLessonId
        );
        const isCurrentLessonCompleted = completedLessonIds.has(lesson.id);

        if (lesson.type === "READING" && !isCurrentLessonCompleted) {
            setPendingLessonRoute(nextRoute);
        } else {
            navigate(nextRoute);
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
                            <p className="text-slate-500 text-sm">Bạn đã đọc xong tài liệu này và muốn chuyển sang bài tiếp theo?</p>
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
                        {
                            label: "Khoá học của tôi",
                            href: `/courses/${courseForModule?.courseId}/modules`
                        },
                        {
                            label: topic?.topicName || "Tên chương",
                            href: topicsListHref
                        },
                        {
                            label: lesson?.lessonName || "Tên bài học"
                        },
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
                                // Đổi từ .includes sang .has để chỉ nhận đúng ID bài học, bỏ qua các ID rác cũ
                                isCompleted={completedLessonIds.has(lesson.id)}
                                onQuizSubmitted={async (result, attempts) => {
                                    // Bỏ dòng khai báo customFirebaseId dị dạng đi
                                    if (result.scorePercent === 100) {
                                        submitProgress({
                                            studentId,
                                            lessonId: lesson.id, // Dùng chuẩn xác ID của bài học này
                                            progress: 99,
                                            completed: true,
                                            lastPosition: 0
                                        });

                                        const xp = (attempts === 1) ? 15 : 10;
                                        try {
                                            await addXpToRank(studentId, xp, lesson.id); // Dùng lesson.id cho đồng bộ
                                            toast.success(`Tuyệt vời! Bạn nhận được +${xp} XP!`, { duration: 5000 });
                                        } catch (e) {
                                            console.error("[LƯU XP] Thất bại:", e);
                                            toast.error("Lỗi: Không thể thêm XP.");
                                        }
                                    } else {
                                        submitProgress({
                                            studentId,
                                            lessonId: lesson.id, // Dùng chuẩn xác ID của bài học
                                            progress: 50,
                                            completed: false,
                                            lastPosition: 0
                                        });
                                    }
                                }}
                            />
                        )}

                        <LessonPagination
                            lessons={topic.lessons} currentLessonId={lesson.id} onSelectLesson={handleSelectLesson}
                            onCompleteTopic={async () => {
                                if (lesson.type === "READING" && !completedLessonIds.has(lesson.id)) {
                                    await handleLessonComplete(0);
                                }

                                try {
                                    await addXpToRank(studentId, 30, `TOPIC_${topic.id}`);
                                    toast.success("🏆 CHÚC MỪNG! Bạn đã hoàn thành trọn vẹn chương học và được thưởng +30 XP!", { duration: 5000 });
                                } catch {}

                                navigate(topicsListHref || "/");
                            }}
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