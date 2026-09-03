import Image from "next/image";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 px-6 py-6">
      <div className="mx-auto flex max-w-5xl items-center justify-between text-sm text-gray-600">
        <Image src="/logo2.svg" alt="Abricot" width={101} height={13} />
        <span>Abricot 2026</span>
      </div>
    </footer>
  );
}
