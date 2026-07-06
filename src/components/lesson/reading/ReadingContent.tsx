import LessonCodeBlock from "../common/LessonCodeBlock.tsx";
import LessonInfo from "../common/LessonInfo.tsx";

const ReadingContent = ({lesson}) => {
    return (
        <div className="space-y-8">
            <LessonInfo
                moduleName={lesson.moduleName}
                title={lesson.title}
                type="Bài đọc"
                duration={lesson.duration}
            />

            <div className="prose max-w-none">
                <p>{lesson.description}</p>
                {lesson.code && (
                    <LessonCodeBlock language="python">
                        {lesson.code}
                    </LessonCodeBlock>
                )}
                <div>{lesson.content}</div>
            </div>
        </div>
    );
};

export default ReadingContent;