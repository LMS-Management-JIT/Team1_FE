import {useNavigate, useParams} from "react-router-dom";
import {useLessonDetail} from "../../../hooks/useLessonDetail";
import {useTopicDetail} from "../../../hooks/useTopicDetail";
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
        <>
            <Header/>
            <div className="mx-auto max-w-7xl px-6 py-8">
                <LessonBreadcrumb
                    courseName={topic.courseName ?? ""}
                    topicName={topic.topicName}
                    lessonName={lesson.lessonName}
                />

                <h1 className="mb-6 text-2xl font-bold text-gray-900">
                    {lesson.lessonName}
                </h1>

                <div className="flex gap-6">
                    <div className="flex-1">
                        {lesson.type === "READING" && <ReadingContent lesson={lesson}/>}
                        {lesson.type === "LECTURE" && <LectureContent lesson={lesson}/>}
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
                    />
                </div>
            </div>
        </>
    );
}