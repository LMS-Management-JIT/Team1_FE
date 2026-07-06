import {BookOpen, Clock} from "lucide-react";
import type {Lesson} from "../../../types";

interface Props {
    lesson: Lesson;
}

const LessonInfo = ({lesson}: Props) => {
    return (
        <div className="mb-8">

            <h1 className="text-4xl font-bold text-slate-800">
                {lesson.lessonName}
            </h1>

            <div className="mt-3 flex items-center gap-6 text-gray-500">

                <div className="flex items-center gap-2">
                    <BookOpen size={18}/>
                    {lesson.type}
                </div>

                <div className="flex items-center gap-2">
                    <Clock size={18}/>
                    {lesson.duration} phút
                </div>

            </div>

        </div>
    );
};

export default LessonInfo;