const CodeEditor = ({code, onChange}) => {
    return (
        <textarea
            value={code}
            onChange={(e) => onChange(e.target.value)}
            className="min-h-[500px] w-full rounded-xl border bg-gray-900 p-5 font-mono text-green-400 outline-none"
        />
    );
};

export default CodeEditor;