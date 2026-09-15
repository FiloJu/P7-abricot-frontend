import Image from "next/image";

export default function Footer() {
  return (
        <footer className="w-full h-[68px] bg-[#FFFFFF] flex items-center justify-between px-4 lg:pl-[30px] lg:pr-[54px] border-t border-gray-100">

            {/* LEFT SIDE: Logo */}
            <div className="flex-shrink-0">
                <Image
                    src="/logo2.svg"
                    alt="Logo Abricot Footer"
                    width={101}
                    height={12.86}
                    priority
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