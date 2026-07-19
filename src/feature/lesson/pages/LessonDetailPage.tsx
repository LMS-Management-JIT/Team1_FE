import {useNavigate, useParams} from "react-router-dom";
import {useState} from "react";
import {Sparkles} from "lucide-react";
import {toast} from "sonner";
import {useLessonDetail} from "../../../hooks/useLessonDetail";
import {useTopicDetail} from "../../../hooks/useTopicDetail";
import {useModuleIdForTopic} from "../../../hooks/useModuleIdForTopic";
import {useStudentProgress, useSubmitProgress,} from "../../../hooks/useLessonProgress";
import {
    useDeleteLessonSubmission,
    useLessonSubmission,
    useSubmitLessonFile,
} from "../../../hooks/useLessonSubmission";
import {buildLessonDetailPath} from "../../../constants/routes";
import {LessonBreadcrumb} from "../components/LessonBreadcrumb.tsx";
import {Header} from "../../../layouts/Header/Header";
import {LessonSidebar} from "../components/LessonSidebar.tsx";
import {LessonPagination} from "../components/LessonPagination.tsx";
import {ReadingContent} from "../components/ReadingContent.tsx";
import {LectureContent} from "../components/LectureContent.tsx";
import {PracticeContent} from "../components/PracticeContent.tsx";
import {Loading} from "../../../components/lesson/ui/Loading";

// ⚠️ Học viên demo (chưa có Authentication thật) — đồng bộ studentId với các trang khác.
// STUDENT_NAME dùng để đặt tên thư mục trên Cloudinary khi nộp bài.
const STUDENT_NAME = "Học viên demo";

export function LessonDetailPage() {
    const {topicId, lessonId} = useParams<{ topicId: string; lessonId: string }>();
    const navigate = useNavigate();
    const studentId = "enoEBcYAuvnZNoXv0u8v";

    // Tất cả hook phải gọi KHÔNG điều kiện, trước mọi early return
    const {data: lesson, isLoading: isLessonLoading} = useLessonDetail(lessonId);
    const {data: topic, isLoading: isTopicLoading} = useTopicDetail(topicId);
    const {data: moduleId} = useModuleIdForTopic(topicId);
    const topicsListHref = moduleId ? `/topics/${moduleId}` : undefined;
    const {data: progressList = []} = useStudentProgress(studentId);

    const {
        mutate: submitProgress,
        isPending: isSubmittingProgress,
    } = useSubmitProgress(studentId, lesson?.id);

    const {data: existingSubmission} = useLessonSubmission(studentId, lesson?.id);
    const {mutateAsync: uploadFile, isPending: isUploadingFile} =
        useSubmitLessonFile(studentId, lesson?.id);
    const {mutate: removeSubmission, isPending: isDeletingSubmission} =
        useDeleteLessonSubmission(studentId, lesson?.id);

    const [showSummary, setShowSummary] = useState(false);

    if (isLessonLoading || isTopicLoading || !lesson || !topic) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loading/>
            </div>
        );
    }

    // Từ đây trở xuống, TypeScript đã narrow `lesson` và `topic` là defined
    const completedLessonIds = new Set(
        Array.isArray(progressList)
            ? progressList
                .filter((p) => p.completed)
                .map((p) => p.lessonId)
            : []
    );

    // lessonOrder giờ chỉ có ở bảng nối topic_lessons (qua topic.lessons), không còn
    // nằm trên Lesson trực tiếp nữa — lấy đúng số thứ tự của bài đang xem từ đây.
    const currentLessonOrder = topic.lessons?.find((l) => l.id === lesson.id)?.lessonOrder;

    const handleSelectLesson = (nextLessonId: string) => {
        navigate(buildLessonDetailPath(topic.id, nextLessonId));
    };

    const handleSubmitPractice = async (file: File) => {
        try {
            await uploadFile({
                studentId,
                studentName: STUDENT_NAME,
                topicId: topic.id,
                topicName: topic.topicName,
                lessonId: lesson.id,
                lessonName: lesson.lessonName,
                file,
            });
            toast.success(`Đã nộp file "${file.name}" thành công`);
            // ⚠️ Không cần gọi submitProgress ở đây nữa — Backend đã tự động
            // đánh dấu hoàn thành ngay khi lưu bài nộp thành công (xem trigger
            // trong LessonSubmissionServiceImpl.submit() ở Backend).
        } catch (error) {
            toast.error("Nộp bài thất bại, vui lòng thử lại");
            console.error("Lỗi nộp file bài thực hành:", error);
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
            <div className="mx-auto w-full max-w-7xl flex-1 px-4 pt-6 pb-4 sm:px-6 sm:pt-8 lg:px-6">
                <LessonBreadcrumb
                    courseName={topic.courseName ?? ""}
                    topicName={topic.topicName}
                    lessonName={lesson.lessonName}
                    topicHref={topicsListHref}
                />

                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
                        {lesson.lessonName}
                    </h1>

                    {lesson.type === "LECTURE" && (
                        <button
                            type="button"
                            onClick={() => setShowSummary((prev) => !prev)}
                            className="flex w-fit items-center gap-1.5 rounded-lg border border-orange-500 px-4 py-2 text-sm font-medium text-orange-500 hover:bg-orange-50"
                        >
                            <Sparkles className="h-3.5 w-3.5"/>
                            {showSummary ? "Ẩn tóm tắt" : "Tóm tắt bởi AI"}
                        </button>
                    )}
                </div>

                <div className="flex flex-col gap-6 lg:flex-row">
                    <div className="min-w-0 flex-1">
                        {lesson.type === "READING" && (
                            <ReadingContent lesson={lesson} lessonOrder={currentLessonOrder}/>
                        )}
                        {lesson.type === "LECTURE" && (
                            <LectureContent lesson={lesson} showSummary={showSummary}/>
                        )}
                        {lesson.type === "PRACTICE" && (
                            <PracticeContent
                                lesson={lesson}
                                studentId={studentId}
                                existingSubmission={existingSubmission}
                                onSubmit={handleSubmitPractice}
                                onDeleteSubmission={handleDeleteSubmission}
                                isSubmitting={isUploadingFile || isSubmittingProgress}
                                isDeleting={isDeletingSubmission}
                                onQuizSubmitted={(result) => {
                                    submitProgress({
                                        studentId,
                                        lessonId: lesson.id,
                                        progress: Math.round(result.scorePercent),
                                        completed: true,
                                        lastPosition: 0,
                                    });
                                }}
                            />
                        )}

                        <LessonPagination
                            lessons={topic.lessons}
                            currentLessonId={lesson.id}
                            onSelectLesson={handleSelectLesson}
                        />
                    </div>

                    <LessonSidebar
                        topicName={topic.topicName}
                        lessons={topic.lessons}
                        currentLessonId={lesson.id}
                        completedLessonIds={completedLessonIds}
                        onSelectLesson={handleSelectLesson}
                        backToTopicsHref={topicsListHref}
                    />
                </div>
            </div>
        </div>
    );
}
