import {LessonBreadcrumb, LessonContainer, LessonSidebar,} from "../../../components/lesson";

import useLesson from "../hooks/useLesson";
import useLectureSummary from "../hooks/useLectureSummary";
import {type Lesson} from "../../../types";

const LessonDetailPage = () => {
    const {lesson, loading} = useLesson();
    const {summary} = useLectureSummary();

    // TODO: Thay bằng API lấy danh sách lesson của topic/module
    const moduleLessons: Lesson[] = [];

    if (loading) {
        return (
            <LessonContainer>
                <p className="text-center py-10">Đang tải bài học...</p>
            </LessonContainer>
        );
    }

    if (!lesson) {
        return (
            <LessonContainer>
                <p className="text-center py-10 text-red-500">
                    Không tìm thấy bài học.
                </p>
            </LessonContainer>
        );
    }

    return (
        <LessonContainer>

            <LessonBreadcrumb/>

            <LessonInfo/>

            <div className="grid grid-cols-12 gap-8">

                <div className="col-span-8">
                    Reading / Lecture / Practice
                </div>

                <div className="col-span-4">
                    <LessonSidebar/>
                </div>

            </div>

            <LessonPagination/>

        </LessonContainer>
    );
};

export default LessonDetailPage;