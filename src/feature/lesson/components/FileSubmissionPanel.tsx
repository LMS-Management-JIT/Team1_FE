import {useRef, useState} from "react";
import {CheckCircle2, FileUp, Paperclip, X} from "lucide-react";
import clsx from "clsx";

interface FileSubmissionPanelProps {
    onSubmit: (file: File) => void;
    isSubmitting: boolean;
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileSubmissionPanel({onSubmit, isSubmitting}: FileSubmissionPanelProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFiles = (files: FileList | null) => {
        if (files && files.length > 0) {
            setSelectedFile(files[0]);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            {!selectedFile ? (
                <div
                    onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragOver(true);
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={(e) => {
                        e.preventDefault();
                        setIsDragOver(false);
                        handleFiles(e.dataTransfer.files);
                    }}
                    onClick={() => inputRef.current?.click()}
                    className={clsx(
                        "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors",
                        isDragOver ? "border-orange-500 bg-orange-50" : "border-gray-200 hover:border-orange-300 hover:bg-gray-50"
                    )}
                >
                    <FileUp className="h-9 w-9 text-gray-400"/>
                    <p className="text-sm font-medium text-gray-700">
                        Kéo thả file bài làm vào đây, hoặc bấm để chọn file
                    </p>
                    <p className="text-xs text-gray-400">
                        Hỗ trợ mọi định dạng file (.zip, .rar, .pdf, .docx, .java, .py, .js...)
                    </p>
                    <input
                        ref={inputRef}
                        type="file"
                        className="hidden"
                        onChange={(e) => handleFiles(e.target.files)}
                    />
                </div>
            ) : (
                <div
                    className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <Paperclip className="h-5 w-5 shrink-0 text-orange-500"/>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-gray-800">{selectedFile.name}</p>
                            <p className="text-xs text-gray-400">{formatFileSize(selectedFile.size)}</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setSelectedFile(null)}
                        className="shrink-0 rounded-full p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                    >
                        <X className="h-4 w-4"/>
                    </button>
                </div>
            )}

            <button
                type="button"
                disabled={!selectedFile || isSubmitting}
                onClick={() => selectedFile && onSubmit(selectedFile)}
                className="flex items-center justify-center gap-2 self-end rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
                <CheckCircle2 className="h-4 w-4"/>
                {isSubmitting ? "Đang nộp bài..." : "Nộp bài"}
            </button>
        </div>
    );
}
