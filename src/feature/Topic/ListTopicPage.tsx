import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { BookOpen, ChevronRight } from "lucide-react";
import { Header } from "../../layouts/Header/Header";
import { CourseDocuments } from "../../components/Topic/CourseDocuments/CourseDocuments";
import { TopicItem } from "../../components/Topic/TopicItem/TopicItem";
import { getCourseDocuments, getTopicsByModule } from "../../services/topicService";
import type { Topic, CourseDocument } from "../../types/topic";

export default function ListTopicPage() {
    const { moduleId = "1" } = useParams(); // tạm nhập moduleId qua URL
    const [documents, setDocuments] = useState<CourseDocument[]>([]);
    const [topics, setTopics] = useState<Topic[]>([]);

    useEffect(() => {
        getCourseDocuments(moduleId).then(setDocuments);
        getTopicsByModule(moduleId).then(setTopics);
    }, [moduleId]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />


            <div className="flex-1 flex flex-col items-center w-full py-10 px-6">

                <main className="flex-1 max-w-5xl w-full mx-auto bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-6 mt-14">

                    {/* Thanh đường dẫn (Breadcrumb) */}
                    <div className="mb-6 flex items-center gap-1 text-sm">
                        <span className="font-semibold text-orange-600">Khóa học</span>
                        <ChevronRight size={14} className="text-gray-400" />
                        <span className="font-semibold text-gray-800">Module 1: Figma UI Architecture</span>
                    </div>

                    {/* Tài liệu khóa học */}
                    <div className="mb-8">
                        <CourseDocuments documents={documents} />
                    </div>

                    {/* Tiêu đề danh sách bài học */}
                    <div className="mt-32 mb-4 flex items-center gap-2 border-t border-gray-100 pt-6 space-y-8" >
                        <BookOpen size={20} className="text-gray-700" />
                        <h2 className="text-xl font-bold text-gray-800">Danh sách bài học</h2>
                    </div>

                    {/* Vòng lặp in ra danh sách các Chương / Bài học */}
                    <div className="w-full flex flex-col gap-3 space-y-8">
                        {topics.map((topic) => (
                            <TopicItem key={topic.id} topic={topic} defaultOpen={topic.id === "3"} />
                        ))}
                    </div>

                </main>
            </div>
        </div>
    );
}