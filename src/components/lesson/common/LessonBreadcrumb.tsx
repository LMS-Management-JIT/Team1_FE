import {ChevronRight} from "lucide-react";

interface LessonBreadcrumbProps {
    items: string[];
}

const LessonBreadcrumb = ({items}: LessonBreadcrumbProps) => {
    return (
        <nav className="mb-6 flex items-center text-sm text-gray-400">
            {items.map((item, index) => (
                <div key={index} className="flex items-center">
                    <span
                        className={
                            index === items.length - 1
                                ? "font-semibold text-gray-700"
                                : ""
                        }
                    >
                        {item}
                    </span>

                    {index !== items.length - 1 && (
                        <ChevronRight size={15} className="mx-2"/>
                    )}
                </div>
            ))}
        </nav>
    );
};

export default LessonBreadcrumb;