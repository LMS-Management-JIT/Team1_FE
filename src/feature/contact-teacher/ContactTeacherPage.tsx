import { Header } from "../../layouts/Header/Header";
import { useSearchParams } from "react-router-dom";
import { MessageCircle } from "lucide-react";

export default function ContactTeacherPage() {
    const [searchParams] = useSearchParams();
    const teacherId = searchParams.get("teacherId");

    return (
        <div className="min-h-screen bg-[#f3f3f3]">
            <Header />

            <main className="mx-auto flex max-w-[1100px] flex-col items-center justify-center px-6 py-24 text-center">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-orange-50 text-[#ff6b13]">
                    <MessageCircle size={30} />
                </div>

                <h1 className="mt-5 text-2xl font-extrabold text-[#202020]">
                    Chat với giảng viên
                </h1>

                <p className="mt-2 max-w-md text-sm text-gray-500">
                    Tính năng đang được xây dựng, bạn quay lại sau nhé.
                    {teacherId && ` (Giảng viên: ${teacherId})`}
                </p>
            </main>
        </div>
    );
}