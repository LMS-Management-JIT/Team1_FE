const ConsoleOutput = ({output}) => {

    return (
        <div className="rounded-xl bg-black p-5">
            <h3 className="mb-4 text-white"> Console </h3>
            <pre className="text-green-400"> {output} </pre>
        </div>
    );
};

export default ConsoleOutput;