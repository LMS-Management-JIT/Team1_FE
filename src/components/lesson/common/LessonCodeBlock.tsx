const LessonCodeBlock = ({language, children}) => {
    return (
        <div className="overflow-hidden rounded-xl border border-gray-200">
            <div className="bg-gray-800 px-4 py-2 text-sm text-gray-200">
                {language}
            </div>

            <pre className="overflow-x-auto bg-gray-900 p-4 text-sm text-green-400">
                <code>{children}</code>
            </pre>
        </div>
    );
};

export default LessonCodeBlock;