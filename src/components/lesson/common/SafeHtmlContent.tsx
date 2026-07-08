import DOMPurify from "dompurify";
import {useMemo} from "react";
import clsx from "clsx";

interface SafeHtmlContentProps {
    html: string | null | undefined;
    fallback?: string;
    className?: string;
}

const ALLOWED_TAGS = [
    "h1", "h2", "h3", "h4",
    "p", "br", "strong", "em", "u",
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
    const cleanHtml = useMemo(() => {
        if (!html) return null;

        return DOMPurify.sanitize(html, {
            ALLOWED_TAGS,
            ALLOWED_ATTR: ["href", "src", "alt", "target", "rel"],
        });
    }, [html]);

    if (!cleanHtml) {
        return <p className="text-sm text-gray-400">{fallback}</p>;
    }

    return (
        <div
            className={clsx(
                "prose prose-sm max-w-none text-gray-700",
                "prose-headings:font-semibold prose-headings:text-gray-900",
                "prose-code:rounded prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-orange-600",
                "prose-pre:rounded-lg prose-pre:bg-gray-900",
                className
            )}
            // eslint-disable-next-line react/no-danger -- html đã qua DOMPurify.sanitize ở trên
            dangerouslySetInnerHTML={{__html: cleanHtml}}
        />
    );
}