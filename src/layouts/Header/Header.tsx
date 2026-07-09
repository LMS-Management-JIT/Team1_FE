import {Bell, Flag, Menu, Search} from "lucide-react";
import {useState} from "react";

export function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className="relative bg-[#ff6b13] px-4 text-white sm:px-6 lg:px-8">
            <div className="flex h-14 items-center gap-4 lg:gap-12">
                <div className="flex shrink-0 items-center gap-3 font-bold">
                    <div className="grid h-9 w-9 place-items-center rounded-md bg-[#1f3f95] font-extrabold">
                        L
                    </div>
                    <span className="hidden sm:inline">codegym</span>
                </div>

                {/* Nav — ẩn trên mobile/tablet, hiện từ lg trở lên */}
                <nav className="hidden items-center gap-4 lg:absolute lg:left-1/2 lg:flex lg:-translate-x-1/2">
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

                <div className="ml-auto flex items-center gap-2 sm:gap-3">
                    {/* Ô tìm kiếm — ẩn trên mobile, hiện từ md trở lên */}
                    <div
                        className="hidden h-8 w-[160px] items-center gap-2 rounded-full bg-white/20 px-3 md:flex lg:w-[220px]">
                        <Search size={15}/>
                        <input
                            className="w-full bg-transparent text-xs text-white outline-none placeholder:text-white/80"
                            placeholder="Tìm khóa học, bài viết..."
                        />
                    </div>

                    <button className="relative hidden h-8 w-8 place-items-center rounded-full bg-white/20 sm:grid">
                        <Flag size={15}/>
                        <span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1 text-[10px]">
                            3
                        </span>
                    </button>

                    <button className="relative hidden h-8 w-8 place-items-center rounded-full bg-white/20 sm:grid">
                        <Bell size={15}/>
                        <span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1 text-[10px]">
                            5
                        </span>
                    </button>

                    <button className="h-8 w-8 shrink-0 rounded-full bg-orange-100 text-sm font-bold text-[#ff6b13]">
                        HV
                    </button>

                    {/* Nút menu — chỉ hiện dưới lg */}
                    <button
                        className="grid h-8 w-8 place-items-center rounded-full bg-white/20 lg:hidden"
                        onClick={() => setMobileMenuOpen((prev) => !prev)}
                    >
                        <Menu size={16}/>
                    </button>
                </div>
            </div>

            {/* Menu sổ xuống trên mobile/tablet */}
            {mobileMenuOpen && (
                <nav className="flex flex-col gap-1 border-t border-white/20 pb-3 pt-2 lg:hidden">
                    <a className="rounded-lg bg-white/20 px-4 py-2 text-sm" href="#">
                        Trang chủ
                    </a>
                    <a className="rounded-lg px-4 py-2 text-sm hover:bg-white/20" href="#">
                        Khóa học
                    </a>
                    <a className="rounded-lg px-4 py-2 text-sm hover:bg-white/20" href="#">
                        Liên hệ
                    </a>
                    <div className="mt-1 flex h-8 items-center gap-2 rounded-full bg-white/20 px-3 md:hidden">
                        <Search size={15}/>
                        <input
                            className="w-full bg-transparent text-xs text-white outline-none placeholder:text-white/80"
                            placeholder="Tìm khóa học, bài viết..."
                        />
                    </div>
                </nav>
            )}
        </header>
    );
}
