import {Link} from "react-router-dom";

interface LessonBreadcrumbProps {
    courseName?: string;
    topicName: string;
    lessonName: string;
    topicHref?: string;
}

export function LessonBreadcrumb({courseName, topicName, lessonName, topicHref}: LessonBreadcrumbProps) {
    return (
        <nav className="mb-2 flex flex-wrap items-center text-sm text-gray-400">
            <Link to="/" className="transition-colors hover:text-orange-500 hover:underline">
                Khoá học của tôi
            </Link>

            {courseName && (
                <>
                    <span className="mx-1.5">/</span>
                    <span>{courseName}</span>
                </>
            )}

            <span className="mx-1.5">/</span>

            {topicHref ? (
                <Link to={topicHref} className="transition-colors hover:text-orange-500 hover:underline">
                    {topicName}
                </Link>
            ) : (
                <span>{topicName}</span>
            )}

            <span className="mx-1.5">/</span>
            <span className="font-medium text-gray-600">{lessonName}</span>
        </nav>
    );
}
