import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Sparkles, BookOpen } from "lucide-react";
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
import { LessonBreadcrumb } from "../components/LessonBreadcrumb.tsx";
import { Header } from "../../../layouts/Header/Header";
import { LessonSidebar } from "../components/LessonSidebar.tsx";
import { LessonPagination } from "../components/LessonPagination.tsx";
import { ReadingContent } from "../components/ReadingContent.tsx";
import { LectureContent } from "../components/LectureContent.tsx";
import { PracticeContent } from "../components/PracticeContent.tsx";
import { Loading } from "../../../components/lesson/ui/Loading";
import { addXpToRank } from "../../../services/rankService";

const STUDENT_NAME = "Học viên demo";

export function LessonDetailPage() {
    const { topicId, lessonId } = useParams<{ topicId: string; lessonId: string }>();
    const navigate = useNavigate();
    const studentId = "enoEBcYAuvnZNoXv0u8v";

    const { data: lesson, isLoading: isLessonLoading } = useLessonDetail(lessonId);
    const { data: topic, isLoading: isTopicLoading } = useTopicDetail(topicId);
    const { data: moduleId } = useModuleIdForTopic(topicId);
    const topicsListHref = moduleId ? `/topics/${moduleId}` : undefined;

    // FETCH TIẾN ĐỘ
    const { data: progressList = [] } = useStudentProgress(studentId);

    // KHỞI TẠO HOOKS & LOADING STATE
    const { mutate: submitProgress, isPending: isSubmittingProgress } = useSubmitProgress(studentId, lesson?.id);
    const { data: existingSubmission } = useLessonSubmission(studentId, lesson?.id);
    const { mutateAsync: uploadFile, isPending: isUploadingFile } = useSubmitLessonFile(studentId, lesson?.id);
    const { mutate: removeSubmission, isPending: isDeletingSubmission } = useDeleteLessonSubmission(studentId, lesson?.id);

    const [showSummary, setShowSummary] = useState(false);
    const [pendingLessonRoute, setPendingLessonRoute] = useState<string | null>(null);

    // ==========================================
    // LỌC DANH SÁCH BÀI ĐÃ HOÀN THÀNH
    // ==========================================
    const completedLessonIds = new Set(
        Array.isArray(progressList)
            ? progressList
                  .filter((p) => p.completed === true)
                  .map((p) => p.lessonId || (p as any).lesson_id)
            : []
    );

    if (isLessonLoading || isTopicLoading || !lesson || !topic) {
        return <div className="flex min-h-screen items-center justify-center"><Loading/></div>;
    }

    // ========================================================
    // HÀM CHÍNH: LƯU TIẾN ĐỘ & CỘNG XP (Hỗ trợ 0 XP)
    // ========================================================
    const handleLessonComplete = async (xpEarned: number) => { 
        // 🛑 UI CHỐNG HACK: Nếu ID bài này đã nằm trong mảng hoàn thành, không chạy logic cộng điểm nữa
        if (completedLessonIds.has(lesson.id)) {
            console.log("🛡️ [UI BLOCK] Bài đã hoàn thành, từ chối chạy hàm cộng điểm.");
            return;
        }

        console.log("======== BẮT ĐẦU LUỒNG LƯU TIẾN ĐỘ & CỘNG XP ========");
        submitProgress({
            studentId, lessonId: lesson.id, progress: 100, completed: true, lastPosition: 0,
        });

        if (xpEarned > 0) {
            try {
                // Truyền lesson.id làm sourceId để Database Firebase ghi sổ
                await addXpToRank(studentId, xpEarned, lesson.id);
                toast.success(`🎉 Tuyệt vời! Bạn nhận được +${xpEarned} XP!`, { duration: 4000 });
            } catch (e) {
                console.error("❌ [LỖI CỘNG XP] Thất bại:", e);
            }
        } else {
            toast.success(`✅ Đã lưu tiến độ hoàn thành bài học!`, { duration: 3000 });
        }
    };

    // ========================================================
    // XỬ LÝ CHUYỂN BÀI & NỘP BÀI
    // ========================================================
    const handleSelectLesson = (nextLessonId: string) => {
        const nextRoute = buildLessonDetailPath(topic.id, nextLessonId);
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
                studentId, studentName: STUDENT_NAME, topicId: topic.id, topicName: topic.topicName,
                lessonId: lesson.id, lessonName: lesson.lessonName, file,
            });

            // Nếu đã từng làm rồi mà Xoá đi nộp lại
            if (completedLessonIds.has(lesson.id)) {
                toast.success("✅ Đã cập nhật bài nộp mới (Bạn đã nhận điểm XP của bài này trước đó rồi nhé)");
            } else {
                toast.success(`Đã nộp file "${file.name}" thành công`);
                handleLessonComplete(20);
            }
        } catch (error) {
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
            
            {/* 🛑 MODAL XÁC NHẬN ĐỌC XONG (KHÔNG CỘNG XP NỮA) */}
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
                <LessonBreadcrumb courseName={topic.courseName ?? ""} topicName={topic.topicName} lessonName={lesson.lessonName} topicHref={topicsListHref} />
                
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">{lesson.lessonName}</h1>
                    
                    {lesson.type === "LECTURE" && (
                        <button onClick={() => setShowSummary((prev) => !prev)} className="flex w-fit items-center gap-1.5 rounded-lg border border-orange-500 px-4 py-2 text-sm font-medium text-orange-500 hover:bg-orange-50 transition-colors">
                            <Sparkles className="h-3.5 w-3.5"/>
                            {showSummary ? "Đóng tóm tắt" : "Tóm tắt với AI"}
                        </button>
                    )}
                </div>

                <div className="flex flex-col gap-6 lg:flex-row">
                    <div className="min-w-0 flex-1">
                        {lesson.type === "READING" && <ReadingContent lesson={lesson} />}
                        {lesson.type === "LECTURE" && <LectureContent lesson={lesson} showSummary={showSummary} onComplete={handleLessonComplete} />}
                        
                        {lesson.type === "PRACTICE" && (
                            <PracticeContent 
                                lesson={lesson} studentId={studentId} existingSubmission={existingSubmission} onSubmit={handleSubmitPractice}
                                onDeleteSubmission={handleDeleteSubmission} isSubmitting={isUploadingFile || isSubmittingProgress} isDeleting={isDeletingSubmission}
                                
                                // TRUYỀN THÊM BIẾN NÀY ĐỂ BÁO CHO QUIZ BIẾT ĐÃ HOÀN THÀNH CHƯA
                                isCompleted={Array.from(completedLessonIds).some(id => id.includes(lesson.id))}

                                onQuizSubmitted={async (result, attempts) => {
                                    // 1. TẠO ID CUSTOM: kết hợp quizId và lessonId
                                    // (Hãy kiểm tra log xem result có trả về quizId không, nếu khác thì đổi lại tên biến cho đúng)
                                    const quizId = (result as any).quizId || (result as any).id || "quiz"; 
                                    const customFirebaseId = `${quizId}_${lesson.id}`;
                                    
                                    console.log("🚀 Đang nộp Firebase với ID:", customFirebaseId);

                                    if (result.scorePercent === 100) { 
                                        // 2. LÀM ĐÚNG: Lưu 99% để test, completed = true với custom ID
                                        submitProgress({ 
                                            studentId, 
                                            lessonId: customFirebaseId, 
                                            progress: 99, 
                                            completed: true, 
                                            lastPosition: 0 
                                        });
                                        
                                        // 3. CỘNG ĐIỂM TRỰC TIẾP Ở ĐÂY (Bỏ qua handleLessonComplete)
                                        const xp = (attempts === 1) ? 15 : 10;
                                        try {
                                            await addXpToRank(studentId, xp, customFirebaseId);
                                            toast.success(`🎉 Tuyệt vời! Bạn nhận được +${xp} XP!`, { duration: 5000 });
                                        } catch (e) {
                                            console.error("❌ [LỖI CỘNG XP] Thất bại:", e);
                                            toast.error("Lỗi: Không thể lưu điểm XP.");
                                        }
                                    } else {
                                        // 4. LÀM SAI: Lưu 50%, completed = false với custom ID
                                        submitProgress({ 
                                            studentId, 
                                            lessonId: customFirebaseId, 
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
                                // 1. Nếu bài cuối là bài đọc, lưu tiến độ 0 XP của bài cuối
                                if (lesson.type === "READING" && !completedLessonIds.has(lesson.id)) {
                                    await handleLessonComplete(0);
                                }
                                
                                // 2. 🎁 PHẦN THƯỞNG 30 XP KHI CLEAR TOPIC (Truyền ID chương học lên để lưu)
                                try {
                                    await addXpToRank(studentId, 30, `TOPIC_${topic.id}`);
                                    toast.success("🏆 CHÚC MỪNG! Bạn đã hoàn thành trọn vẹn chương học và được thưởng +30 XP!", { duration: 5000 });
                                } catch (e) {}

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
        </div>
    );
}
