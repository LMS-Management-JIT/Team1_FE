import DOMPurify from "dompurify";
// import hljs from "highlight.js/lib/core";
import hljs from "highlight.js";
import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";

interface SafeHtmlContentProps {
    html: string | null | undefined;
    fallback?: string;
    className?: string;
    defaultLanguage?: string;
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

// Khôi phục lại hàm của bạn để tự động xuống dòng và lùi lề cho code từ Firebase
function normalizeCodeBlock(rawCode: string): string {
    if (!rawCode) return rawCode;
    if (rawCode.includes("\n")) return rawCode;

    const src = rawCode.trim();
    let output = "";
    let inString: '"' | "'" | null = null;
    let i = 0;

    while (i < src.length) {
        const c = src[i];
        if (inString) {
            output += c;
            if (c === "\\" && i + 1 < src.length) {
                output += src[i + 1];
                i += 2;
                continue;
            }
            if (c === inString) {
                inString = null;
            }
            i++;
            continue;
        }
        if (c === '"' || c === "'") {
            inString = c;
            output += c;
            i++;
            continue;
        }
        if (c === "{") {
            output += "{\n";
            i++;
            continue;
        }
        if (c === "}") {
            output = output.replace(/[ \t]+$/, "");
            output += "\n}\n";
            i++;
            continue;
        }
        if (c === ";") {
            output += ";\n";
            i++;
            continue;
        }
        output += c;
        i++;
    }

    const rawLines = output
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

    const lines: string[] = [];
    for (const line of rawLines) {
        if (line === ";" && lines.length > 0) {
            lines[lines.length - 1] += ";";
        } else {
            lines.push(line);
        }
    }

    let indentLevel = 0;
    const indented = lines.map((line) => {
        if (line.startsWith("}")) {
            indentLevel = Math.max(0, indentLevel - 1);
        }
        const formatted = "    ".repeat(indentLevel) + line;
        if (line.endsWith("{")) {
            indentLevel += 1;
        }
        return formatted;
    });

    return indented.join("\n");
}

export function SafeHtmlContent({
                                    html,
                                    fallback = "Nội dung đang được cập nhật.",
                                    className,
                                    defaultLanguage = "java",
                                }: SafeHtmlContentProps) {
    // 1. Sanitize HTML ban đầu
    const cleanHtml = useMemo(() => {
        if (!html) return null;
        return DOMPurify.sanitize(html, {
            ALLOWED_TAGS,
            ALLOWED_ATTR: ["href", "src", "alt", "target", "rel", "class"],
        });
    }, [html]);

    // 2. State lưu trữ HTML ĐÃ ĐƯỢC TÔ MÀU (Bí quyết nằm ở đây)
    const [highlightedHtml, setHighlightedHtml] = useState<string | null>(null);

    // 3. Xử lý highlight hoàn toàn trong bộ nhớ (JS), không đụng vào DOM của React
    useEffect(() => {
        if (!cleanHtml) {
            setHighlightedHtml(null);
            return;
        }

        // Tạo một DOM ảo trong bộ nhớ để phân tích HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(cleanHtml, "text/html");
        const codeBlocks = doc.querySelectorAll("pre code");
        let hasCode = false;

        codeBlocks.forEach((codeEl) => {
            hasCode = true;
            const rawText = codeEl.textContent ?? "";
            // Gọi lại hàm để format code rành mạch
            const normalized = normalizeCodeBlock(rawText);

            const match = codeEl.className.match(/language-(\w+)/);
            // 1. Dùng || "java" để chặn đứng trường hợp biến bị chuỗi rỗng ("")
            let lang = (match ? match[1] : defaultLanguage) || "java";
            lang = lang.toLowerCase(); // Đưa về chữ thường để tránh lỗi Typo (vd: Java -> java)

            // 2. Chống crash: Nếu ngôn ngữ truyền vào chưa được register (vd: python, csharp) hoặc là "", tự động fallback về java
            if (!hljs.getLanguage(lang)) {
                console.warn(`[SafeHtmlContent] Ngôn ngữ "${lang}" chưa được đăng ký, tự động dùng "java"`);
                lang = "java";
            }

            // Bắt buộc thêm class hljs để nhận CSS nền
            codeEl.className = `language-${lang} hljs`;

            try {
                // Highlight text thuần thành mã HTML (chứa các thẻ span màu sắc)
                const result = hljs.highlight(normalized, {
                    language: lang,
                    ignoreIllegals: true,
                });
                codeEl.innerHTML = result.value;
            } catch (err) {
                console.error("[SafeHtmlContent] Lỗi highlight:", err);
                codeEl.textContent = normalized; // Fallback nếu lỗi
            }
        });

        // Nếu có thẻ code, cập nhật state với toàn bộ HTML đã được bọc màu
        if (hasCode) {
            setHighlightedHtml(doc.body.innerHTML);
        } else {
            setHighlightedHtml(cleanHtml);
        }
    }, [cleanHtml, defaultLanguage]);

    if (!cleanHtml) {
        return <p className="text-sm text-gray-400">{fallback}</p>;
    }

    return (
        <div
            className={clsx(
                "max-w-none text-[15px] leading-7 text-gray-700",

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

                // Inline code
                "[&_:not(pre)>code]:rounded [&_:not(pre)>code]:bg-gray-100 [&_:not(pre)>code]:px-1.5 [&_:not(pre)>code]:py-0.5 [&_:not(pre)>code]:text-orange-600 [&_:not(pre)>code]:font-mono [&_:not(pre)>code]:text-[13px]",

                // Code block
                "[&_pre]:mb-4 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-[#1e1e1e] [&_pre]:p-4 [&_pre]:font-mono [&_pre]:text-gray-200 [&_pre]:leading-snug",
                "[&_pre_code]:font-mono",

                className
            )}
            // Nếu đã xử lý highlight xong thì dùng HTML mới, chưa thì dùng HTML tạm
            dangerouslySetInnerHTML={{ __html: highlightedHtml || cleanHtml }}
        />
    );
}
