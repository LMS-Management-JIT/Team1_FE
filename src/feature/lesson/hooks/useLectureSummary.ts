import {useState} from "react";

const useLectureSummary = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(summary);

    const regenerate = async () => {
        setLoading(true);
        setTimeout(() => setLoading(false), 1000);
    };

    return {summary: data, loading, regenerate};
};

export default useLectureSummary;