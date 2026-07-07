import { ArrowUpRight, FileText } from "lucide-react";
import type { CourseDocument } from "../../../types/topic.ts";

export function CourseDocuments({ documents }: { documents: CourseDocument[] }) {
    return (
        <section className="course-documents">
            <div className="course-documents__header">
                <span className="course-documents__header-icon">
                    <FileText size={20} />
                </span>
                <h2 className="course-documents__title">Tài liệu khóa học</h2>
            </div>

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
                                <span>{doc.title}</span>
                            </span>
                            <ArrowUpRight size={18} />
                        </a>
                    </li>
                ))}
            </ul>
        </section>
    );
}
