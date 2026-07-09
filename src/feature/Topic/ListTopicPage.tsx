import { useEffect, useState } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { BookOpen, ChevronRight, FileText } from "lucide-react";
import { Header } from "../../layouts/Header/Header";
import { CourseDocuments } from "../../components/Topic/CourseDocuments/CourseDocuments";
import { TopicItem } from "../../components/Topic/TopicItem/TopicItem";
import { getTopicsByModule } from "../../services/topicService";
import type { TopicWithLessons } from "../../types/topic";
import "./ListTopicPage.css";

export default function ListTopicPage() {
    const { moduleId = "1" } = useParams();
    const location = useLocation(); 
    
    let breadcrumbData = { courseId: "", courseName: "Khóa học", moduleName: "Module chi tiết" };

    // 1. Nếu có dữ liệu mới truyền sang (từ trang Module), dùng nó và lưu vào bộ nhớ tạm
    if (location.state?.courseName) {
        breadcrumbData = location.state;
        sessionStorage.setItem("current_breadcrumb", JSON.stringify(location.state));
    } 
    // 2. Nếu đi ngược từ Lesson về (state bị mất), lấy lại dữ liệu từ bộ nhớ tạm
    else {
        const savedData = sessionStorage.getItem("current_breadcrumb");
        if (savedData) {
            breadcrumbData = JSON.parse(savedData);
        }
    }

    const { courseId, courseName, moduleName } = breadcrumbData;

    const [topics, setTopics] = useState<TopicWithLessons[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

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

    return (
        <div className="topic-page">
            <Header />

            <main className="topic-page__main">
                {/* 1. Breadcrumb điều hướng */}
                <div className="topic-page__breadcrumb">
                    {/* Cấp 1: Về trang chủ / Dashboard */}
                    <Link to="/" className="hover:text-orange-600 transition-colors">
                        Khóa học của tôi
                    </Link>
                    
                    <ChevronRight size={15} className="text-slate-400 mx-1" />
                    
                    {/* Cấp 2: Về danh sách Module của khóa học này */}
                    <Link to={courseId ? `/courses/${courseId}/modules` : "/"} className="hover:text-orange-600 transition-colors">
                        {courseName}
                    </Link>
                    
                    <ChevronRight size={15} className="text-slate-400 mx-1" />
                    
                    {/* Cấp 3: Tên Module hiện tại đang xem */}
                    <strong className="text-slate-800">{moduleName}</strong>
                </div>

                {/* thông báo trạng thái tải dữ liệu */}
                {loading && <p className="text-slate-500 my-4">Đang tải dữ liệu học tập...</p>}
                {error && <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 my-4">{error}</p>}

                {!loading && !error && (
                    <>
                        {/* 2. Section Tài liệu khóa học */}
                        <section className="topic-page__documents">
                            <div className="topic-page__section-title">
                                <FileText size={24} />
                                <h2>Tài liệu khóa học</h2>
                            </div>
                            <CourseDocuments courseId={moduleId} />
                        </section>

                        {/* 3. Section Danh sách Topic */}
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