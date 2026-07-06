import { FileText } from "lucide-react";
import type { CourseDocument } from "../../../types/topic.ts";

export function CourseDocuments({ documents }: { documents: CourseDocument[] }) {
    return (
        <div className="w-full rounded-lg border-2 border-orange-300 bg-white p-6 mb-8">
            <div className="mb-3 flex items-center gap-2">
                <FileText size={20} className="text-gray-600" />
                <h2 className="text-lg font-bold text-gray-800">Tài liệu khóa học</h2>
            </div>
            <ul className="space-y-2 ml-1">
                {documents.map((doc) => (
                    <li key={doc.id} className="flex items-center gap-2">
                        <FileText size={14} className="text-blue-500" />
                        <a href={doc.url} className="text-sm font-medium text-blue-600 underline hover:text-blue-700">
                            {doc.title}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}