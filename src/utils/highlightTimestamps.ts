export function highlightTimestamps(html: string | null | undefined): string | null | undefined {
    if (!html) return html;

    return html.replace(
        /(<li>)(\s*)(\d{1,2}:\d{2}(?::\d{2})?)/g,
        (_match, liTag: string, whitespace: string, timestamp: string) =>
            `${liTag}${whitespace}<span class="lecture-timestamp">${timestamp}</span>`
    );
}
