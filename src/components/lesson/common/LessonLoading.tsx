const LessonLoading = () => {
    return (
        <div className="animate-pulse space-y-4">
            <div className="h-8 w-2/3 rounded bg-gray-200"></div>

            <div className="h-60 rounded-xl bg-gray-200"></div>

            <div className="space-y-2">
                <div className="h-4 rounded bg-gray-200"></div>
                <div className="h-4 rounded bg-gray-200"></div>
                <div className="h-4 w-3/4 rounded bg-gray-200"></div>
            </div>
        </div>
    );
};

export default LessonLoading;