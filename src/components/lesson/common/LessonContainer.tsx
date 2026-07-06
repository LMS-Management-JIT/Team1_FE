import type {ReactNode} from "react";
import {Header} from "../../../layouts/Header/Header";

interface Props {
    children: ReactNode;
}

const LessonContainer = ({children}: Props) => {
    return (
        <div className="min-h-screen bg-slate-100">
            <Header/>

            <main className="mx-auto max-w-7xl px-6 py-8">
                {children}
            </main>
        </div>
    );
};

export default LessonContainer;