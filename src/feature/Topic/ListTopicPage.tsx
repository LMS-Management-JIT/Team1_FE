import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { BookOpen, ChevronRight, FileText } from "lucide-react";
import { Header } from "../../layouts/Header/Header";
import { CourseDocuments } from "../../components/Topic/CourseDocuments/CourseDocuments";
import { TopicItem } from "../../components/Topic/TopicItem/TopicItem";
import { getTopicsByModule } from "../../services/topicService";
import type { TopicWithLessons } from "../../types/topic";
import "./ListTopicPage.css";

const moduleTitles: Record<string, string> = {
    "1": "Module 1: Figma UI Architecture",
};

export default function ListTopicPage() {
    const { moduleId = "1" } = useParams();
    const [topics, setTopics] = useState<TopicWithLessons[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Previously used mock documents; now CourseDocuments will fetch from backend directly when no `documents` prop is provided.

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError(null);

        getTopicsByModule(moduleId)
            .then((moduleTopics) => {
                if (!active) return;
                setTopics(moduleTopics);
                setLoading(false);
            })
            .catch((err: unknown) => {
                if (!active) return;
                const message = err instanceof Error ? err.message : "Failed to load module data";
                setError(message);
                setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [moduleId]);

    const currentModuleTitle = moduleTitles[moduleId] ?? `Module ${moduleId}`;

    return (
        <div className="topic-page">
            <Header />

            <main className="topic-page__main">
                {/* 1. Breadcrumb điều hướng */}
                <div className="topic-page__breadcrumb">
                    <Link to="/courses">Khóa học</Link>
                    <ChevronRight size={15} />
                    <strong>{currentModuleTitle}</strong>
                </div>

                {/* thông báo trạng thái tải dữ liệu */}
                {loading && <p className="text-slate-500 my-4">Đang tải dữ liệu học tập...</p>}
                {error && <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 my-4">{error}</p>}

                {!loading && !error && (
                    <>
                        {/* 2. Section Tài liệu khóa học (Sử dụng Mock Data độc lập phía trên) */}
                        <section className="topic-page__documents">
                            <div className="topic-page__section-title">
                                <FileText size={24} />
                                <h2>Tài liệu khóa học</h2>
                            </div>
                            <CourseDocuments courseId={moduleId} />
                        </section>

                        {/* 3. Section Danh sách Topic chứa Lesson lồng nhau bốc từ bảng trung gian Backend */}
                        <section className="topic-page__lessons mt-8">
                            <div className="topic-page__section-title">
                                <BookOpen size={24} />
                                <h2>Danh sách bài học</h2>
                            </div>

                            {topics.length === 0 ? (
                                <p className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-600">
                                    Không có topic nào cho module này.
                                </p>
                            ) : (
                                <div className="topic-page__topic-list">
                                    {topics.map((topic) => (
                                        <TopicItem
                                            key={topic.topicId ?? topic.id}
                                            topic={topic}
                                            defaultOpen={false}
                                        />
                                    ))}
                                </div>
                            )}
                        </section>
                    </>
                )}
            </main>
        </div>
    );
}