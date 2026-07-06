import {ChevronLeft, ChevronRight} from "lucide-react";

interface Props {
    hasPrevious?: boolean;
    hasNext?: boolean;
    onPrevious?: () => void;
    onNext?: () => void;
}

const LessonPagination = ({
                              hasPrevious,
                              hasNext,
                              onPrevious,
                              onNext,
                          }: Props) => {
    return (
        <div className="mt-12 flex justify-between">

            <button
                disabled={!hasPrevious}
                onClick={onPrevious}
                className="flex items-center gap-2 rounded-lg border px-5 py-3 disabled:opacity-40"
            >
                <ChevronLeft size={18}/>
                Bài trước
            </button>

            <button
                disabled={!hasNext}
                onClick={onNext}
                className="flex items-center gap-2 rounded-lg border px-5 py-3 disabled:opacity-40"
            >
                Bài tiếp
                <ChevronRight size={18}/>
            </button>
        </div>
    );
};

export default LessonPagination;