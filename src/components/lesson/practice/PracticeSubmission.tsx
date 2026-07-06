import {Play, Send} from "lucide-react";

const PracticeSubmission = () => {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-xl font-semibold">
                Thực hành
            </h2>

            <div className="flex flex-wrap gap-4">
                <button
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-white transition hover:bg-blue-700"
                >
                    <Play size={18}/>
                    Chạy code
                </button>

                <button
                    className="flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-white transition hover:bg-green-700"
                >
                    <Send size={18}/>
                    Nộp bài
                </button>
            </div>

            <div
                className="mt-8 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-gray-500">
                Khu vực Code Editor sẽ được bổ sung ở đây.
            </div>

            <div
                className="mt-6 rounded-lg border border-dashed border-gray-300 bg-black p-4 font-mono text-sm text-green-400">
                Console Output...
            </div>
        </div>
    );
};

export default PracticeSubmission;