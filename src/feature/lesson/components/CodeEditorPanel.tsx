import {useState} from "react";
import {Play} from "lucide-react";
import CodeMirror from "@uiw/react-codemirror";
import {vscodeDark} from "@uiw/codemirror-theme-vscode";
import {getFileExtension, getLanguageExtension} from "../../../utils/codeEditor.util";

interface CodeEditorPanelProps {
    initialCode: string;
    language: string;
    onSubmit: (code: string) => void;
    isSubmitting: boolean;
}

export function CodeEditorPanel({
                                    initialCode,
                                    language,
                                    onSubmit,
                                    isSubmitting,
                                }: CodeEditorPanelProps) {
    const [code, setCode] = useState(initialCode);
    const [consoleOutput, setConsoleOutput] = useState<string | null>(null);

    const handleRun = () => {
        setConsoleOutput(
            "Chạy thử code phía frontend chưa được hỗ trợ — cần tích hợp trình biên dịch/backend chạy code riêng."
        );
    };

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between rounded-t-xl bg-[#1e1e1e] px-4 py-2">
        <span className="text-sm text-gray-300">
          Program.{getFileExtension(language)}
        </span>
                <span className="rounded bg-gray-700 px-2 py-0.5 text-xs text-gray-200">
          {language}
        </span>
            </div>

            <CodeMirror
                value={code}
                onChange={(value) => setCode(value)}
                theme={vscodeDark}
                extensions={[getLanguageExtension(language)]}
                basicSetup={{
                    lineNumbers: true,
                    highlightActiveLine: true,
                    foldGutter: true,
                }}
                className="overflow-hidden rounded-b-xl text-sm [&_.cm-editor]:min-h-[280px]"
            />

            <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Chưa chạy thử lần nào</span>
                <div className="flex gap-2">
                    <button
                        onClick={handleRun}
                        className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        <Play className="h-3.5 w-3.5"/> Chạy thử
                    </button>
                    <button
                        onClick={() => onSubmit(code)}
                        disabled={isSubmitting}
                        className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-60"
                    >
                        Nộp bài & Kiểm tra →
                    </button>
                </div>
            </div>

            <div className="rounded-lg bg-gray-900 p-4 font-mono text-xs text-gray-300">
                <p className="mb-1 text-gray-500">CONSOLE</p>
                {consoleOutput ?? '— Nhấn "Chạy thử" để xem kết quả —'}
            </div>
        </div>
    );
}