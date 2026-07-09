interface LessonBreadcrumbProps {
    courseName?: string;
    topicName: string;
    lessonName: string;
}

export function LessonBreadcrumb({courseName, topicName, lessonName}: LessonBreadcrumbProps) {
    return (
        <nav className="mb-2 text-sm text-gray-400">
            <span>Khoá học của tôi</span>
            {courseName && (
                <>
                    <span className="mx-1.5">/</span>
                    <span>{courseName}</span>
                </>
            )}
            <span className="mx-1.5">/</span>
            <span>{topicName}</span>
            <span className="mx-1.5">/</span>
            <span className="font-medium text-gray-600">{lessonName}</span>
        </nav>
    );
}