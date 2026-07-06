const LectureSummary = ({summary}) => {

    if (!summary) {

        return (
            <div className="rounded-xl border p-6 text-gray-500">
                Chưa có bản tóm tắt AI.
            </div>
        );
    }

    return (
        <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-semibold">
                Tóm tắt bằng AI
            </h2>

            <div className="space-y-4">
                {summary.map((item) => (
                    <div
                        key={item.time}
                        className="rounded-lg bg-gray-50 p-4"
                    >
                        <p className="font-semibold text-blue-600"> {item.time} </p>
                        <p className="mt-2"> {item.content} </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LectureSummary;