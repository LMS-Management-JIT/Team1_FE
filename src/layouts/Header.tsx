import {Bell, Search} from "lucide-react";

const Header = () => {
    return (
        <header className="flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm">
            <h1 className="text-xl font-bold text-blue-600">LMS</h1>

            <div className="relative w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                <input
                    type="text"
                    placeholder="Tìm kiếm..."
                    className="w-full rounded-lg border py-2 pl-10 pr-4 outline-none focus:border-blue-500"
                />
            </div>

            <div className="flex items-center gap-5">
                <Bell className="cursor-pointer text-gray-600" size={22}/>

                <img
                    src="https://i.pravatar.cc/40"
                    alt="avatar"
                    className="h-10 w-10 rounded-full"
                />
            </div>
        </header>
    );
};

export default Header;