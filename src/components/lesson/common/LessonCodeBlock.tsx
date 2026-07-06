import {Copy} from "lucide-react";

interface Props {
    code: string;
    language?: string;
}

const LessonCodeBlock = ({code, language = "text"}: Props) => {

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
    };

    return (
        <div className="overflow-hidden rounded-2xl border">

            <div className="flex items-center justify-between bg-slate-800 px-5 py-3 text-white">
                <span className="text-sm uppercase">
                    {language}
                </span>
                <button onClick={handleCopy}>
                    <Copy size={18}/>
                </button>
            </div>

            <pre className="overflow-auto bg-slate-900 p-6 text-sm text-green-300">
                <code>{code}</code>
            </pre>
        </div>
    );
};

export default LessonCodeBlock;