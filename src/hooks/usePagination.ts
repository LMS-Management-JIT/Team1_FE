import {useMemo, useState} from "react";

const usePagination = (data = [], pageSize = 10) => {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(data.length / pageSize);

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return data.slice(start, start + pageSize);
    }, [data, currentPage, pageSize]);

    const nextPage = () => {
        if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
    };

    const previousPage = () => {
        if (currentPage > 1) setCurrentPage((prev) => prev - 1);
    };

    return {
        currentPage,
        totalPages,
        paginatedData,
        setCurrentPage,
        nextPage,
        previousPage,
    };
};

export default usePagination;