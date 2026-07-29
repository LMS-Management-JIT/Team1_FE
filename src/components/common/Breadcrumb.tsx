import { Fragment } from "react";
import { Link } from "react-router-dom";

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
    className?: string;
}

export function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
    return (
        <nav className={`mb-2 flex flex-wrap items-center text-[15px] font-semibold text-slate-500 ${className}`}>
            {items.map((item, index) => {
                const isLast = index === items.length - 1;

                return (
                    <Fragment key={`${item.label}-${index}`}>
                        {index > 0 && <span className="mx-1.5 font-normal text-slate-400">/</span>}

                        {item.href && !isLast ? (
                            <Link
                                to={item.href}
                                className="text-orange-500 transition-colors hover:text-orange-600"
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <span className={isLast ? "font-bold text-slate-700" : "text-orange-500"}>
                                {item.label}
                            </span>
                        )}
                    </Fragment>
                );
            })}
        </nav>
    );
}
