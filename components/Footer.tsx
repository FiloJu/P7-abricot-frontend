"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Footer() {
    const pathname = usePathname();
    const appPaths = ["/dashboard", "/projects", "/profile"];
    const shouldShowFooter = appPaths.some(
        (path) => pathname === path || pathname.startsWith(`${path}/`)
    );

    if (!shouldShowFooter) return null;

  return (
        <footer className="w-full min-h-[68px] h-auto bg-[#FFFFFF] flex items-center justify-between gap-4 px-4 py-4 lg:py-0 lg:pl-[30px] lg:pr-[54px] border-t border-gray-100">

            {/* LEFT SIDE: Logo */}
            <div className="flex-shrink-0">
                <Image
                    src="/logo2.svg"
                    alt="Logo Abricot Footer"
                    width={101}
                    height={12.86}
                    priority
                    className="w-[82px] sm:w-[101px] h-auto"
                />
            </div>

            {/* RIGHT SIDE: Text */}
            <div className="flex-shrink-0">
                <span className="text-[#000000] text-[14px] lg:text-[16px] font-normal font-inter">
                    Abricot 2026
                </span>
            </div>

        </footer>
    );
}