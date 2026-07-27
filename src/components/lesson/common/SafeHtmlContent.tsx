import DOMPurify from "dompurify";
import hljs from "highlight.js/lib/common";
import "highlight.js/styles/vs2015.css";
import { useEffect, useMemo, useRef } from "react";
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

/**
 * Chuẩn hoá 1 đoạn code bị lưu dồn thành MỘT DÒNG DUY NHẤT (không có \n)
 * — đúng như cách dữ liệu đang được lưu trong Firestore hiện tại —
 * thành code nhiều dòng, có thụt lề, dựa trên các dấu `;`, `{`, `}`.
 *
 * LƯU Ý: đây KHÔNG phải là 1 parser Java đầy đủ, chỉ xử lý đủ tốt cho các
 * đoạn code mẫu ngắn trong bài học. Nếu code truyền vào đã có \n rồi thì
 * trả về nguyên vẹn, không đụng vào.
 *
 * (Đặt trực tiếp trong file này thay vì file riêng để tránh trường hợp
 * dev server chưa nhận diện module mới.)
 */
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
                                }: SafeHtmlContentProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    const cleanHtml = useMemo(() => {
        if (!html) return null;

        return DOMPurify.sanitize(html, {
            ALLOWED_TAGS,
            ALLOWED_ATTR: ["href", "src", "alt", "target", "rel", "class"],
        });
    }, [html]);

    useEffect(() => {
        console.log("%c[SafeHtmlContent] EFFECT CHẠY - version debug", "color: lime; font-weight: bold; font-size: 14px");

        if (!containerRef.current) {
            console.log("[SafeHtmlContent] containerRef.current là null, thoát sớm");
            return;
        }

        const preList = containerRef.current.querySelectorAll("pre");
        console.log("[SafeHtmlContent] Số lượng <pre> tìm thấy:", preList.length);

        preList.forEach((pre) => {
            let codeEl = pre.querySelector("code") as HTMLElement | null;

            if (!codeEl) {
                codeEl = document.createElement("code");
                codeEl.textContent = pre.textContent ?? "";
                pre.innerHTML = "";
                pre.appendChild(codeEl);
            }

            codeEl.classList.remove("language-undefined");

            const alreadyTokenized = codeEl.querySelector('span[class*="hljs-"]') !== null;
            console.log("[SafeHtmlContent] alreadyTokenized:", alreadyTokenized, "| rawText:", codeEl.textContent);

            if (alreadyTokenized) {
                console.log("[SafeHtmlContent] Bỏ qua vì đã tokenized rồi");
                return;
            }

            codeEl.classList.remove("hljs");
            codeEl.removeAttribute("data-highlighted");

            // Dữ liệu trong DB nhiều bài đang bị lưu dồn code thành 1 dòng
            // (không có \n) -> chuẩn hoá lại thành nhiều dòng, có thụt lề,
            // trước khi đưa cho highlight.js xử lý.
            const rawText = codeEl.textContent ?? "";
            const normalized = normalizeCodeBlock(rawText);
            console.log("[SafeHtmlContent] normalized khác rawText?", normalized !== rawText);
            console.log("[SafeHtmlContent] normalized value:", JSON.stringify(normalized));

            if (normalized !== rawText) {
                codeEl.textContent = normalized;
            }

            // Nếu tác giả nội dung không khai báo ngôn ngữ (class="language-xxx"),
            // mặc định là Java thay vì để highlight.js tự đoán.
            const hasLanguageClass = /language-\w+/.test(codeEl.className);
            if (!hasLanguageClass) {
                codeEl.classList.add("language-java");
            }
            console.log("[SafeHtmlContent] className trước khi highlight:", codeEl.className);

            try {
                hljs.highlightElement(codeEl);
                console.log("[SafeHtmlContent] highlightElement THÀNH CÔNG, innerHTML sau highlight:", codeEl.innerHTML.slice(0, 200));
            } catch (err) {
                console.warn(
                    "[SafeHtmlContent] Bỏ qua 1 khối code do lỗi highlight:",
                    err
                );
            }
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
                "[&_pre]:mb-4 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-[#1e1e1e] [&_pre]:p-0 [&_pre]:font-mono",
                "[&_pre_code]:font-mono",

                className
            )}
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: cleanHtml }}
        />
    );
}
