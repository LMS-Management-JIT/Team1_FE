import {useEffect, useState} from "react";
import {Link, useParams, useLocation} from "react-router-dom"; // THÊM useLocation
import {BookOpen, ChevronRight, FileText} from "lucide-react";
import {Header} from "../../layouts/Header/Header";
import {CourseDocuments} from "../../components/Topic/CourseDocuments/CourseDocuments";
import {TopicItem} from "../../components/Topic/TopicItem/TopicItem";
import {getTopicsByModule} from "../../services/topicService";
import {getModuleById} from "../../services/moduleService";
import type {TopicWithLessons} from "../../types/topic";
import "./ListTopicPage.css";

// Định nghĩa kiểu dữ liệu cho state được truyền từ màn hình Modules
interface LocationState {
    courseId?: string;
    courseName?: string;
    moduleName?: string;
}

export default function ListTopicPage() {
    const {moduleId = "1"} = useParams();
    
    // BẮT STATE TỪ BÊN TRANG MODULE CHUYỂN SANG
    const location = useLocation();
    const state = location.state as LocationState | null;

    const [topics, setTopics] = useState<TopicWithLessons[]>([]);
    
    // Lấy ngay tên Module từ state (nếu có) để hiển thị ngay lập tức không bị nháy ID
    const [moduleName, setModuleName] = useState<string | null>(state?.moduleName ?? null);
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

        // Chỉ gọi API lấy tên Module nếu người dùng truy cập trực tiếp bằng URL (không có state)
        if (!moduleName) {
            getModuleById(moduleId)
                .then((mod) => {
                    if (!active) return;
                    setModuleName(mod.moduleName);
                })
                .catch(() => {
                    if (!active) return;
                    setModuleName(null);
                });
        }

        return () => {
            active = false;
        };
    }, [moduleId, moduleName]);

    // Thay chữ "Module {id}" mập mờ thành chữ Đang tải nếu API chưa về
    const currentModuleTitle = moduleName ?? "Đang tải...";

    return (
        <div className="topic-page">
            <Header/>
            <main className="topic-page__main">
                {/* 1. Breadcrumb động MỚI ĐÃ SỬA */}
                <div className="topic-page__breadcrumb">
                    <Link to="/">Khóa học của tôi</Link>
                    
                    {/* KIỂM TRA: Nếu có dữ liệu khóa học thì chèn ở giữa */}
                    {state?.courseName && state?.courseId && (
                        <>
                            <ChevronRight size={15}/>
                            <Link to={`/courses/${state.courseId}/modules`}>
                                {state.courseName}
                            </Link>
                        </>
                    )}

                    <ChevronRight size={15}/>
                    <strong>{currentModuleTitle}</strong>
                </div>

                {/* thông báo trạng thái tải */}
                {loading && <p className="text-slate-500 my-4">Đang tải...</p>}
                
                {error &&
                    <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 my-4">{error}</p>}
                    
                {!loading && !error && (
                    <>
                        {/* 2. Section Tài liệu khóa học */}
                        <section className="topic-page__documents">
                            <div className="topic-page__section-title">
                                <FileText size={24}/>
                                <h2>Tài liệu khóa học</h2>
                            </div>
                            <CourseDocuments courseId={moduleId}/>
                        </section>
                        
                        {/* 3. Section Danh sách Topic chứa Lesson lồng nhau */}
                        <section className="topic-page__lessons mt-8">
                            <div className="topic-page__section-title">
                                <BookOpen size={24}/>
                                <h2>Danh sách bài học</h2>
                            </div>
                            {topics.length === 0 ? (
                                <p className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-600">
                                    Không có topic nào cho module này
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