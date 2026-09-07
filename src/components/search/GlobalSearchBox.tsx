import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Layers, BookOpen, PlayCircle, GraduationCap, User, type LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useAuthContext } from "../../feature/auth/context/AuthContext";
import { useSearchContext } from "../../components/context/SearchContext";
import { TeacherProfileModal } from "../../feature/dashboard-user/components/TeacherProfileModal/TeacherProfileModal";
import type { DashboardTeacher } from "../../types/dashboard";
import {
    filterSearchIndex,
    useGlobalSearchIndex,
    type SearchResultItem,
    type SearchResultType,
} from "../../hooks/useGlobalSearch";

interface GlobalSearchBoxProps {
    className?: string;
    placeholder?: string;
    onNavigate?: () => void;
}

// Khai báo kiểu tường minh Record<SearchResultType, ...> để index bằng item.type không bị implicit any
const typeIcon: Record<SearchResultType, LucideIcon> = {
    course: GraduationCap,
    module: Layers,
    topic: BookOpen,
    lesson: PlayCircle,
    teacher: User,
};

const typeLabel: Record<SearchResultType, string> = {
    course: "Khóa học",
    module: "Học phần",
    topic: "Chương",
    lesson: "Bài học",
    teacher: "Giáo viên",
};

function truncateSubtitle(text: string | undefined, maxLength = 60): string | undefined {
    if (!text) return undefined;
    const trimmed = text.trim();
    if (trimmed.length <= maxLength) return trimmed;
    return trimmed.slice(0, maxLength).trimEnd() + "...";
}

export function GlobalSearchBox({ className, placeholder = "Tìm khóa học, giáo viên, bài học...", onNavigate }: GlobalSearchBoxProps) {
    const { studentId } = useAuthContext();

    const { query, setQuery } = useSearchContext();
    const [isOpen, setIsOpen] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);

    const [selectedTeacher, setSelectedTeacher] = useState<DashboardTeacher | null>(null);

    const debouncedQuery = useDebouncedValue(query, 250);
    const { index, isLoading } = useGlobalSearchIndex(studentId, hasInteracted);
    const results: SearchResultItem[] = useMemo(
        () => filterSearchIndex(index, debouncedQuery),
        [index, debouncedQuery]
    );

    const containerRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleFocus = () => {
        setIsOpen(true);
        setHasInteracted(true);
    };

    const handleSelect = (item: SearchResultItem) => {
        switch (item.type) {
            case "lesson":
                if (item.topicId) navigate(`/topics/${item.topicId}/lessons/${item.id}`);
                break;
            case "topic":
            case "module":
                if (item.moduleId) navigate(`/topics/${item.moduleId}`);
                break;
            case "course":
                navigate(`/courses/${item.id}/modules`);
                break;
            case "teacher":
                if (item.teacher) setSelectedTeacher(item.teacher);
                break;
        }

        setIsOpen(false);
        onNavigate?.();
    };

    const showDropdown = isOpen && query.trim().length > 0;

    return (
        <div ref={containerRef} className={clsx("relative", className)}>
            <div className="flex h-8 items-center gap-2 rounded-full bg-white/20 px-3">
                <Search size={15} />
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={handleFocus}
                    onKeyDown={(e) => e.key === "Escape" && setIsOpen(false)}
                    placeholder={placeholder}
                    disabled={!studentId}
                    className="w-full bg-transparent text-xs text-white outline-none placeholder:text-white/80 disabled:cursor-not-allowed disabled:opacity-60"
                />
            </div>

            {showDropdown && (
                <div className="absolute left-0 right-0 top-10 z-50 max-h-80 overflow-y-auto rounded-xl bg-white py-2 text-gray-700 shadow-2xl ring-1 ring-black/5">
                    {!studentId && (
                        <p className="px-4 py-3 text-xs text-gray-400">Vui lòng đăng nhập để tìm kiếm.</p>
                    )}

                    {studentId && isLoading && results.length === 0 && (
                        <p className="px-4 py-3 text-xs text-gray-400">Đang tải dữ liệu tìm kiếm...</p>
                    )}

                    {studentId && !isLoading && results.length === 0 && (
                        <p className="px-4 py-3 text-xs text-gray-400">
                            Không tìm thấy kết quả phù hợp trong khóa học của bạn.
                        </p>
                    )}

                    {results.map((item) => {
                        const Icon = typeIcon[item.type];

                        return (
                            <button
                                key={`${item.type}-${item.id}`}
                                type="button"
                                onClick={() => handleSelect(item)}
                                className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm hover:bg-orange-50"
                            >
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-500">
                                    <Icon size={16} />
                                </span>
                                <span className="min-w-0">
                                    <p className="truncate font-medium text-gray-800">{item.title}</p>
                                    <p className="line-clamp-1 text-[11px] text-gray-400">
                                        {typeLabel[item.type]}
                                        {item.subtitle ? ` · ${truncateSubtitle(item.subtitle)}` : ""}
                                    </p>
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}

            <TeacherProfileModal
                teacher={selectedTeacher}
                onClose={() => setSelectedTeacher(null)}
            />
        </div>
    );
}