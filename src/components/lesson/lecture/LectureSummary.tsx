interface LectureSummaryProps {
    summary?: string;
}

const LectureSummary = ({summary}: LectureSummaryProps) => {
    return (
        <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">
                Tóm tắt bằng AI
            </h2>

            <p className="text-gray-500">
                {summary || "Chưa có bản tóm tắt AI."}
            </p>
        </div>
    );
};

export default LectureSummary;