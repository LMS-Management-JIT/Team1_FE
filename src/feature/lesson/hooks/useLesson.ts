import {useEffect, useState} from "react";

const useLesson = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setData(lesson);
            setLoading(false);
        }, 300);
    }, []);

    return {lesson: data, loading};
};

export default useLesson;