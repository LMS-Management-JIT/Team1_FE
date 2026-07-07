import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { BookOpen, ChevronRight } from "lucide-react";
import { Header } from "../../layouts/Header/Header";
import { CourseDocuments } from "../../components/Topic/CourseDocuments/CourseDocuments";
import { TopicItem } from "../../components/Topic/TopicItem/TopicItem";
import { getCourseDocuments, getTopicsByModule } from "../../services/topicService";
import type { Topic, CourseDocument } from "../../types/topic";
import "./ListTopicPage.css";

const moduleTitles: Record<string, string> = {
    "1": "Module 1: Figma UI Architecture",
};

export default function ListTopicPage() {
    const { moduleId = "1" } = useParams();
    const [documents, setDocuments] = useState<CourseDocument[]>([]);
    const [topics, setTopics] = useState<Topic[]>([]);

    useEffect(() => {
        let active = true;

        Promise.all([
            getCourseDocuments(moduleId),
            getTopicsByModule(moduleId),
        ]).then(([courseDocuments, moduleTopics]) => {
            if (!active) return;
            setDocuments(courseDocuments);
            setTopics(moduleTopics);
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
                <div className="topic-page__breadcrumb">
                    <span>Khóa học</span>
                    <ChevronRight size={15} />
                    <strong>{currentModuleTitle}</strong>
                </div>

                <CourseDocuments documents={documents} />

                <section className="topic-page__lessons">
                    <div className="topic-page__section-title">
                        <BookOpen size={24} />
                        <h2>Danh sách bài học</h2>
                    </div>

                    <div className="topic-page__topic-list">
                        {topics.map((topic) => (
                            <TopicItem key={topic.id} topic={topic} defaultOpen={topic.id === "3"} />
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}
