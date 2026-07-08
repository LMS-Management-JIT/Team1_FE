import {javascript} from "@codemirror/lang-javascript";
import {python} from "@codemirror/lang-python";
import {java} from "@codemirror/lang-java";
import {cpp} from "@codemirror/lang-cpp";
import type {Extension} from "@codemirror/state";

// LessonEntity.language hiện là free-text string (vd: "C#", "python", "Java"...)
// nên cần chuẩn hoá trước khi map sang extension tương ứng.
export function getLanguageExtension(language: string | null | undefined): Extension {
    const normalized = (language ?? "").toLowerCase().trim();

    if (normalized.includes("python")) return python();
    if (normalized.includes("java") && !normalized.includes("script")) return java();
    if (
        normalized.includes("javascript") ||
        normalized === "js" ||
        normalized.includes("typescript") ||
        normalized === "ts"
    ) {
        return javascript({typescript: normalized.includes("typescript") || normalized === "ts"});
    }
    // C, C++, C# hiện dùng chung cpp() vì CodeMirror 6 chưa có gói lang-csharp
    // chính thức; cú pháp C-family khá tương đồng nên vẫn highlight tốt phần lớn.
    if (
        normalized.includes("c++") ||
        normalized.includes("cpp") ||
        normalized === "c" ||
        normalized.includes("c#") ||
        normalized.includes("csharp")
    ) {
        return cpp();
    }

    // Fallback: không highlight riêng, vẫn hiển thị bình thường
    return [];
}

export function getFileExtension(language: string | null | undefined): string {
    const normalized = (language ?? "").toLowerCase().trim();

    if (normalized.includes("python")) return "py";
    if (normalized.includes("c#") || normalized.includes("csharp")) return "cs";
    if (normalized.includes("c++") || normalized.includes("cpp")) return "cpp";
    if (normalized === "c") return "c";
    if (normalized.includes("java") && !normalized.includes("script")) return "java";
    if (normalized.includes("typescript")) return "ts";
    if (normalized.includes("javascript")) return "js";

    return "txt";
}