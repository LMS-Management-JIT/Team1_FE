import {useEffect, useState} from "react";
import type {Lesson} from "../../../types/lesson";
// import { getLessonById } from "../../../services/lessonApi";

const useLesson = () => {
    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // TODO: gọi API
        // getLessonById(...).then(setLesson);

        setTimeout(() => {
            setLesson({
                id: "1",
                topicId: "topic1",
                lessonName: "Giới thiệu Python",
                lessonOrder: 1,
                published: true,
                content: "<h2>Xin chào Python</h2>",
                videoUrl: "",
                imageUrl: "",
                duration: 15,
                description: "Bài học đầu tiên",
                starterCode: "",
                language: "python",
                type: "READING",
                deleted: false,
                createdBy: "",
                updatedBy: "",
            });

            setLoading(false);
        }, 300);
    }, []);

    return {lesson, loading};
};

export default useLesson;