export function autoFormatHeadings(html: string | null | undefined): string | null | undefined {
    if (!html) return html;

    let result = html;

    // 1) "Bài 1." hoặc "1. Vòng lặp For" -> <h3> (tiêu đề phụ, có đánh số)
    result = result.replace(
        /<p>\s*(Bài\s+\d+(?:\.\d+)*\.?:?(?:\s+[^<.]{1,50})?|\d+\.\s+[^<.]{1,50})\s*<\/p>/g,
        (_match, inner: string) => `<h3>${inner.trim()}</h3>`
    );

    // 2) Dòng tiêu đề đứng riêng, không đánh số, không kết thúc bằng dấu câu,
    //    độ dài ngắn (<=60 ký tự) -> <h2> (tiêu đề chính của mục)
    result = result.replace(
        /<p>\s*([^<]{3,60})\s*<\/p>/g,
        (match, inner: string) => {
            const text = inner.trim();
            const endsWithPunctuation = /[.,:;!?]$/.test(text);
            const looksLikeSentence = /\s(là|của|và|có|để|khi|nếu|hoặc|bạn|các|một)\s/i.test(text);

            if (endsWithPunctuation || looksLikeSentence) return match;
            return `<h2>${text}</h2>`;
        }
    );

    return result;
}
