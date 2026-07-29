import { useEffect, useState, useRef } from 'react'
import { ChevronLeft, ChevronRight, Grid3x3, Home, Layers, Lock, Play, Pause, Server, Zap, List, BookOpen, Columns } from 'lucide-react'
import { Header } from "../../layouts/Header/Header"
import type { ModuleResponse } from "../../types/module";
import type { DashboardCourse } from "../../types/dashboard";
import { getModulesByCourseId } from "../../services/moduleService";
import { getStudentCourses } from "../../services/dashboardService";
import { getTopicsByModule } from "../../services/topicService";
import { getProgressByStudent } from "../../services/lessonProgressService";
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from "../../services/authService";
import { initStudentRankIfNeeded } from "../../services/rankService";
import { useSaveCourseProgress } from "../../hooks/useCourseProgress"; 

// ==========================================
// COMPONENT: TRÌNH PHÁT VIDEO TÙY CHỈNH
// ==========================================
const PreviewVideoPlayer = ({ videoUrl }: { videoUrl: string }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTimeDisplay, setCurrentTimeDisplay] = useState("00:00");
    const [durationDisplay, setDurationDisplay] = useState("00:00");

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) videoRef.current.pause();
            else videoRef.current.play();
            setIsPlaying(!isPlaying);
        }
    };

    const formatTime = (seconds: number) => {
        if (isNaN(seconds)) return "00:00";
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleTimeUpdate = () => {
        const video = videoRef.current;
        if (!video) return;
        
        const maxTime = video.duration / 2;
        if (video.currentTime >= maxTime) {
            video.pause();
            video.currentTime = maxTime; 
            setIsPlaying(false);
        }
        
        setProgress((video.currentTime / maxTime) * 100);
        setCurrentTimeDisplay(formatTime(video.currentTime));
    };

    const handleLoadedMetadata = () => {
        const video = videoRef.current;
        if (!video) return;
        setDurationDisplay(formatTime(video.duration / 2));
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        if (videoRef.current) {
            videoRef.current.currentTime = percent * (videoRef.current.duration / 2);
        }
    };

    return (
        <div className="flex-1 bg-black relative flex items-center justify-center group overflow-hidden">
            <video
                ref={videoRef}
                src={videoUrl}
                className="w-full h-full object-cover cursor-pointer"
                onClick={togglePlay}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
            />
            
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <div className="flex items-center gap-3">
                    <button onClick={togglePlay} className="text-white hover:text-orange-400 transition">
                        {isPlaying ? <Pause className="w-5 h-5 fill-current"/> : <Play className="w-5 h-5 fill-current"/>}
                    </button>
                    <div className="flex-1 h-1.5 bg-white/30 rounded-full overflow-hidden cursor-pointer relative" onClick={handleSeek}>
                        <div className="absolute top-0 left-0 bottom-0 bg-orange-500" style={{width: `${progress}%`}} />
                    </div>
                    <span className="text-white text-xs font-mono">{currentTimeDisplay} / {durationDisplay}</span>
                </div>
            </div>

            {!isPlaying && (
                <div onClick={togglePlay} className="absolute inset-0 flex items-center justify-center pointer-events-auto cursor-pointer">
                    <div className="w-14 h-14 bg-orange-500/90 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center text-white hover:scale-110 transition shadow-lg shadow-orange-500/30">
                        <Play className="w-6 h-6 ml-1 fill-current"/>
                    </div>
                </div>
            )}
        </div>
    );
}

// ==========================================
// LOGIC TÍNH TOÁN ICON THÔNG MINH
// ==========================================
const getCourseStyles = (course: DashboardCourse, index: number) => {
    const textToSearch = `${course.courseName} ${course.description}`.toLowerCase();
    if (textToSearch.match(/ui|front|react|web|html|css/)) return { Icon: Zap, colorClass: 'text-orange-500', bgClass: 'bg-orange-50', activeBg: 'bg-gradient-to-br from-orange-500 to-orange-600' };
    if (textToSearch.match(/back|java|api|data|sql|server/)) return { Icon: Server, colorClass: 'text-slate-500', bgClass: 'bg-slate-100', activeBg: 'bg-gradient-to-br from-slate-600 to-slate-700' };
    if (textToSearch.match(/full|master|dev|cloud|docker/)) return { Icon: Layers, colorClass: 'text-emerald-500', bgClass: 'bg-emerald-50', activeBg: 'bg-gradient-to-br from-emerald-500 to-emerald-600' };
    
    const fallbacks = [
        { Icon: Zap, colorClass: 'text-orange-500', bgClass: 'bg-orange-50', activeBg: 'bg-gradient-to-br from-orange-500 to-orange-600' },
        { Icon: Layers, colorClass: 'text-emerald-500', bgClass: 'bg-emerald-50', activeBg: 'bg-gradient-to-br from-emerald-500 to-emerald-600' },
        { Icon: Server, colorClass: 'text-slate-500', bgClass: 'bg-slate-100', activeBg: 'bg-gradient-to-br from-slate-600 to-slate-700' }
    ];
    return fallbacks[index % 3];
}

// ==========================================
// COMPONENT CON: THẺ KHÓA HỌC Ở SIDEBAR
// ==========================================
const SidebarCourseCard = ({course, index, isActive, onClick}: { course: DashboardCourse, index: number, isActive: boolean, onClick: () => void }) => {
    const [imgError, setImgError] = useState(!course.thumbnailUrl);
    const style = getCourseStyles(course, index);
    const Icon = style.Icon;

    const renderIconOrImage = (isWhiteText: boolean) => {
        if (!imgError && course.thumbnailUrl) {
            return <img src={course.thumbnailUrl} onError={() => setImgError(true)} alt={course.courseName} className="w-10 h-10 rounded-xl object-cover ring-1 ring-black/5 shrink-0 bg-white" />;
        }
        return (
            <div className={`w-10 h-10 rounded-xl ${isWhiteText ? 'bg-white/20 ring-1 ring-white/30' : style.bgClass} shrink-0 flex items-center justify-center transition`}>
                <Icon className={`${isWhiteText ? 'text-white fill-white' : style.colorClass} w-4 h-4`} strokeWidth={1.5}/>
            </div>
        );
    };

    if (isActive) {
        return (
            <div onClick={onClick} className={`group flex flex-col gap-3 p-4 rounded-2xl ${style.activeBg} cursor-pointer relative overflow-hidden shadow-lg shadow-black/10 hover:shadow-xl transition-shadow`}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"/>
                <div className="flex items-center gap-3 relative z-10">
                    {renderIconOrImage(true)}
                    <div className="flex flex-col gap-0.5 min-w-0">
                        <h3 className="text-sm font-bold text-white leading-tight truncate">{course.courseName}</h3>
                        <span className="text-xs font-medium text-white/80 truncate">{course.description || "Khóa học Dev Space"}</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div onClick={onClick} className="group flex flex-col gap-3 p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer">
            <div className="flex items-center gap-3">
                {renderIconOrImage(false)}
                <div className="flex flex-col gap-0.5 min-w-0">
                    <h3 className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition leading-tight truncate">{course.courseName}</h3>
                    <span className="text-xs font-medium text-slate-400 truncate">{course.description || "Khóa học Dev Space"}</span>
                </div>
            </div>
        </div>
    );
}

// ==========================================
// TRANG CHÍNH: MODULES IN COURSE PAGE
// ==========================================
export default function ModulesInCoursePage() {
    const { studentId } = useAuth();
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    
    const [myCourses, setMyCourses] = useState<DashboardCourse[]>([]);
    const [activeCourseId, setActiveCourseId] = useState<string>("");
    
    const [modules, setModules] = useState<ModuleResponse[]>([]);
    const [displayModules, setDisplayModules] = useState<any[]>([]);
    const [isLoadingModules, setIsLoadingModules] = useState<boolean>(false);
    
    const [topicCounts, setTopicCounts] = useState<Record<string, number>>({});
    const [moduleProgress, setModuleProgress] = useState<Record<string, { total: number, completed: number }>>({});
    
    // Cập nhật State cho Bố cục: slider | grid | list
    const [layout, setLayout] = useState<'slider' | 'grid' | 'list'>('slider');
    const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);

    const { mutate: saveCourseProgressMutate } = useSaveCourseProgress(); 

    useEffect(() => {
        // Nếu chưa có studentId thì return luôn để không gọi API lỗi
        if (!studentId) return; 

        // 2. Gọi hàm khởi tạo Rank ngầm ở background (Không dùng await để không làm chậm trang)
        initStudentRankIfNeeded(studentId);

        getStudentCourses(studentId).then(data => {
            setMyCourses(data);
            if (data.length > 0) setActiveCourseId(courseId || data[0].id);
        }).catch(err => console.error("Lỗi danh sách khóa học:", err));
    }, [courseId, studentId]);

    useEffect(() => {
        if (!activeCourseId) return;
        const fetchModules = async () => {
            setIsLoadingModules(true);
            try {
                const data = await getModulesByCourseId(activeCourseId);
                
                // --- THÊM LOGIC SẮP XẾP TẠI ĐÂY ---
                // Sắp xếp theo thời gian tạo từ Cũ -> Mới (Tăng dần)
                const sortedData = data.sort((a, b) => {
                    // Chuyển chuỗi ngày tháng thành số (timestamp) để trừ cho nhau
                    // Lưu ý: Đổi 'createDate' thành 'createdAt' nếu backend của bạn dùng tên khác
                    const timeA = new Date(a.createDate || 0).getTime();
                    const timeB = new Date(b.createDate || 0).getTime();
                    
                    return timeA - timeB; // timeA - timeB là Cũ -> Mới. (Nếu muốn Mới -> Cũ thì timeB - timeA)
                });

                setModules(sortedData);
            } catch (error) {
                console.error("Lỗi khi fetch dữ liệu modules:", error);
            } finally {
                setIsLoadingModules(false);
            }
        };
        fetchModules();
    }, [activeCourseId]);

    useEffect(() => {
        let active = true;
        const fetchTopicsAndVideo = async () => {
            if (modules.length === 0 || !studentId) return; 
            setPreviewVideoUrl(null);
            
            try {
                const progressData = await getProgressByStudent(studentId).catch(() => []);
                const progressArray = Array.isArray(progressData) ? progressData : (progressData.data || []);
                const completedLessonIds = new Set(
                    progressArray.filter((p: any) => p.completed).map((p: any) => p.lessonId || p.lesson_id)
                );

                const counts: Record<string, number> = {};
                const progressMap: Record<string, { total: number, completed: number }> = {};
                let foundVideo = false;
                
                const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";
                
                const topicResults = await Promise.all(
                    modules.map(mod => getTopicsByModule(mod.id).catch(() => []))
                );

                let isChainUnlocked = true; 

                const enhancedModules = modules.map((mod, idx) => {
                    const topics = topicResults[idx] || [];
                    counts[mod.id] = topics.length;

                    let totalLessons = 0;
                    let completedLessons = 0;
                    
                    topics.forEach((topic: any) => {
                        if (topic.lessons) {
                            topic.lessons.forEach((l: any) => {
                                totalLessons++;
                                if (completedLessonIds.has(l.id)) completedLessons++;
                            });
                        }
                    });
                    
                    progressMap[mod.id] = { total: totalLessons, completed: completedLessons };

                    const isModuleCompleted = totalLessons > 0 ? (completedLessons === totalLessons) : true;
                    
                    // Module hiện tại chỉ được mở nếu chuỗi khóa từ trên xuống dưới chưa bị đứt
                    const isUnlocked = isChainUnlocked;

                    // LÁ CHẮN: Nếu phát hiện module này chưa hoàn thành, 
                    // lập tức CẮT ĐỨT chuỗi mở khóa cho TẤT CẢ các module đứng sau nó.
                    if (!isModuleCompleted) {
                        isChainUnlocked = false;
                    }

                    return {
                        ...mod,
                        isUnlocked,
                        isCompleted: isModuleCompleted
                    };
                });

                if (active) {
                    setTopicCounts(counts);
                    setModuleProgress(progressMap);
                    setDisplayModules(enhancedModules);

                    // Tính tổng
                    let overallTotal = 0;
                    let overallCompleted = 0;
                    Object.values(progressMap).forEach(m => {
                        overallTotal += m.total;
                        overallCompleted += m.completed;
                    });
                    
                    const overallPercent = overallTotal > 0 ? Math.round((overallCompleted / overallTotal) * 100) : 0;
                    
                    console.log("🔥 [DEBUG] Chuẩn bị đồng bộ tiến độ khóa học:", { studentId, activeCourseId, overallPercent });

                    // Gọi API lưu xuống Firebase
                    if (studentId && activeCourseId) {
                        saveCourseProgressMutate(
                            {
                                studentId: studentId,
                                courseId: activeCourseId,
                                progress: overallPercent,
                                totalLessons: overallTotal,
                                completedLessons: overallCompleted
                            },
                            {
                                onSuccess: () => {
                                    console.log("✅ [SUCCESS] Đã lưu tiến độ thành công vào DB Firebase!");
                                },
                                onError: (err) => {
                                    console.error("❌ [ERROR] Lỗi gọi API lưu tiến độ:", err);
                                }
                            }
                        );
                    }
                }

                for (const topics of topicResults) {
                    if (foundVideo || !topics) continue;
                    for (const topic of topics) {
                        if (foundVideo) break;
                        const lecture = topic.lessons?.find((l: any) => l.type === "LECTURE");
                        if (lecture) {
                            const res = await fetch(`${API_BASE_URL}/lessons/${lecture.id}`);
                            if (res.ok) {
                                const detail = await res.json();
                                if (detail.videoUrl && active) {
                                    setPreviewVideoUrl(detail.videoUrl);
                                    foundVideo = true;
                                }
                            }
                        }
                    }
                }
            } catch (e) {
                console.error("Lỗi quét topics/video/progress:", e);
            }
        };
        
        fetchTopicsAndVideo();
        return () => { active = false; };
    }, [modules, studentId]);

    const handleScroll = (direction: 'left' | 'right') => {
        const container = document.getElementById('modules-scroll')
        if (container) {
            const scrollAmount = 320;
            container.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        }
    };

    const activeCourseData = myCourses.find(c => c.id === activeCourseId) || {
        courseName: "Đang tải dữ liệu...", description: "Vui lòng chờ trong giây lát..."
    };

    const totalCourseLessons = Object.values(moduleProgress).reduce((acc, curr) => acc + curr.total, 0);
    const totalCourseCompleted = Object.values(moduleProgress).reduce((acc, curr) => acc + curr.completed, 0);
    const coursePercent = totalCourseLessons > 0 ? Math.round((totalCourseCompleted / totalCourseLessons) * 100) : 0;

    return (
        <div className="flex flex-col h-screen w-full bg-slate-50 text-slate-900 font-sans antialiased overflow-hidden">
            <Header/>
            <div className="flex flex-1 overflow-hidden">
                {/* --- LEFT SIDEBAR --- */}
                <aside className="w-[280px] bg-white border-r border-slate-200 flex flex-col shrink-0 h-full z-20 shadow-sm">
                    <div className="h-[72px] px-6 border-b border-slate-200 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shadow-md shadow-orange-500/30">
                                <Zap className="w-4 h-4 text-white fill-white" strokeWidth={2.5}/>
                            </div>
                            <span className="text-sm font-bold tracking-tight text-slate-900">Dev Space</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-md shadow-slate-900/20">
                            <svg height="20" viewBox="0 0 16 16" width="20" fill="#FFFFFF"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path></svg>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        <div className="px-6 pt-6 pb-3 flex items-center justify-between">
                            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Khóa Học</h2>
                            <span className="bg-orange-50 text-orange-600 text-xs font-bold px-2 py-0.5 rounded-full border border-orange-100">{myCourses.length}</span>
                        </div>
                        <div className="flex flex-col gap-2 px-3 pb-8">
                            {myCourses.length === 0 ? (
                                <div className="px-3 text-sm text-slate-400 text-center mt-4">Không có khóa học nào</div>
                            ) : (
                                myCourses.map((course, index) => (
                                    <SidebarCourseCard 
                                        key={course.id} 
                                        course={course} 
                                        index={index} 
                                        isActive={activeCourseId === course.id} 
                                        onClick={() => {
                                            // Ép trình duyệt chuyển hướng và refresh lại toàn bộ trang
                                            window.location.href = `/courses/${course.id}/modules`;
                                        }} 
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </aside>

                {/* --- MAIN CONTENT --- */}
                <main className="flex-1 h-full overflow-y-auto overflow-x-hidden flex flex-col relative">
                    <header className="w-full h-[72px] px-6 lg:px-8 flex shrink-0 items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-40 shadow-sm">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                            <span onClick={() => navigate('/')} className="hover:text-orange-600 cursor-pointer transition flex items-center gap-1.5 hover:bg-orange-50 px-2.5 py-1.5 rounded-lg">
                                <Home className="w-4 h-4"/>
                                <span className="hidden sm:inline">Trang chủ</span>
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-300"/>
                            <span className="text-slate-700 font-semibold truncate max-w-[180px] sm:max-w-none">{activeCourseData.courseName}</span>
                        </div>
                        
                        {/* TRÌNH ĐIỀU KHIỂN BỐ CỤC MỚI (SLIDER / GRID / LIST) */}
                        <div className="flex items-center bg-slate-100/80 p-1 rounded-lg">
                            <button 
                                onClick={() => setLayout('slider')} 
                                className={`p-1.5 rounded-md transition-all ${layout === 'slider' ? 'bg-white shadow-sm text-orange-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/50'}`}
                                title="Trượt ngang"
                            >
                                <Columns className="w-4 h-4"/>
                            </button>
                            <button 
                                onClick={() => setLayout('grid')} 
                                className={`p-1.5 rounded-md transition-all ${layout === 'grid' ? 'bg-white shadow-sm text-orange-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/50'}`}
                                title="Dạng lưới"
                            >
                                <Grid3x3 className="w-4 h-4"/>
                            </button>
                            <button 
                                onClick={() => setLayout('list')} 
                                className={`p-1.5 rounded-md transition-all ${layout === 'list' ? 'bg-white shadow-sm text-orange-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/50'}`}
                                title="Dạng danh sách"
                            >
                                <List className="w-4 h-4"/>
                            </button>
                        </div>
                    </header>

                    <div className="p-6 sm:p-8 flex flex-col gap-8 max-w-[1400px] w-full mx-auto">
                        <section className="w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl shadow-slate-900/30 relative transition-all duration-500">
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(249,115,22,0.2),transparent_70%)]"/>
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(249,115,22,0.08),transparent_60%)]"/>
                            
                            <div className="relative z-10 p-8 sm:p-10 lg:p-12 flex flex-col xl:flex-row items-center gap-8 xl:gap-12">
                                <div className="flex-1 flex flex-col gap-6 w-full">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider">
                                            Đang học
                                        </span>
                                        <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-3 py-1.5 backdrop-blur-sm border border-white/10">
                                            <span className="text-orange-400 text-xs font-bold uppercase tracking-wider">★</span>
                                            <span className="text-white text-xs font-bold">4.5 / 5.0</span>
                                        </div>
                                    </div>
                                    <div>
                                        <h1 className="text-4xl sm:text-5xl lg:text-5xl font-black text-white tracking-tight leading-tight line-clamp-2">
                                            {activeCourseData.courseName}
                                        </h1>
                                    </div>
                                    <p className="text-base text-slate-300 max-w-xl leading-relaxed line-clamp-3">
                                        {activeCourseData.description || "Nâng cao kỹ thuật lập trình qua dự án thực tế. Quản lý thời gian, tối ưu hiệu suất và chuẩn bị cho môi trường làm việc."}
                                    </p>
                                    
                                    <div className="flex flex-wrap items-center gap-6 pt-2">
                                        <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold active:scale-95 transition-all shadow-lg shadow-orange-500/30 flex items-center gap-2 text-sm">
                                            <Play className="w-4 h-4 fill-current"/>
                                            Sử dụng IDE
                                        </button>

                                        <div className="flex flex-col gap-2">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tiến độ</span>
                                            <div className="flex items-center gap-3">
                                                <div className="w-40 h-2 bg-slate-700 rounded-full overflow-hidden">
                                                    <div className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full shadow-sm" style={{ width: `${coursePercent}%` }}/>
                                                </div>
                                                <span className="text-orange-400 font-bold text-sm">{coursePercent}%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="w-full xl:w-[340px] shrink-0 aspect-[4/3] bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden relative shadow-2xl flex flex-col">
                                    <div className="w-full h-9 bg-slate-900 border-b border-slate-700 flex items-center px-4 gap-2 shrink-0">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-500 hover:bg-red-600 transition cursor-pointer"/>
                                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 hover:bg-yellow-600 transition cursor-pointer"/>
                                        <div className="w-2.5 h-2.5 rounded-full bg-green-500 hover:bg-green-600 transition cursor-pointer"/>
                                        <span className="ml-auto text-xs text-slate-500 font-mono">Preview Course.tsx</span>
                                    </div>
                                    
                                    {previewVideoUrl ? (
                                        <PreviewVideoPlayer videoUrl={previewVideoUrl} />
                                    ) : (
                                        <>
                                            <div className="flex-1 p-4 font-mono text-xs leading-6 overflow-hidden select-none">
                                                <div><span className="text-pink-400">export const</span> <span className="text-blue-300">Architecture</span> <span className="text-slate-400">= () =&gt;</span> {'{'}</div>
                                                <div className="pl-4"><span className="text-pink-400">return</span> <span className="text-slate-400">(</span></div>
                                                <div className="pl-8"><span className="text-slate-500">&lt;</span><span className="text-orange-400">Provider</span> <span className="text-blue-300">store</span><span className="text-slate-400">={'{'}</span><span className="text-yellow-300">store</span><span className="text-slate-400">{'}'}</span><span className="text-slate-500">&gt;</span></div>
                                                <div className="pl-12"><span className="text-slate-500">&lt;</span><span className="text-orange-400">AppLayout</span> <span className="text-slate-500">/&gt;</span></div>
                                                <div className="pl-8"><span className="text-slate-500">&lt;/</span><span className="text-orange-400">Provider</span><span className="text-slate-500">&gt;</span></div>
                                                <div className="pl-4"><span className="text-slate-400">);</span></div>
                                                <div><span className="text-slate-400">{'}'}</span><span className="text-slate-500">;</span></div>
                                            </div>
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                <div className="w-12 h-12 bg-white/5 backdrop-blur-md rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition pointer-events-auto cursor-pointer">
                                                    <Play className="w-5 h-5 ml-0.5 fill-current"/>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </section>

                        <section className="flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Danh sách Module</h2>
                                    <p className="text-sm text-slate-500 mt-1">{displayModules.length} module</p>
                                </div>
                                
                                {/* Nút mũi tên chỉ hiện nếu đang ở chế độ SLIDER */}
                                {layout === 'slider' && (
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleScroll('left')} className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-orange-600 hover:border-orange-200 hover:bg-orange-50 transition active:scale-95">
                                            <ChevronLeft className="w-4 h-4"/>
                                        </button>
                                        <button onClick={() => handleScroll('right')} className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-orange-600 hover:border-orange-200 hover:bg-orange-50 transition active:scale-95">
                                            <ChevronRight className="w-4 h-4"/>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* CONTAINER THEO DYNAMIC LAYOUT */}
                            <div id="modules-scroll" 
                                 className={
                                     layout === 'grid' 
                                         ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pt-4 pb-6" 
                                         : layout === 'list'
                                         ? "flex flex-col gap-4 pt-4 pb-6"
                                         : "flex gap-5 overflow-x-auto pt-4 pb-6 px-4 -mx-4 snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                                 }>
                                {isLoadingModules ? (
                                    <div className="text-slate-500 font-medium px-4">Đang tải danh sách module...</div>
                                ) : displayModules.length === 0 ? (
                                    <div className="text-slate-500 font-medium px-4">Đang tải module nào trong khóa học này...</div>
                                ) : (
                                    displayModules.map((mod, index) => {
                                        const isUnlocked = mod.isUnlocked; 
                                        const displayNumber = String(index + 1).padStart(2, '0');
                                        
                                        const modProgress = moduleProgress[mod.id] || { total: 0, completed: 0 };
                                        const modPercent = modProgress.total > 0 ? Math.round((modProgress.completed / modProgress.total) * 100) : 0;

                                        // RENDER GIAO DIỆN DẠNG LIST
                                        if (layout === 'list') {
                                            return (
                                                <div 
                                                    key={mod.id} 
                                                    onClick={() => isUnlocked && navigate(`/courses/${activeCourseId}/modules/${mod.id}`, { state: { courseName: activeCourseData.courseName, moduleName: mod.moduleName } })}
                                                    className={`w-full flex items-center gap-3 sm:gap-5 p-3 sm:p-4 rounded-2xl border transition-all duration-300 ${isUnlocked ? 'bg-white border-slate-200 hover:border-orange-300 hover:shadow-md cursor-pointer' : 'bg-slate-50 border-slate-100 opacity-75 cursor-not-allowed group'}`}
                                                >
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 ${isUnlocked ? 'bg-orange-50 text-orange-500' : 'bg-slate-100 text-slate-400'}`}>
                                                        {displayNumber}
                                                    </div>
                                                    
                                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className={`text-base font-bold truncate leading-none ${isUnlocked ? 'text-slate-900' : 'text-slate-500'}`}>{mod.moduleName}</h3>
                                                            {isUnlocked ? (
                                                                mod.isCompleted ? (
                                                                    <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full shrink-0">Đã xong</span>
                                                                ) : (
                                                                    <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100 shrink-0">Đang học</span>
                                                                )
                                                            ) : null}
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-xs text-slate-500 truncate max-w-[200px] sm:max-w-md">{mod.description || "Chưa có mô tả cho module này."}</span>
                                                            <div className="hidden sm:flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                                                <BookOpen size={10}/> {topicCounts[mod.id] || 0}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    {isUnlocked ? (
                                                        <div className="flex items-center gap-4 shrink-0 pl-2 border-l border-slate-100">
                                                            <div className="hidden md:flex flex-col items-end gap-1.5 w-32">
                                                                <span className="text-[10px] font-bold text-slate-400">{modPercent}% Hoàn thành</span>
                                                                <div className="w-full h-1.5 bg-orange-50 rounded-full overflow-hidden">
                                                                    <div className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full" style={{ width: `${modPercent}%` }}/>
                                                                </div>
                                                            </div>
                                                            <button className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-colors shrink-0">
                                                                <Play className="w-4 h-4 fill-current ml-0.5"/>
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-4 shrink-0 pl-2 border-l border-slate-100">
                                                            <div className="hidden md:flex flex-col items-end gap-1.5 w-32">
                                                                <span className="text-[10px] font-bold text-slate-400">Yêu cầu module trước</span>
                                                                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                                    <div className="h-full bg-slate-200 rounded-full" style={{ width: `0%` }}/>
                                                                </div>
                                                            </div>
                                                            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
                                                                <Lock className="w-4 h-4" strokeWidth={2.5}/>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        }

                                        // RENDER GIAO DIỆN DẠNG SLIDER VÀ GRID (Mặc định)
                                        const cardWidthClass = layout === 'grid' ? 'w-full' : 'w-[280px] sm:w-[300px] shrink-0 snap-start';
                                        
                                        if (isUnlocked) {
                                            return (
                                                <div key={mod.id} onClick={() => navigate(`/courses/${activeCourseId}/modules/${mod.id}`, { state: { courseName: activeCourseData.courseName, moduleName: mod.moduleName } })} className={`${cardWidthClass} cursor-pointer`}>
                                                    <div className="h-full bg-white rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden shadow-lg hover:shadow-xl shadow-orange-500/10 ring-2 ring-orange-500 hover:-translate-y-1 transition-all duration-300">
                                                        <div className="absolute -top-16 -right-16 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"/>
                                                        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl pointer-events-none"/>
                                                        
                                                        <div className="flex items-start justify-between relative z-10">
                                                            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center font-bold text-base">
                                                                {displayNumber}
                                                            </div>
                                                            <div className="bg-orange-50 text-orange-500 px-3 py-1.5 rounded-lg border border-orange-200 flex items-center gap-1.5">
                                                                {mod.isCompleted ? (
                                                                    <span className="text-xs font-bold text-green-600">Đã xong ✓</span>
                                                                ) : (
                                                                    <>
                                                                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"/>
                                                                        <span className="text-xs font-bold">Đang học</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col gap-1.5 relative z-10">
                                                            <h3 className="text-base font-bold text-slate-900 leading-snug">{mod.moduleName}</h3>
                                                            <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                                                                {mod.description || "Chưa có mô tả cho module này."}
                                                            </p>
                                                        </div>
                                                        <div className="mt-auto pt-4 border-t border-slate-200 flex flex-col gap-3 relative z-10">
                                                            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                                                                <span>Mã: {mod.moduleCode}</span>
                                                                <span className="text-orange-600 bg-orange-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                                                                    <BookOpen size={12}/> {topicCounts[mod.id] || 0} Topics
                                                                </span>
                                                            </div>
                                                            <div className="w-full h-1.5 bg-orange-50 rounded-full overflow-hidden">
                                                                <div className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full" style={{ width: `${modPercent}%` }}/>
                                                            </div>
                                                            <button className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg transition flex items-center justify-center gap-2">
                                                                <Play className="w-3 h-3 fill-current"/>
                                                                Học ngay
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        } else {
                                            return (
                                                <div key={mod.id} className={`${cardWidthClass} group`}>
                                                    <div className="h-full bg-white border border-slate-200 rounded-2xl p-6 flex flex-col gap-4 shadow-sm hover:shadow-md hover:border-slate-300 opacity-60 group-hover:opacity-75 transition-all duration-300 cursor-not-allowed">
                                                        <div className="flex items-start justify-between">
                                                            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-base">
                                                                {displayNumber}
                                                            </div>
                                                            <div className="bg-slate-100 text-slate-400 p-2 rounded-xl border border-slate-200 flex items-center justify-center">
                                                                <Lock className="w-4 h-4" strokeWidth={2.5}/>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col gap-1.5">
                                                            <h3 className="text-base font-bold text-slate-500 leading-snug">{mod.moduleName}</h3>
                                                            <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                                                                {mod.description || "Chưa có mô tả cho module này."}
                                                            </p>
                                                        </div>
                                                        <div className="mt-auto pt-4 border-t border-slate-200 flex flex-col gap-3">
                                                            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                                                                <span>Mã: {mod.moduleCode}</span>
                                                                <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                                                                    <BookOpen size={12}/> {topicCounts[mod.id] || 0} Topics
                                                                </span>
                                                            </div>
                                                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                                <div className="h-full bg-slate-300 rounded-full" style={{ width: `${modPercent}%` }}/>
                                                            </div>
                                                            <button className="w-full py-2.5 bg-slate-100 text-slate-400 text-xs font-bold rounded-lg cursor-not-allowed" disabled>
                                                                Bài Khóa - Hoàn thành module trước
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }
                                    })
                                )}
                            </div>
                        </section>
                    </div>
                </main>
            </div>
        </div>
    )
}