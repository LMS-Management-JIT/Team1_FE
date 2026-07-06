import {
    LectureSummary,
    LectureVideo,
    LessonBreadcrumb,
    LessonContainer,
    LessonSidebar,
    PracticeDescription,
    PracticeSubmission,
    ReadingContent
} from "../../../components/lesson/index.ts";
import {LESSON_TYPE} from "../constants";
import {moduleLessons} from "../mockData";
import useLesson from "../hooks/useLesson.ts";
import useLectureSummary from "../hooks/useLectureSummary.ts";

const LessonDetailPage = () => {
    const {lesson, loading} = useLesson();
    const {summary} = useLectureSummary();

    if (loading || !lesson) return <p>Loading...</p>;

    return (
        <LessonContainer>
            <LessonBreadcrumb items={["Khóa học", "Python", lesson.moduleName, lesson.title]}/>

            <div className="grid grid-cols-12 gap-8">
                <div className="col-span-8 space-y-8">
                    {lesson.type === LESSON_TYPE.READING && <ReadingContent lesson={lesson}/>}

                    {lesson.type === LESSON_TYPE.LECTURE && (
                        <>
                            <LectureVideo lesson={lesson}/>
                            <LectureSummary summary={summary}/>
                        </>
                    )}

                    {lesson.type === LESSON_TYPE.PRACTICE && (
                        <>
                            <PracticeDescription lesson={lesson}/>
                            <PracticeSubmission/>
                        </>
                    )}
                </div>

                <div className="col-span-4">
                    <LessonSidebar lessons={moduleLessons} currentLessonId={lesson.id}/>
                </div>
            </div>
        </LessonContainer>
    );
};

export default LessonDetailPage;