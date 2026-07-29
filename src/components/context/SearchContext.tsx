import { createContext, useContext, useState, type ReactNode } from "react";

interface SearchContextValue {
    query: string;
    setQuery: (query: string) => void;
}

const SearchContext = createContext<SearchContextValue | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
    const [query, setQuery] = useState("");

    return (
        <SearchContext.Provider value={{ query, setQuery }}>
            {children}
        </SearchContext.Provider>
    );
}

export function useSearchContext() {
    const context = useContext(SearchContext);
    if (!context) {
        throw new Error("useSearchContext must be used within SearchProvider");
    }
    return context;
}
