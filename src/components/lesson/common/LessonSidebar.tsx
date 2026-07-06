const LessonSidebar = ({lessons = [], currentLessonId}) => {
    return (
        <aside className="w-80 rounded-xl border bg-white shadow-sm">
            <div className="border-b p-5">
                <h2 className="text-lg font-semibold">
                    Danh sách bài học
                </h2>
            </div>

            <div className="max-h-[650px] overflow-y-auto">
                {lessons.map((lesson, index) => (
                    <button
                        key={lesson.id}
                        className={`flex w-full items-start gap-3 border-b p-4 text-left transition hover:bg-gray-50 ${
                            lesson.id === currentLessonId
                                ? "bg-blue-50"
                                : ""
                        }`}
                    >
                        <div
                            className={`mt-1 flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${
                                lesson.id === currentLessonId
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-200"
                            }`}
                        >
                            {index + 1}
                        </div>

                        <div>
                            <p className="font-medium">
                                {lesson.title}
                            </p>

                            <p className="mt-1 text-sm text-gray-500">
                                {lesson.type}
                            </p>
                        </div>
                    </button>
                ))}
            </div>
        </aside>
    );
};

export default LessonSidebar;