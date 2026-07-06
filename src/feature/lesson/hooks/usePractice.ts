import {useState} from "react";

const usePractice = () => {
    const [code, setCode] = useState("");
    const [output, setOutput] = useState("");

    const run = () => {
        setOutput("Running...");
    };

    const submit = () => {
        console.log(code);
    };

    return {code, setCode, output, run, submit};
};

export default usePractice;