import {ChevronLeft, ChevronRight} from "lucide-react";

const LessonPagination = ({
                              previousLesson,
                              nextLesson,
                              onPrevious,
                              onNext,
                          }) => {
    return (
        <div className="mt-10 flex items-center justify-between border-t pt-6">
            <button
                onClick={onPrevious}
                disabled={!previousLesson}
                className="flex items-center gap-2 rounded-lg border px-4 py-2 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
                <ChevronLeft size={18}/>
                Bài trước
            </button>

            <button
                onClick={onNext}
                disabled={!nextLesson}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
                Bài tiếp theo
                <ChevronRight size={18}/>
            </button>
        </div>
    );
};

export default LessonPagination;