import LessonCodeBlock from "../common/LessonCodeBlock.tsx";
import LessonInfo from "../common/LessonInfo.tsx";

const PracticeDescription = ({lesson}) => {

    return (
        <div className="space-y-8">
            <LessonInfo
                moduleName={lesson.moduleName}
                title={lesson.title}
                type="Bài thực hành"
            />

            <p>{lesson.description} </p>

            <LessonCodeBlock language="python">{lesson.sampleCode}</LessonCodeBlock>
        </div>
    );
};

export default PracticeDescription;