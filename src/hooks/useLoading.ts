import {useState} from "react";

const useLoading = (initial = false) => {
    const [loading, setLoading] = useState(initial);

    const startLoading = () => setLoading(true);
    const stopLoading = () => setLoading(false);

    return {loading, startLoading, stopLoading};
};

export default useLoading;