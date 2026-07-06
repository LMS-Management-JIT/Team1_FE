import LessonInfo from "../common/LessonInfo";
import type {Lesson} from "../../../types/lesson";

interface ReadingContentProps {
    lesson: Lesson;
}

const ReadingContent = ({lesson}: ReadingContentProps) => {
    return (
        <div className="space-y-8">
            <LessonInfo lesson={lesson}/>

            <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{
                    __html: lesson.content,
                }}
            />
        </div>
    );
};

export default ReadingContent;