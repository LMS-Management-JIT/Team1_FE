import React, { useState, useEffect } from 'react'
import {
  Zap, Layers, Server, Check, Play, Lock,
  ChevronRight, ChevronLeft, Home, Grid3x3, Star, BookOpen
} from 'lucide-react'
import { Header } from "../../layouts/Header/Header"

import type { ModuleResponse } from "../../types/module";
import type { DashboardCourse } from "../../types/dashboard";
import { getModulesByCourseId } from "../../services/moduleService";
import { getStudentCourses } from "../../services/dashboardService";
import { getTopicsByModule } from "../../services/topicService"; // <-- THÊM IMPORT NÀY
import { useParams, useNavigate } from 'react-router-dom';

const STUDENT_ID = "F6nosEpzCBMUBZeAyHCM"; 

// 1. LOGIC TÍNH TOÁN ICON THÔNG MINH
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
};

// 2. COMPONENT THẺ SIDEBAR
const SidebarCourseCard = ({ course, index, isActive, onClick }: { course: DashboardCourse, index: number, isActive: boolean, onClick: () => void }) => {
  const [imgError, setImgError] = useState(!course.thumbnailUrl);
  const style = getCourseStyles(course, index);
  const Icon = style.Icon;

  const renderIconOrImage = (isWhiteText: boolean) => {
    if (!imgError && course.thumbnailUrl) {
      return <img src={course.thumbnailUrl} onError={() => setImgError(true)} alt={course.courseName} className="w-10 h-10 rounded-xl object-cover ring-1 ring-black/5 shrink-0 bg-white" />;
    }
    return (
      <div className={`w-10 h-10 rounded-xl ${isWhiteText ? 'bg-white/20 ring-1 ring-white/30' : style.bgClass} shrink-0 flex items-center justify-center transition`}>
        <Icon className={`${isWhiteText ? 'text-white fill-white' : style.colorClass} w-4 h-4`} strokeWidth={1.5} />
      </div>
    );
  };

  if (isActive) {
    return (
      <div onClick={onClick} className={`group flex flex-col gap-3 p-4 rounded-2xl ${style.activeBg} cursor-pointer relative overflow-hidden shadow-lg shadow-black/10 hover:shadow-xl transition-shadow`}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
        <div className="flex items-center gap-3 relative z-10">
          {renderIconOrImage(true)}
          <div className="flex flex-col gap-0.5 min-w-0">
            <h3 className="text-sm font-bold text-white leading-tight truncate">{course.courseName}</h3>
            <span className="text-xs font-medium text-white/80 truncate">{course.description || "Khóa học Dev Space"}</span>
          </div>
        </div>
        <div className="flex flex-col gap-1.5 relative z-10">
          <div className="flex justify-between text-xs font-bold text-white/90">
            <span>Progress</span><span>Đang học</span>
          </div>
          <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden"><div className="w-[30%] h-full bg-white rounded-full shadow-sm animate-pulse" /></div>
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
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between text-xs font-bold text-slate-400">
          <span>Progress</span><span>Chưa bắt đầu</span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="w-[0%] h-full bg-slate-300 rounded-full" /></div>
      </div>
    </div>
  );
};


// ==========================================
// TRANG CHÍNH: MODULES IN COURSE PAGE
// ==========================================
export default function ModulesInCoursePage() {
  const { courseId } = useParams<{ courseId: string }>(); 
  const navigate = useNavigate();

  const [myCourses, setMyCourses] = useState<DashboardCourse[]>([]);
  const [activeCourseId, setActiveCourseId] = useState<string>("");
  const [isLoadingCourses, setIsLoadingCourses] = useState<boolean>(true); // <-- THÊM LOADING CHO KHÓA HỌC

  const [modules, setModules] = useState<ModuleResponse[]>([]);
  const [isLoadingModules, setIsLoadingModules] = useState<boolean>(false);
  
  // Lưu trữ số lượng topics của mỗi module (Key là Module ID, Value là số lượng)
  const [topicCounts, setTopicCounts] = useState<Record<string, number>>({}); 

  // Lần đầu vào trang: Tải danh sách khóa học
  useEffect(() => {
    setIsLoadingCourses(true);
    getStudentCourses(STUDENT_ID).then(data => {
      setMyCourses(data);
      if (data.length > 0) {
        const selectedId = courseId || data[0].id;
        setActiveCourseId(selectedId);
      }
    }).catch(err => console.error("Lỗi tải danh sách khóa học:", err))
      .finally(() => setIsLoadingCourses(false));
  }, [courseId]);

  // Hàm chuyên dụng để tải danh sách module VÀ đếm số topic cho từng module
  const fetchModulesAndTopics = async (courseIdToFetch: string, showLoadingIndicator = false) => {
    if (showLoadingIndicator) setIsLoadingModules(true);
    try {
      // 1. Lấy Modules
      const modulesData = await getModulesByCourseId(courseIdToFetch);
      setModules(modulesData); 

      // 2. Lấy Topic Counts đồng loạt bằng Promise.all để tăng tốc
      const counts: Record<string, number> = {};
      await Promise.all(modulesData.map(async (mod) => {
        try {
          const topics = await getTopicsByModule(mod.id);
          counts[mod.id] = topics.length;
        } catch {
          counts[mod.id] = 0; // Lỗi thì mặc định là 0
        }
      }));
      setTopicCounts(counts);

    } catch (error) {
      console.error("Lỗi khi fetch dữ liệu modules/topics:", error);
    } finally {
      if (showLoadingIndicator) setIsLoadingModules(false); 
    }
  };

  // Gọi hàm tải Module khi chọn Khóa học mới
  useEffect(() => {
    if (!activeCourseId) return;
    fetchModulesAndTopics(activeCourseId, true);
  }, [activeCourseId]);

  // BACKGROUND POLLING: CẬP NHẬT NGẦM MỖI 5 GIÂY (Không làm giật UI Loading)
  useEffect(() => {
    if (!activeCourseId) return;

    const pollData = async () => {
      try {
        const latestCourses = await getStudentCourses(STUDENT_ID);
        setMyCourses(latestCourses); 
        const courseStillExists = latestCourses.find(c => c.id === activeCourseId);
        
        if (!courseStillExists) {
          if (latestCourses.length > 0) navigate(`/courses/${latestCourses[0].id}/modules`);
          else navigate('/');
          return; 
        }
        // Cập nhật ngầm modules và topic counts
        fetchModulesAndTopics(activeCourseId, false); 
      } catch (error) {
        console.error("Lỗi khi cập nhật dữ liệu ngầm:", error);
      }
    };
    const intervalId = setInterval(pollData, 5000);
    return () => clearInterval(intervalId);
  }, [activeCourseId, navigate]);

  const handleScroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('modules-scroll')
    if (container) {
      const scrollAmount = 320
      container.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' })
    }
  }

  const activeCourseData = myCourses.find(c => c.id === activeCourseId) || {
    courseName: isLoadingCourses ? "Đang tải dữ liệu..." : "Chưa có khóa học",
    description: isLoadingCourses ? "Vui lòng chờ trong giây lát..." : ""
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 text-slate-900 font-sans antialiased overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        
        {/* ── LEFT SIDEBAR ── */}
        <aside className="w-[280px] bg-white border-r border-slate-200 flex flex-col shrink-0 h-full z-20 shadow-sm">
          <div className="h-[72px] px-6 border-b border-slate-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shadow-md shadow-orange-500/30">
                <Zap className="w-4 h-4 text-white fill-white" strokeWidth={2.5} />
              </div>
              <span className="text-sm font-bold tracking-tight text-slate-900">Dev Space</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-md shadow-slate-900/20">
              <svg height="20" viewBox="0 0 16 16" width="20" fill="#FFFFFF"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path></svg>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="px-6 pt-6 pb-3 flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">My Courses</h2>
              <span className="bg-orange-50 text-orange-600 text-xs font-bold px-2 py-0.5 rounded-full border border-orange-100">
                {myCourses.length}
              </span>
            </div>

            <div className="flex flex-col gap-2 px-3 pb-8">
              {/* HIỂN THỊ ĐANG TẢI CHO COURSE CHỐNG CHỚP MÀN HÌNH */}
              {isLoadingCourses ? (
                 <div className="px-3 text-sm text-slate-400 text-center mt-4 flex flex-col items-center gap-3">
                   <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                   Đang tải khóa học...
                 </div>
              ) : myCourses.length === 0 ? (
                 <div className="px-3 text-sm text-slate-400 text-center mt-4">Không có khóa học nào</div>
              ) : (
                myCourses.map((course, index) => (
                  <SidebarCourseCard key={course.id} course={course} index={index} isActive={activeCourseId === course.id} onClick={() => setActiveCourseId(course.id)} />
                ))
              )}
            </div>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="flex-1 h-full overflow-y-auto overflow-x-hidden flex flex-col relative">
          <header className="w-full h-[72px] px-6 lg:px-8 flex shrink-0 items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-40 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <span onClick={() => navigate('/')} className="hover:text-orange-600 cursor-pointer transition flex items-center gap-1.5 hover:bg-orange-50 px-2.5 py-1.5 rounded-lg">
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Khóa học của tôi</span>
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span className="text-slate-700 font-semibold truncate max-w-[180px] sm:max-w-none">
                {activeCourseData.courseName}
              </span>
            </div>
            <button className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-orange-600 transition px-3 py-2 rounded-lg hover:bg-orange-50 border border-transparent hover:border-orange-200">
              <Grid3x3 className="w-4 h-4" />
              <span className="hidden sm:inline">Curriculum</span>
            </button>
          </header>

          <div className="p-6 sm:p-8 flex flex-col gap-8 max-w-[1400px] w-full mx-auto">
            {/* ── HERO BANNER ── */}
            <section className="w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl shadow-slate-900/30 relative transition-all duration-500">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(249,115,22,0.2),transparent_70%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(249,115,22,0.08),transparent_60%)]" />
              <div className="relative z-10 p-8 sm:p-10 lg:p-12 flex flex-col xl:flex-row items-center gap-8 xl:gap-12">
                <div className="flex-1 flex flex-col gap-6 w-full">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider">Enrolled</span>
                    <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-3 py-1.5 backdrop-blur-sm border border-white/10">
                      <span className="text-orange-400 text-xs font-bold uppercase tracking-wider">Difficulty</span>
                      <span className="text-white text-xs font-bold">4.5 / 5.0</span>
                    </div>
                  </div>
                  <div>
                    <h1 className="text-4xl sm:text-5xl lg:text-5xl font-black text-white tracking-tight leading-tight line-clamp-2">
                      {activeCourseData.courseName}
                    </h1>
                  </div>
                  <p className="text-base text-slate-300 max-w-xl leading-relaxed line-clamp-3">
                    {activeCourseData.description || "Nắm vững các kỹ thuật liên quan thông qua dự án thực tế. Quản lý trạng thái, tối ưu hiệu suất và chuẩn bị cho môi trường làm việc."}
                  </p>
                  <div className="flex flex-wrap items-center gap-6 pt-2">
                    <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold active:scale-95 transition-all shadow-lg shadow-orange-500/30 flex items-center gap-2 text-sm">
                      <Play className="w-4 h-4 fill-current" />
                      Resume IDE
                    </button>
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Progress</span>
                      <div className="flex items-center gap-3">
                        <div className="w-40 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div className="w-[30%] h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full shadow-sm" />
                        </div>
                        <span className="text-orange-400 font-bold text-sm">30%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full xl:w-[340px] shrink-0 aspect-[4/3] bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden relative shadow-2xl flex flex-col">
                  <div className="w-full h-9 bg-slate-900 border-b border-slate-700 flex items-center px-4 gap-2 shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 hover:bg-red-600 transition cursor-pointer" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 hover:bg-yellow-600 transition cursor-pointer" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 hover:bg-green-600 transition cursor-pointer" />
                    <span className="ml-auto text-xs text-slate-500 font-mono">Architecture.tsx</span>
                  </div>
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
                      <Play className="w-5 h-5 ml-0.5 fill-current" />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ── MODULES ── */}
            <section className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Course Modules</h2>
                  <p className="text-sm text-slate-500 mt-1">{modules.length} modules</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleScroll('left')} className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-orange-600 hover:border-orange-200 hover:bg-orange-50 transition active:scale-95">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleScroll('right')} className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-orange-600 hover:border-orange-200 hover:bg-orange-50 transition active:scale-95">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div id="modules-scroll" className="flex gap-5 overflow-x-auto pt-4 pb-6 px-4 -mx-4 snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                
                {/* HIỂN THỊ ĐANG TẢI CHO MODULE */}
                {isLoadingModules ? (
                  <div className="text-slate-500 font-medium px-4 flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                    Đang tải danh sách module và chủ đề...
                  </div>
                ) : modules.length === 0 ? (
                  <div className="text-slate-500 font-medium px-4">Chưa có module nào trong khóa học này.</div>
                ) : (
                  modules.map((mod, index) => {
                    const isFirst = index === 0;
                    const displayNumber = String(index + 1).padStart(2, '0');
                    // Lấy số lượng topic từ State, mặc định 0 nếu chưa fetch kịp
                    const topicCount = topicCounts[mod.id] || 0; 

                    if (isFirst) {
                      return (
                        <div key={mod.id} className="w-[280px] sm:w-[300px] shrink-0 snap-start">
                          <div className="h-full bg-white rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden shadow-lg hover:shadow-xl shadow-orange-500/10 ring-2 ring-orange-500 hover:-translate-y-1 transition-all duration-300">
                            <div className="absolute -top-16 -right-16 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
                            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />

                            <div className="flex items-start justify-between relative z-10">
                              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center font-bold text-base">
                                {displayNumber}
                              </div>
                              <div className="bg-orange-50 text-orange-500 px-3 py-1.5 rounded-lg border border-orange-200 flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
                                <span className="text-xs font-bold">In Progress</span>
                              </div>
                            </div>
                            <div className="flex flex-col gap-1.5 relative z-10">
                              <h3 className="text-base font-bold text-slate-900 leading-snug">{mod.moduleName}</h3>
                              <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                                {mod.description || "Chưa có mô tả."}
                              </p>
                            </div>
                            <div className="mt-auto pt-4 border-t border-slate-200 flex flex-col gap-3 relative z-10">
                              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                                <span>Mã: {mod.moduleCode}</span>
                                {/* HIỂN THỊ SỐ LƯỢNG TOPIC */}
                                <span className="text-orange-600 bg-orange-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                                  <BookOpen size={12}/> {topicCount} Topics
                                </span>
                              </div>
                              <div className="w-full h-1.5 bg-orange-50 rounded-full overflow-hidden">
                                <div className="w-[45%] h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full" />
                              </div>
                              {/* THÊM NÚT CLICK ĐỂ CHUYỂN TRANG TOPIC */}
                              <button 
                                onClick={() => navigate(`/topics/${mod.id}`, { 
                                  state: { 
                                    courseId: activeCourseId,
                                    courseName: activeCourseData.courseName,
                                    moduleName: mod.moduleName 
                                  } 
                                })}
                                className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg transition flex items-center justify-center gap-2"
                              >
                                <Play className="w-3 h-3 fill-current" />
                                Vào học ngay
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div key={mod.id} className="w-[280px] sm:w-[300px] shrink-0 snap-start group">
                          <div className="h-full bg-white border border-slate-200 rounded-2xl p-6 flex flex-col gap-4 shadow-sm hover:shadow-md hover:border-slate-300 opacity-60 hover:opacity-100 transition-all duration-300">
                            <div className="flex items-start justify-between">
                              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-base">
                                {displayNumber}
                              </div>
                              <div className="bg-slate-100 text-slate-400 p-2 rounded-xl border border-slate-200">
                                <Lock className="w-4 h-4" strokeWidth={2.5} />
                              </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <h3 className="text-base font-bold text-slate-700 leading-snug">{mod.moduleName}</h3>
                              <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                                {mod.description || "Chưa có mô tả."}
                              </p>
                            </div>
                            <div className="mt-auto pt-4 border-t border-slate-200 flex flex-col gap-3">
                              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                                <span>Mã: {mod.moduleCode}</span>
                                {/* HIỂN THỊ SỐ LƯỢNG TOPIC */}
                                <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                                  <BookOpen size={12}/> {topicCount} Topics
                                </span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="w-0 h-full bg-slate-300 rounded-full" />
                              </div>
                              {/* ĐÃ MỞ KHÓA NÚT CLICK ĐỂ BẠN DỄ DÀNG TEST CODE TRÊN FRONTEND */}
                              <button 
                                onClick={() => navigate(`/topics/${mod.id}`)}
                                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg transition"
                              >
                                Xem nội dung
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