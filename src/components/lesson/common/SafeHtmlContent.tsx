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
                "prose prose-sm max-w-none text-gray-700",
                "prose-headings:font-semibold prose-headings:text-gray-900",
                "prose-code:rounded prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-orange-600",
                "prose-pre:rounded-xl prose-pre:bg-[#1e1e1e] prose-pre:p-0",
                className
            )}
            // eslint-disable-next-line react/no-danger -- html đã qua DOMPurify.sanitize ở trên
            dangerouslySetInnerHTML={{__html: cleanHtml}}
        />
    );
}
