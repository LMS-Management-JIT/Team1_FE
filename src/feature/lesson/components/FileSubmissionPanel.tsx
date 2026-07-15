import {useRef, useState} from "react";
import {CheckCircle2, Download, FileUp, Paperclip, RotateCcw, Trash2, X} from "lucide-react";
import clsx from "clsx";
import type {LessonSubmissionResponse} from "../../../services/lessonSubmissionService";

interface FileSubmissionPanelProps {
    existingSubmission: LessonSubmissionResponse | null | undefined;
    onSubmit: (file: File) => void;
    onDelete: () => void;
    isSubmitting: boolean;
    isDeleting: boolean;
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatSubmittedAt(iso: string): string {
    try {
        return new Date(iso).toLocaleString("vi-VN");
    } catch {
        return iso;
    }
}

export function FileSubmissionPanel({
                                        existingSubmission,
                                        onSubmit,
                                        onDelete,
                                        isSubmitting,
                                        isDeleting,
                                    }: FileSubmissionPanelProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [isResubmitting, setIsResubmitting] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFiles = (files: FileList | null) => {
        if (files && files.length > 0) {
            setSelectedFile(files[0]);
        }
    };

    // ĐÃ có bài nộp trước đó, và người dùng chưa bấm "Nộp lại" -> hiện trạng thái đã nộp
    if (existingSubmission && !isResubmitting) {
        return (
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                    <CheckCircle2 className="h-4 w-4"/>
                    Bạn đã nộp bài này
                </div>

                <div
                    className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <Paperclip className="h-5 w-5 shrink-0 text-orange-500"/>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-gray-800">
                                {existingSubmission.fileName}
                            </p>
                            <p className="text-xs text-gray-400">
                                {formatFileSize(existingSubmission.fileSize)} · Nộp lúc{" "}
                                {formatSubmittedAt(existingSubmission.submittedAt)}
                            </p>
                        </div>
                    </div>

                    {existingSubmission.downloadUrl && (
                        <a
                            href={existingSubmission.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 rounded-full p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                            title="Tải xuống"
                        >
                            <Download className="h-4 w-4"/>
                        </a>
                    )}
                </div>

                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onDelete}
                        disabled={isDeleting}
                        className="flex items-center gap-1.5 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <Trash2 className="h-4 w-4"/>
                        {isDeleting ? "Đang xoá..." : "Xoá bài nộp"}
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsResubmitting(true)}
                        className="flex items-center gap-1.5 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
                    >
                        <RotateCcw className="h-4 w-4"/>
                        Nộp lại
                    </button>
                </div>
            </div>
        );
    }

    // CHƯA nộp bài, hoặc đang trong quá trình "Nộp lại" -> hiện khu vực chọn file
    return (
        <div className="flex flex-col gap-4">
            {isResubmitting && (
                <button
                    type="button"
                    onClick={() => {
                        setIsResubmitting(false);
                        setSelectedFile(null);
                    }}
                    className="self-start text-xs font-medium text-gray-400 hover:text-orange-500"
                >
                    ← Huỷ, quay lại bài đã nộp
                </button>
            )}

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
                onClick={() => {
                    if (!selectedFile) return;
                    onSubmit(selectedFile);
                    setIsResubmitting(false);
                    setSelectedFile(null);
                }}
                className="flex items-center justify-center gap-2 self-end rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
                <CheckCircle2 className="h-4 w-4"/>
                {isSubmitting ? "Đang nộp bài..." : "Nộp bài"}
            </button>
        </div>
    );
}
