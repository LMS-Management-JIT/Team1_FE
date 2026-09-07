import {useEffect, useState} from "react";
import {ChevronLeft, ChevronRight} from "lucide-react";
import type {LessonSummary} from "../../../types/lesson";

interface LessonPaginationProps {
    lessons: LessonSummary[] | undefined | null;
    currentLessonId: string;
    onSelectLesson: (lessonId: string) => void;
}

export function LessonPagination({
                                     lessons,
                                     currentLessonId,
                                     onSelectLesson,
                                 }: LessonPaginationProps) {
    const [jumpPageInput, setJumpPageInput] = useState("");

    const safeLessons = lessons ?? [];

    const sorted = [...safeLessons].sort(
        (a, b) => a.lessonOrder - b.lessonOrder
    );

    const currentIndex = sorted.findIndex(
        (lesson) => lesson.id === currentLessonId
    );

    const currentPage = currentIndex + 1;
    const totalPages = sorted.length;

    useEffect(() => {
        setJumpPageInput("");
    }, [currentLessonId]);

    const goToPage = (page: number) => {
        if (page < 1 || page > totalPages) return;
        onSelectLesson(sorted[page - 1].id);
    };

    const handleJumpPage = (
        e: React.KeyboardEvent<HTMLInputElement>
    ) => {
        if (e.key === "Enter") {
            e.preventDefault();

            const pageNumber = parseInt(jumpPageInput, 10);

            if (
                !isNaN(pageNumber) &&
                pageNumber >= 1 &&
                pageNumber <= totalPages
            ) {
                goToPage(pageNumber);
            } else {
                alert(`Vui lòng nhập trang từ 1 đến ${totalPages}`);
            }
        }
    };

    const getPaginationGroup = () => {
        const delta = 1;
        const range: (number | string)[] = [];
        const rangeWithDots: (number | string)[] = [];
        let last: number | undefined;

        for (let i = 1; i <= totalPages; i++) {
            if (
                i === 1 ||
                i === totalPages ||
                (i >= currentPage - delta &&
                    i <= currentPage + delta)
            ) {
                range.push(i);
            }
        }

        for (const i of range) {
            if (last !== undefined) {
                if ((i as number) - last === 2) {
                    rangeWithDots.push(last + 1);
                } else if ((i as number) - last !== 1) {
                    rangeWithDots.push("...");
                }
            }

            rangeWithDots.push(i);
            last = i as number;
        }

        return rangeWithDots;
    };

    if (totalPages <= 0) return null;

    return (
        <div className="flex items-center justify-center gap-12 pt-6 pb-2 mt-2">
            <div className="flex items-center gap-2">
                <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors bg-white"
                >
                    <ChevronLeft size={16}/>
                </button>

                {getPaginationGroup().map((item, index) => (
                    <button
                        key={index}
                        onClick={() =>
                            typeof item === "number" &&
                            goToPage(item)
                        }
                        disabled={item === "..."}
                        className={`w-9 h-9 flex items-center justify-center rounded-lg border font-medium transition-colors ${
                            item === currentPage
                                ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                                : item === "..."
                                    ? "border-transparent text-gray-500 cursor-default bg-transparent"
                                    : "border-gray-200 text-gray-600 hover:bg-gray-50 bg-white"
                        }`}
                    >
                        {item}
                    </button>
                ))}

                <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors bg-white"
                >
                    <ChevronRight size={16}/>
                </button>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
                <span>
                    Trang {currentPage} / {totalPages}
                </span>

                <div className="flex items-center gap-2">
                    <span>Đến trang:</span>

                    <input
                        type="text"
                        value={jumpPageInput}
                        onChange={(e) =>
                            setJumpPageInput(
                                e.target.value.replace(/[^0-9]/g, "")
                            )
                        }
                        onKeyDown={handleJumpPage}
                        placeholder="VD: 5"
                        className="w-16 px-2 py-1.5 border border-gray-300 rounded-lg outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-center text-gray-700 transition-shadow"
                    />
                </div>
            </div>
        </div>
    );
}