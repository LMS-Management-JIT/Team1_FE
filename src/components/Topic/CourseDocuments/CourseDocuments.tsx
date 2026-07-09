import { ArrowUpRight, FileText } from "lucide-react";
import type { CourseDocument } from "../../../types/topic.ts";
import { useEffect, useState } from "react";
import { getCourseDocuments } from "../../../services/documentService.ts";

export function CourseDocuments({ documents, courseId }: { documents?: CourseDocument[]; courseId?: string }) {
    const [docs, setDocs] = useState<CourseDocument[] | null>(documents ?? null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // If documents are passed in as prop, do not fetch
        if (documents && documents.length > 0) return;

        let mounted = true;

        async function load() {
            setLoading(true);
            setError(null);

            try {
                const data = await getCourseDocuments(courseId);
                if (!mounted) return;
                setDocs(data);
            } catch (err: unknown) {
                if (!mounted) return;
                setError(err instanceof Error ? err.message : String(err));
                setDocs([]);
            } finally {
                if (mounted) setLoading(false);
            }
        }

        load();

        return () => {
            mounted = false;
        };
    }, [documents, courseId]);

    if (loading) {
        return <div className="course-documents">Đang tải tài liệu...</div>;
    }

    if (error) {
        return <div className="course-documents">Lỗi: {error}</div>;
    }

    const list = docs ?? [];

    return (
        <div className="course-documents">
            <ul className="course-documents__list">
                {list.map((doc) => (
                    <li key={doc.id}>
                        <a href={doc.url} target="_blank" rel="noreferrer" className="course-documents__link">
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