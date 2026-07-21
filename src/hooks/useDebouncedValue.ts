import { useEffect, useState } from "react";

// Trì hoãn cập nhật giá trị sau khi người dùng ngừng gõ delayMs,
// tránh lọc lại danh sách tìm kiếm trên từng phím bấm
export function useDebouncedValue<T>(value: T, delayMs = 250): T {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delayMs);
        return () => clearTimeout(timer);
    }, [value, delayMs]);

    return debounced;
}