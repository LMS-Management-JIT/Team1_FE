import type {ReactNode} from "react";
import { Link } from "react-router-dom";

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface LessonPageHeaderProps {
    title: string;
    breadcrumbs: BreadcrumbItem[];
    actions?: ReactNode;
}

export default function LessonPageHeader({
                                             title,
                                             breadcrumbs,
                                             actions,
                                         }: LessonPageHeaderProps) {
    return (
        <div className="mb-6">
            {/* Breadcrumb */}
            <nav className="mb-3 flex flex-wrap items-center gap-2 text-sm text-gray-500">
                {breadcrumbs.map((item, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-2"
                    >
                        {index > 0 && (
                            <span className="text-gray-300">/</span>
                        )}

                        {item.href ? (
                            <Link
                                to={item.href}
                                className="transition hover:text-orange-500"
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <span className="font-medium text-gray-700">
                                {item.label}
                            </span>
                        )}
                    </div>
                ))}
            </nav>

            {/* Title */}
            <div className="flex items-center justify-between gap-4">
                <h1 className="max-w-4xl text-3xl font-bold leading-tight text-gray-900">
                    {title}
                </h1>

                {actions && (
                    <div className="flex shrink-0 items-center">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
}