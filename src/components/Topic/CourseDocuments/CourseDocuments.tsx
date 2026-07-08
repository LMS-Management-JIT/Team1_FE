import { ArrowUpRight, FileText } from "lucide-react";
import type { CourseDocument } from "../../../types/topic.ts";

export function CourseDocuments({ documents }: { documents: CourseDocument[] }) {
    return (
        <div className="course-documents">
            <ul className="course-documents__list">
                {documents.map((doc) => (
                    <li key={doc.id}>
                        <a
                            href={doc.url}
                            target="_blank"
                            rel="noreferrer"
                            className="course-documents__link"
                        >
                            <span className="course-documents__link-main">
                                <FileText size={18} />
                                <span>{doc.documentName}</span>
                            </span>
                            <ArrowUpRight size={18} />
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}