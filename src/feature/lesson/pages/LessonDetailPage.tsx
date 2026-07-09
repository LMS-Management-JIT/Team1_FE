import {useNavigate, useParams} from "react-router-dom";
import {useState} from "react";
import {Sparkles} from "lucide-react";
import {useLessonDetail} from "../../../hooks/useLessonDetail";
import {useTopicDetail} from "../../../hooks/useTopicDetail";
import {useModuleIdForTopic} from "../../../hooks/useModuleIdForTopic";
import {useStudentProgress, useSubmitProgress,} from "../../../hooks/useLessonProgress";
import {buildLessonDetailPath} from "../../../constants/routes";
import {LessonBreadcrumb} from "../components/LessonBreadcrumb.tsx";
import {Header} from "../../../layouts/Header/Header";
import {LessonSidebar} from "../components/LessonSidebar.tsx";
import {LessonPagination} from "../components/LessonPagination.tsx";
import {ReadingContent} from "../components/ReadingContent.tsx";
import {LectureContent} from "../components/LectureContent.tsx";
import {PracticeContent} from "../components/PracticeContent.tsx";
import {Loading} from "../../../components/lesson/ui/Loading";

export function LessonDetailPage() {
    const {topicId, lessonId} = useParams<{ topicId: string; lessonId: string }>();
    const navigate = useNavigate();
    const studentId = "2lGFI5u4Z4cItCwGArjS";

    // Tất cả hook phải gọi KHÔNG điều kiện, trước mọi early return
    const {data: lesson, isLoading: isLessonLoading} = useLessonDetail(lessonId);
    const {data: topic, isLoading: isTopicLoading} = useTopicDetail(topicId);
    const {data: moduleId} = useModuleIdForTopic(topicId);
    const topicsListHref = moduleId ? `/topics/${moduleId}` : undefined;
    //const {data: progressList} = useStudentProgress(studentId);
    const {data: progressList = []} = useStudentProgress(studentId);
    console.log("LESSON:", lesson);
    console.log("TOPIC:", topic);
    console.log("LESSON ID:", lessonId);
    console.log("TOPIC ID:", topicId);

    const {
        mutate: submitProgress,
        isPending: isSubmitting,
    } = useSubmitProgress(studentId, lesson?.id);

    const [showSummary, setShowSummary] = useState(true);

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
    const handleSelectLesson = (nextLessonId: string) => {
        navigate(buildLessonDetailPath(topic.id, nextLessonId));
    };

    const handleSubmitPractice = (code: string) => {
        submitProgress({
            studentId,
            lessonId: lesson.id,
            progress: 100,
            completed: true,
            lastPosition: code.length,
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
                        {lesson.type === "READING" && <ReadingContent lesson={lesson}/>}
                        {lesson.type === "LECTURE" && (
                            <LectureContent lesson={lesson} showSummary={showSummary}/>
                        )}
                        {lesson.type === "PRACTICE" && (
                            <PracticeContent
                                lesson={lesson}
                                onSubmit={handleSubmitPractice}
                                isSubmitting={isSubmitting}
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