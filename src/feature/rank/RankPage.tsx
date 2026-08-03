import { useEffect, useState } from 'react';
import { Header } from "../../layouts/Header/Header";
import { Trophy, ArrowUp, ArrowDown, Minus, Crown, Flame, Medal, Sparkles, Gift, Lock } from 'lucide-react';
// Nhớ import thêm hàm initStudentRankIfNeeded từ rankService nhé
import { getLeaderboard, initStudentRankIfNeeded, type RankResponse } from '../../services/rankService';
import { useAuth } from '../../services/authService';
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

// ==========================================
// COMPONENT 1: HIỆU ỨNG MƯA CODE (CODE RAIN)
// ==========================================
const KEYWORDS = ["if", "else", "while", "for", "const", "let", "function", "=>", "<div>", "UI", "UX", "Java", "React", "Spring", "SQL", "{ }", "[ ]", "console.log", "async", "await"];

const CodeRain = () => {
    const [particles, setParticles] = useState<any[]>([]);
    
    useEffect(() => {
        // Tạo ra 30 hạt mờ mờ rơi ngẫu nhiên trên màn hình
        const generated = Array.from({ length: 30 }).map((_, i) => ({
            id: i,
            text: KEYWORDS[Math.floor(Math.random() * KEYWORDS.length)],
            left: `${Math.random() * 100}%`,
            animationDuration: `${10 + Math.random() * 20}s`, // Rơi chậm từ 10s đến 30s
            animationDelay: `-${Math.random() * 20}s`, // Chênh lệch thời gian bắt đầu
            fontSize: `${0.7 + Math.random() * 1}rem`,
            opacity: 0.05 + Math.random() * 0.15 // Độ mờ cực thấp (5% - 20%) để không làm rối mắt
        }));
        setParticles(generated);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            {particles.map(p => (
                <div
                    key={p.id}
                    className="absolute text-slate-400 font-mono font-bold whitespace-nowrap animate-[codeFall_linear_infinite] select-none"
                    style={{
                        left: p.left,
                        top: '-10%',
                        animationDuration: p.animationDuration,
                        animationDelay: p.animationDelay,
                        fontSize: p.fontSize,
                        opacity: p.opacity,
                    }}
                >
                    {p.text}
                </div>
            ))}
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes codeFall {
                    0% { transform: translateY(-10vh); }
                    100% { transform: translateY(110vh); }
                }
            `}} />
        </div>
    );
};

// ==========================================
// COMPONENT 2: HÀNH TRÌNH PHẦN THƯỞNG (REWARD PROGRESS)
// ==========================================
const RewardProgress = ({ currentRank }: { currentRank: number }) => {
    const steps = [
        { limit: 10, label: "Top 10", reward: "Khung Tân Binh" },
        { limit: 5, label: "Top 5", reward: "Huy hiệu Chuyên Gia" },
        { limit: 3, label: "Top 3", reward: "Cup Trung Quân" },
        { limit: 2, label: "Top 2", reward: "Cup Á Quân" },
        { limit: 1, label: "Top 1", reward: "Rương Thần Bí" }
    ];

    // Tính toán độ dài thanh tiến trình
    const getProgressWidth = () => {
        if (!currentRank || currentRank > 10) return '0%';
        if (currentRank === 1) return '100%';
        if (currentRank <= 2) return '66.66%';
        if (currentRank <= 5) return '33.33%';
        return '0%'; // Đến được mốc 1 (Top 10)
    };

    return (
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-slate-200 relative z-10 mx-4 sm:mx-0 mt-8 mb-4">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                        <Gift className="text-orange-500 w-5 h-5" /> 
                        Hành Trình Phần Thưởng
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Vượt qua các cột mốc để mở khóa những phần quà giá trị!</p>
                </div>
            </div>

            <div className="relative px-2 sm:px-10">
                {/* Thanh nền mờ */}
                <div className="absolute left-6 right-6 sm:left-14 sm:right-14 top-1/2 -translate-y-1/2 h-2.5 bg-slate-100 rounded-full shadow-inner" />
                
                {/* Thanh tiến trình đang chạy */}
                <div 
                    className="absolute left-6 sm:left-14 top-1/2 -translate-y-1/2 h-2.5 bg-gradient-to-r from-orange-400 via-orange-500 to-yellow-400 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(249,115,22,0.4)]" 
                    style={{ width: `calc(${getProgressWidth()} - 0px)` }} 
                />

                <div className="relative flex justify-between items-center">
                    {steps.map((step) => {
                        const isUnlocked = currentRank > 0 && currentRank <= step.limit;

                        return (
                            <div key={step.limit} className="flex flex-col items-center group relative">
                                {/* Tooltip tên phần thưởng hiển thị khi di chuột */}
                                <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs font-bold py-1.5 px-3 rounded-lg shadow-lg whitespace-nowrap pointer-events-none z-20">
                                    {step.reward}
                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
                                </div>

                                {/* Khối tròn (Node) */}
                                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center relative z-10 border-4 transition-all duration-500 ${isUnlocked ? 'bg-orange-50 border-orange-500 text-orange-600 shadow-[0_0_15px_rgba(249,115,22,0.4)] scale-110' : 'bg-white border-slate-200 text-slate-300'}`}>
                                    {isUnlocked ? (
                                        step.limit === 1 ? <Gift className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse text-yellow-500 fill-yellow-100" /> : <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
                                    ) : (
                                        <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                                    )}
                                </div>

                                {/* Nhãn Top */}
                                <div className="absolute top-12 sm:top-14 text-center w-24">
                                    <div className={`font-black text-xs sm:text-sm ${isUnlocked ? 'text-orange-600' : 'text-slate-400'}`}>{step.label}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            
            {/* Lời chúc động viên phía dưới */}
            <div className="mt-16 text-center">
                {!currentRank || currentRank === 0 ? (
                    <span className="inline-block bg-slate-100 text-slate-500 text-sm font-medium px-4 py-1.5 rounded-full">
                        Bạn chưa có thứ hạng. Học bài ngay để đua top nhé!
                    </span>
                ) : currentRank > 10 ? (
                    <span className="inline-block bg-orange-50 text-orange-600 text-sm font-medium px-4 py-1.5 rounded-full border border-orange-200">
                        Hãy cố gắng lọt vào Top 10 để mở khóa quà đầu tiên!
                    </span>
                ) : currentRank > 5 ? (
                    <span className="inline-block bg-blue-50 text-blue-600 text-sm font-medium px-4 py-1.5 rounded-full border border-blue-200">
                        Tuyệt vời! Bạn đang trên đà chinh phục phần thưởng Top 5!
                    </span>
                ) : currentRank > 1 ? (
                    <span className="inline-block bg-emerald-50 text-emerald-600 text-sm font-medium px-4 py-1.5 rounded-full border border-emerald-200">
                        Xuất sắc! Bạn đang trên đà chinh phục phần thưởng Top 3!
                    </span>
                ) : (
                    <span className="inline-block bg-yellow-50 text-yellow-600 text-sm font-bold px-4 py-1.5 rounded-full border border-yellow-200 shadow-sm">
                        <Crown className="w-4 h-4 inline mb-0.5 mr-1" />
                        Vô địch! Bạn đã mở khóa toàn bộ rương quà!
                    </span>
                )}
            </div>
        </div>
    )
}

// ========================================== Team 1 FE,BE : PR tách logic quiz, tự động đồng bộ tiến độ khóa học lên firebase, ngăn cản truy cập module bị khóa, áp dụng khóa dây chuyền module, cải thiện UI tải và làm mới điều hướng. @Nguyễn Nam 
// TRANG CHÍNH: RANK PAGE
// ==========================================
export default function RankPage() {
    const { studentId, user, isLoading: isAuthLoading } = useAuth();
    
    const [leaderboard, setLeaderboard] = useState<RankResponse[]>([]);
    const [loading, setLoading] = useState(true);

    // Cập nhật useEffect để khởi tạo dữ liệu
    useEffect(() => {
        if (!studentId) return;

        const loadLeaderboardData = async () => {
            try {
                // 1. Khởi tạo rank nếu học viên chưa tồn tại (API gọi ngầm)
                await initStudentRankIfNeeded(studentId);
                
                // 2. Fetch danh sách leaderboard mới nhất
                const data = await getLeaderboard();
                setLeaderboard(data);
            } catch (err) {
                console.error("Lỗi lấy bxh:", err);
            } finally {
                setLoading(false);
            }
        };

        loadLeaderboardData();
    }, [studentId]);
    useEffect(() => {
        // Khởi tạo WebSocket lắng nghe sự kiện từ Kafka
        const SOCKET_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api").replace(/\/api\/?$/, "") + "/ws";
        
        const client = new Client({
            webSocketFactory: () => new SockJS(SOCKET_URL) as any,
            onConnect: () => {
                console.log("🟢 Bảng xếp hạng đã kết nối Live!");
                // Khi Kafka cộng xong XP, nó sẽ báo vào kênh này
                client.subscribe('/topic/ranks', () => {
                    console.log("⚡ Có người vừa lên điểm! Cập nhật lại BXH...");
                    // Reload lại API BXH âm thầm
                    getLeaderboard().then(setLeaderboard);
                });
            }
        });
        
        client.activate();
        return () => { client.deactivate(); };
    }, []);
    if (loading || isAuthLoading) {
        return (
            <div className="flex flex-col h-screen bg-slate-50 items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-500 font-medium animate-pulse">Đang tải bảng xếp hạng...</p>
            </div>
        );
    }

    const top3 = leaderboard.slice(0, 3);
    let others = leaderboard.slice(3);
    const podiumOrder = top3.length === 3 ? [top3[1], top3[0], top3[2]] : top3;
    
    let myRankIndex = leaderboard.findIndex(r => r.studentId === studentId);
    let myRank = myRankIndex !== -1 ? leaderboard[myRankIndex] : null;

    // --- LOGIC GIAO DIỆN MỚI ---
    // Nếu API DB bị delay và chưa trả về user hiện tại -> Tự tạo một rank giả 0 XP để hiển thị
    // --- LOGIC GIAO DIỆN MỚI ---
    if (!myRank && studentId) {
        const lastRankNumber = leaderboard.length > 0 ? leaderboard[leaderboard.length - 1].currentRank : 0;
        myRank = {
            studentId: studentId,
            // Sử dụng user.name, nếu chưa load kịp thì dùng mặc định
            studentName: user?.username || "Học viên mới", 
            // Có thể lấy luôn avatar của user nếu có, hoặc tạo tự động theo tên
            avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'New')}&background=random`, 
            totalXp: 0,
            currentRank: lastRankNumber + 1,
            trend: "SAME",
            // Thêm badge TÂN BINH
            badges: ["TÂN BINH"] 
        } as unknown as RankResponse;
        
        // Push user vào cuối danh sách other
        others = [...others, myRank];
        myRankIndex = leaderboard.length; // Index ảo của bạn
    }

    const userAboveMe = myRankIndex > 0 ? leaderboard[myRankIndex - 1] : null;

    const getTrendBadge = (trend: string) => {
        if (trend === 'UP') return <div className="bg-emerald-100 text-emerald-600 p-1.5 rounded-full shadow-sm border border-emerald-200"><ArrowUp className="w-3.5 h-3.5" strokeWidth={3} /></div>;
        if (trend === 'DOWN') return <div className="bg-red-100 text-red-500 p-1.5 rounded-full shadow-sm border border-red-200"><ArrowDown className="w-3.5 h-3.5" strokeWidth={3} /></div>;
        return <div className="bg-slate-100 text-slate-400 p-1.5 rounded-full shadow-sm border border-slate-200"><Minus className="w-3.5 h-3.5" strokeWidth={3} /></div>;
    };

    return (
        <div className="flex flex-col h-screen w-full bg-slate-50 text-slate-900 overflow-hidden relative">
            {/* Lớp nền Mưa Code cực cool */}
            <CodeRain />
            
            <Header />

            <main className="flex-1 overflow-y-auto pb-32 relative z-10">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col gap-8">
                    
                    {/* ── TIÊU ĐỀ ── */}
                    <div className="text-center space-y-3 relative z-10">
                        <div className="inline-flex items-center justify-center gap-2 bg-orange-100 text-orange-700 px-4 py-1.5 rounded-full text-sm font-bold mb-2 border border-orange-200 shadow-sm">
                            <Sparkles className="w-4 h-4" /> Đua Top Nhận Quà
                        </div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 flex items-center justify-center gap-3 tracking-tight">
                            <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-500 drop-shadow-md" />
                            Bảng Xếp Hạng
                        </h1>
                        <p className="text-slate-500 text-sm sm:text-base max-w-xl mx-auto">
                            Vinh danh những chiến thần Code xuất sắc nhất tuần.
                        </p>
                    </div>
                    
                    {/* ── 1. KHU VỰC DANH DỰ (PODIUM TOP 3) ── */}
                    <div className="relative flex justify-center items-end gap-2 sm:gap-4 md:gap-8 mt-20 h-[280px] sm:h-[320px] pb-6">
                        
                        {/* Bệ đỡ Podium (Platform) giúp 3 cột không bị bay lơ lửng */}
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[120%] sm:w-[90%] h-12 sm:h-20 bg-slate-200/50 rounded-[100%] blur-md -z-10" />
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[100%] sm:w-[75%] h-3 sm:h-4 bg-gradient-to-r from-transparent via-slate-300 to-transparent rounded-[100%] -z-10 shadow-sm" />

                        {podiumOrder.map((user) => {
                            const isTop1 = user.currentRank === 1;
                            const isTop2 = user.currentRank === 2;
                            
                            const heightClass = isTop1 ? "h-32 sm:h-44" : isTop2 ? "h-24 sm:h-32" : "h-20 sm:h-28";
                            const avatarSize = isTop1 ? "w-20 h-20 sm:w-28 sm:h-28" : "w-16 h-16 sm:w-20 sm:h-20";
                            
                            const bgClass = isTop1 ? "bg-gradient-to-t from-yellow-600 via-yellow-400 to-yellow-300" : isTop2 ? "bg-gradient-to-t from-slate-400 via-slate-300 to-slate-200" : "bg-gradient-to-t from-amber-700 via-amber-500 to-amber-400";
                            const ringClass = isTop1 ? "ring-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.6)]" : isTop2 ? "ring-slate-300" : "ring-amber-500";
                            const badgeColor = isTop1 ? "bg-yellow-500 text-white" : isTop2 ? "bg-slate-200 text-slate-700" : "bg-amber-600 text-white";

                            return (
                                <div key={user.studentId} className="flex flex-col items-center relative flex-1 max-w-[120px] sm:max-w-[160px] group">
                                    <div className="relative mb-4 flex flex-col items-center group-hover:-translate-y-3 transition-transform duration-500 ease-out z-20">
                                        {isTop1 && <Crown className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-500 absolute -top-8 sm:-top-10 animate-bounce drop-shadow-md" strokeWidth={2.5} />}
                                        <img src={user.avatarUrl} alt={user.studentName} className={`rounded-full object-cover ring-4 bg-white ${avatarSize} ${ringClass} transition-all`} />
                                        <div className={`absolute -bottom-3 sm:-bottom-4 ${badgeColor} text-xs sm:text-sm font-black px-3 sm:px-4 py-0.5 sm:py-1 rounded-full border-2 border-white shadow-md`}>
                                            #{user.currentRank}
                                        </div>
                                    </div>
                                    
                                    <div className="text-center z-20 mb-3 px-1">
                                        <h3 className="font-bold text-xs sm:text-sm text-slate-800 line-clamp-1">{user.studentName}</h3>
                                        <p className="text-xs sm:text-sm font-black text-orange-600 mt-0.5">{user.totalXp.toLocaleString()} <span className="text-[10px] sm:text-xs text-orange-400">XP</span></p>
                                    </div>

                                    <div className={`w-full rounded-t-2xl shadow-[inset_0_4px_12px_rgba(255,255,255,0.5)] flex justify-center pt-4 ${heightClass} ${bgClass} border-x border-t border-black/10 relative overflow-hidden transition-all duration-500 group-hover:brightness-110`}>
                                        <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent" />
                                        <span className="font-black text-black/10 text-5xl sm:text-7xl drop-shadow-sm">{user.currentRank}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* ── TIẾN ĐỘ PHẦN THƯỞNG ── */}
                    {myRank && <RewardProgress currentRank={myRank.currentRank} />}

                    {/* ── 3. BẢNG DANH SÁCH CHÍNH ── */}
                    <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden relative z-10">
                        <div className="p-4 sm:p-6 bg-slate-900 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="font-bold text-lg text-white">Bảng Xếp Hạng Tổng</h2>
                                <p className="text-xs text-slate-400 mt-1">Cập nhật theo thời gian thực</p>
                            </div>
                            <div className="flex bg-slate-800 rounded-lg p-1 w-full sm:w-auto">
                                <button className="flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold rounded-md bg-orange-500 text-white shadow-sm transition">Tuần này</button>
                                <button className="flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold rounded-md text-slate-400 hover:text-white transition">Tháng này</button>
                            </div>
                        </div>

                        <div className="divide-y divide-slate-100/80">
                            {others.map((user) => (
                                <div key={user.studentId} className={`flex items-center gap-3 sm:gap-6 p-4 sm:px-6 transition-colors duration-200 hover:bg-orange-50/50 ${user.studentId === studentId ? 'bg-orange-50 border-l-4 border-l-orange-500' : 'border-l-4 border-l-transparent'}`}>
                                    <div className="w-6 sm:w-8 font-black text-slate-400 text-center text-sm sm:text-base">{user.currentRank}</div>
                                    <div className="w-8 flex justify-center shrink-0">{getTrendBadge(user.trend)}</div>
                                    <img src={user.avatarUrl} alt="avatar" className="w-10 h-10 sm:w-12 sm:h-12 rounded-full ring-2 ring-slate-100 object-cover shrink-0" />
                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h4 className={`font-bold text-sm sm:text-base truncate ${user.studentId === studentId ? 'text-orange-700' : 'text-slate-800'}`}>
                                                {user.studentName} {user.studentId === studentId && "(Bạn)"}
                                            </h4>
                                            {user.badges && user.badges.length > 0 && (
                                                <div className="hidden sm:flex gap-1.5">
                                                    {user.badges.map(badge => (
                                                        <span key={badge} className="bg-blue-50 border border-blue-200 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                                            <Medal className="w-3 h-3" /> {badge}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <div className="font-black text-orange-500 text-sm sm:text-base">{user.totalXp.toLocaleString()} <span className="text-[10px] sm:text-xs text-orange-400 font-bold">XP</span></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            {/* ── 4. STICKY BAR BÊN DƯỚI ── */}
            {myRank && (
                <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md text-white p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.2)] border-t border-slate-700 z-50">
                    <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center font-black text-xl sm:text-2xl shadow-[0_0_15px_rgba(249,115,22,0.4)] border-2 border-white/20 shrink-0 transform -rotate-3">
                                #{myRank.currentRank}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-white flex items-center gap-2 text-sm sm:text-base">
                                    Thứ hạng hiện tại
                                    <span className="bg-orange-500/20 text-orange-300 text-xs px-2 py-0.5 rounded-full font-mono border border-orange-500/30">
                                        {myRank.totalXp.toLocaleString()} XP
                                    </span>
                                </h4>
                                {userAboveMe ? (
                                    <p className="text-xs sm:text-sm text-slate-300 mt-1 flex items-center gap-1.5">
                                        <Flame className="w-3.5 h-3.5 text-orange-500 animate-pulse"/>
                                        Chỉ cần <span className="font-bold text-orange-400 mx-0.5">{(userAboveMe.totalXp - myRank.totalXp) + 1} XP</span> để vượt qua {userAboveMe.studentName}!
                                    </p>
                                ) : (
                                    <p className="text-xs sm:text-sm text-yellow-400 mt-1 flex items-center gap-1.5">
                                        <Crown className="w-3.5 h-3.5" /> Vô Địch! Hãy giữ vững phong độ.
                                    </p>
                                )}
                            </div>
                        </div>
                        <button className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl font-bold text-sm sm:text-base hover:scale-105 hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-all active:scale-95 whitespace-nowrap">
                            Học ngay cày XP
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}