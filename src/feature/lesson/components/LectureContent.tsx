import { Play, Pause, Volume2, VolumeX, Maximize, Sparkles, CheckCircle2 } from "lucide-react";
import { useRef, useState } from "react";
import type { Lesson } from "../../../types/lesson.ts";
import { SafeHtmlContent } from "../../../components/lesson/common/SafeHtmlContent";
import { highlightTimestamps } from "../../../utils/highlightTimestamps";
import { toast } from "sonner";

interface LectureContentProps {
    lesson: Lesson;
    showSummary: boolean;
    onComplete?: (xp: number) => void;
}

export function LectureContent({ lesson, showSummary, onComplete }: LectureContentProps) {
    const enhancedContent = highlightTimestamps(lesson.content);
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState("00:00");
    const [duration, setDuration] = useState("00:00");
    const [isMuted, setIsMuted] = useState(false);
    
    // Logic chống tua
    const [maxTimeWatched, setMaxTimeWatched] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);

    const formatTime = (timeInSeconds: number) => {
        const m = Math.floor(timeInSeconds / 60).toString().padStart(2, '0');
        const s = Math.floor(timeInSeconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) videoRef.current.pause();
            else videoRef.current.play();
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        const video = videoRef.current;
        if (!video) return;

        // Cập nhật mốc xem xa nhất
        if (!video.seeking && video.currentTime > maxTimeWatched) {
            setMaxTimeWatched(video.currentTime);
        }

        setProgress((video.currentTime / video.duration) * 100);
        setCurrentTime(formatTime(video.currentTime));

        // Kích hoạt hoàn thành 90%
        if (video.duration && !isCompleted && (video.currentTime / video.duration) >= 0.9) {
            setIsCompleted(true);
            toast.success("Tuyệt vời! Bạn đã hoàn thành video và nhận +10 XP 🏆");
            onComplete?.(10);
        }
    };

    // Khi người dùng click vào thanh tiến độ custom
    const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const video = videoRef.current;
        if (!video) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const clickPosition = (e.clientX - rect.left) / rect.width;
        const targetTime = clickPosition * video.duration;

        // CHỐNG TUA: Nếu click vượt quá mốc đã xem -> Chặn lại
        if (targetTime > maxTimeWatched && !isCompleted) {
            toast.warning("Bạn không thể tua qua phần chưa xem nhé!");
            return;
        }

        video.currentTime = targetTime;
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const toggleFullScreen = () => {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else if (containerRef.current) {
            containerRef.current.requestFullscreen();
        }
    };

    return (
        <div className="flex flex-col gap-4">
            {/* TRÌNH PHÁT VIDEO CUSTOM */}
            <div ref={containerRef} className="relative flex aspect-video items-center justify-center rounded-xl bg-black overflow-hidden shadow-lg group">
                <video 
                    ref={videoRef}
                    src={lesson.videoUrl || undefined}
                    className="h-full w-full cursor-pointer"
                    onClick={togglePlay}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={(e) => setDuration(formatTime(e.currentTarget.duration))}
                    onEnded={() => setIsPlaying(false)}
                />

                {/* Badge Hoàn thành */}
                {isCompleted && (
                    <div className="absolute top-4 right-4 bg-emerald-500/90 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 backdrop-blur-sm z-10 animate-in fade-in">
                        <CheckCircle2 className="w-4 h-4" /> Đã xem xong
                    </div>
                )}
 
                {/* THANH ĐIỀU KHIỂN XỊN SÒ (Hiện khi hover) */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    
                    {/* Thanh Progress */}
                    <div 
                        className="w-full h-1.5 bg-white/30 rounded-full mb-3 cursor-pointer relative group/bar hover:h-2 transition-all"
                        onClick={handleProgressBarClick}
                    >
                        {/* Thanh thể hiện đoạn đã được phép xem tới */}
                        <div className="absolute top-0 left-0 h-full bg-white/40 rounded-full" style={{ width: `${videoRef.current ? (maxTimeWatched / videoRef.current.duration) * 100 : 0}%` }} />
                        {/* Thanh hiện tại màu cam */}
                        <div className="absolute top-0 left-0 h-full bg-orange-500 rounded-full" style={{ width: `${progress}%` }}>
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow scale-0 group-hover/bar:scale-100 transition-transform" />
                        </div>
                    </div>

                    {/* Nút bấm */}
                    <div className="flex items-center justify-between text-white">
                        <div className="flex items-center gap-4">
                            <button onClick={togglePlay} className="hover:text-orange-500 transition-colors">
                                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                            </button>
                            <button onClick={toggleMute} className="hover:text-orange-500 transition-colors">
                                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                            </button>
                            <span className="text-xs font-medium font-mono">
                                {currentTime} <span className="text-white/50 mx-1">/</span> {duration}
                            </span>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Nút tốc độ */}
                            <select 
                                className="bg-transparent text-xs font-bold outline-none cursor-pointer hover:text-orange-500"
                                onChange={(e) => { if(videoRef.current) videoRef.current.playbackRate = parseFloat(e.target.value) }}
                                defaultValue="1"
                            >
                                <option value="0.5" className="text-black">0.5x</option>
                                <option value="1" className="text-black">1x</option>
                                <option value="1.5" className="text-black">1.5x</option>
                                <option value="2" className="text-black">2x</option>
                            </select>
                            <button onClick={toggleFullScreen} className="hover:text-orange-500 transition-colors">
                                <Maximize className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Nút Play to đùng ở giữa màn hình khi tạm dừng */}
                {!isPlaying && (
                    <button onClick={togglePlay} className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-16 h-16 bg-orange-500/90 backdrop-blur-sm text-white rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30 pointer-events-auto hover:scale-110 transition-transform">
                            <Play className="w-7 h-7 fill-current ml-1" />
                        </div>
                    </button>
                )}
            </div>

            {/* BẢNG TÓM TẮT AI */}
            {showSummary && (
                <div className="rounded-xl border border-orange-200 bg-white p-5 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-sm font-bold text-orange-600">
                            <Sparkles className="h-4 w-4"/> Tóm tắt bởi AI
                        </div>
                    </div>
                    <SafeHtmlContent html={enhancedContent} fallback="Chưa có tóm tắt cho bài giảng này." />
                </div>
            )}
        </div>
    );
}
