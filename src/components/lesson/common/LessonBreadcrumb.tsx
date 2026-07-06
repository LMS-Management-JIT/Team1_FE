import {ChevronRight} from "lucide-react";

const LessonBreadcrumb = ({items = []}) => {
    return (
        <nav className="mb-6 flex items-center text-sm text-gray-500">
            {items.map((item, index) => (
                <div key={index} className="flex items-center">
                    <span
                        className={`${
                            index === items.length - 1
                                ? "font-medium text-gray-900"
                                : ""
                        }`}
                    >
                        {item}
                    </span>

                    {index < items.length - 1 && (
                        <ChevronRight
                            size={16}
                            className="mx-2 text-gray-400"
                        />
                    )}
                </div>
            ))}
        </nav>
    );
};

export default LessonBreadcrumb;