import type {KeyboardEvent} from "react";
import {useState} from "react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

/**
 * Thanh phân trang dùng chung.
 * Sự kiện: bấm số trang | bấm mũi tên ‹ › | nhập số + Enter hoặc bấm "Đi".
 */
export default function Pagination({currentPage, totalPages, onPageChange}: PaginationProps) {
    const [jumpValue, setJumpValue] = useState('');

    const clamp = (p: number) => Math.min(Math.max(p, 1), totalPages);

    const handleJump = () => {
        const val = parseInt(jumpValue, 10);
        if (!isNaN(val)) {
            onPageChange(clamp(val));
            setJumpValue('');
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleJump();
    };

    const visiblePages: number[] = [];
    for (let p = 1; p <= Math.min(4, totalPages); p++) visiblePages.push(p);
    const showEllipsis = totalPages > 5;

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-6 py-4">
            {/* ── Dãy số trang ── */}
            <div className="flex items-center gap-1.5">
                <button
                    onClick={() => onPageChange(clamp(currentPage - 1))}
                    disabled={currentPage <= 1}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200
                     text-gray-500 hover:border-orange-500 shadow-md hover:text-orange-500 hover:bg-orange-50
                     disabled:cursor-not-allowed disabled:opacity-40 transition"
                >
                    ‹
                </button>

                {visiblePages.map((p) => (
                    <button
                        key={p}
                        onClick={() => onPageChange(p)}
                        className={`flex h-10 w-10 items-center justify-center rounded-lg text-xs font-bold transition
              ${p === currentPage
                            ? 'bg-orange-500 text-white shadow-md'
                            : 'border border-gray-200 text-gray-500 hover:border-orange-500  hover:text-orange-500 hover:bg-orange-50'
                        }`}
                    >
                        {p}
                    </button>
                ))}

                {showEllipsis && (
                    <>
                        <span className="px-1 text-xs text-gray-400">…</span>
                        <button
                            onClick={() => onPageChange(totalPages)}
                            className={`flex h-10 w-10 items-center justify-center rounded-lg text-xs font-bold transition
                ${totalPages === currentPage
                                ? 'bg-orange-500 text-white shadow'
                                : 'border border-gray-200 text-gray-500 hover:border-orange-500 hover:text-orange-500 hover:bg-orange-50'
                            }`}
                        >
                            {totalPages}
                        </button>
                    </>
                )}

                <button
                    onClick={() => onPageChange(clamp(currentPage + 1))}
                    disabled={currentPage >= totalPages}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200
                     text-gray-500 hover:border-orange-500 shadow-md hover:text-orange-500 hover:bg-orange-50
                     disabled:cursor-not-allowed disabled:opacity-40 transition"
                >
                    ›
                </button>
            </div>

            {/* ── Ô nhập số trang ── */}
            <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Trang {currentPage} / {totalPages}</span>
                <span className="text-xs text-gray-400">Đến trang:</span>
                <input
                    type="number"
                    min={1}
                    max={totalPages}
                    value={jumpValue}
                    onChange={(e) => setJumpValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="VD: 5"
                    className="h-8 w-20 rounded-lg border border-gray-200 text-center font-mono text-sm
                     outline-none focus:border-orange-500  focus:ring-1 focus:ring-orange-200 transition"
                />
                <button
                    onClick={handleJump}
                    className="h-8 rounded-lg bg-orange-500 px-3 text-xs font-semibold text-white hover:bg-orange-600 transition"
                >
                    Đi
                </button>
            </div>
        </div>
    );
}
