import DOMPurify from "dompurify";
import hljs from "highlight.js/lib/common";
import "highlight.js/styles/vs2015.css";
import {useEffect, useMemo, useRef} from "react";
import clsx from "clsx";

interface SafeHtmlContentProps {
    html: string | null | undefined;
    fallback?: string;
    className?: string;
}

const ALLOWED_TAGS = [
    "h1", "h2", "h3", "h4",
    "p", "br", "strong", "em", "u", "span",
    "ul", "ol", "li",
    "pre", "code",
    "blockquote",
    "a", "img",
    "table", "thead", "tbody", "tr", "th", "td",
];

export function SafeHtmlContent({
                                    html,
                                    fallback = "Nội dung đang được cập nhật.",
                                    className,
                                }: SafeHtmlContentProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    const cleanHtml = useMemo(() => {
        if (!html) return null;

        return DOMPurify.sanitize(html, {
            ALLOWED_TAGS,
            ALLOWED_ATTR: ["href", "src", "alt", "target", "rel", "class"],
        });
    }, [html]);

    // Sau khi HTML đã render vào DOM thật, quét toàn bộ khối <pre><code> để tô màu cú pháp
    useEffect(() => {
        if (!containerRef.current) return;

        containerRef.current.querySelectorAll("pre code").forEach((block) => {
            hljs.highlightElement(block as HTMLElement);
        });
    }, [cleanHtml]);

    if (!cleanHtml) {
        return <p className="text-sm text-gray-400">{fallback}</p>;
    }

    return (
        <div
            ref={containerRef}
            className={clsx(
                "max-w-none text-[15px] leading-7 text-gray-700",
                // Style heading trực tiếp bằng selector con, KHÔNG phụ thuộc plugin @tailwindcss/typography
                "[&_h1]:mt-6 [&_h1]:mb-3 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-gray-900",
                "[&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-gray-900",
                "[&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-orange-600",
                "[&_h4]:mt-4 [&_h4]:mb-2 [&_h4]:text-base [&_h4]:font-semibold [&_h4]:text-gray-900",
                "[&_p]:mb-3",
                "[&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-6",
                "[&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-6",
                "[&_li]:mb-1",
                "[&_a]:text-orange-600 [&_a]:underline",
                "[&_strong]:font-semibold [&_strong]:text-gray-900",
                "[&_blockquote]:border-l-4 [&_blockquote]:border-orange-300 [&_blockquote]:bg-orange-50 [&_blockquote]:px-4 [&_blockquote]:py-2 [&_blockquote]:text-gray-600",
                // Chỉ style code inline (không nằm trong <pre>) — tránh đè màu cú pháp của highlight.js
                "[&_:not(pre)>code]:rounded [&_:not(pre)>code]:bg-gray-100 [&_:not(pre)>code]:px-1.5 [&_:not(pre)>code]:py-0.5 [&_:not(pre)>code]:text-orange-600 [&_:not(pre)>code]:font-mono [&_:not(pre)>code]:text-[13px]",
                // Khối <pre> giữ p-0: để class "hljs" (do highlight.js gắn) tự set padding/màu nền theo theme vs2015.css, tránh double padding
                "[&_pre]:mb-4 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-[#1e1e1e] [&_pre]:p-0",
                className
            )}
            // eslint-disable-next-line react/no-danger -- html đã qua DOMPurify.sanitize ở trên
            dangerouslySetInnerHTML={{__html: cleanHtml}}
        />
    );
}
