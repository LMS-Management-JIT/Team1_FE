import { Bell, Flag, Search } from "lucide-react";

export function Header() {
    return (
        <header className="relative flex h-14 items-center gap-12 bg-[#ff6b13] px-8 text-white">
            <div className="flex items-center gap-3 font-bold">
                <div className="grid h-9 w-9 place-items-center rounded-md bg-[#1f3f95] font-extrabold">
                    L
                </div>
                <span>codegym</span>
            </div>

            <nav className="absolute left-1/2 flex -translate-x-1/2 items-center gap-4">
                <a className="rounded-lg bg-white/20 px-4 py-2 text-sm" href="#">
                    Trang chủ
                </a>
                <a className="rounded-lg px-4 py-2 text-sm hover:bg-white/20" href="#">
                    Khóa học
                </a>
                <a className="rounded-lg px-4 py-2 text-sm hover:bg-white/20" href="#">
                    Liên hệ
                </a>
            </nav>

            <div className="ml-auto flex items-center gap-3">
                <div className="flex h-8 w-[220px] items-center gap-2 rounded-full bg-white/20 px-3">
                    <Search size={15} />
                    <input
                        className="w-full bg-transparent text-xs text-white outline-none placeholder:text-white/80"
                        placeholder="Tìm khóa học, bài viết..."
                    />
                </div>

                <button className="relative grid h-8 w-8 place-items-center rounded-full bg-white/20">
                    <Flag size={15} />
                    <span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1 text-[10px]">
            3
          </span>
                </button>

                <button className="relative grid h-8 w-8 place-items-center rounded-full bg-white/20">
                    <Bell size={15} />
                    <span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1 text-[10px]">
            5
          </span>
                </button>

                <button className="h-8 w-8 rounded-full bg-orange-100 font-bold text-[#ff6b13]">
                    HV
                </button>
            </div>
        </header>
    );
}