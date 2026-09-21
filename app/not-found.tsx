import Link from "next/link";

export default function NotFound() {
	return (
		<section
			aria-labelledby="not-found-title"
			className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center bg-[#F9FAFB] px-4 text-center"
		>
			<p
				aria-hidden="true"
				className="mb-2 font-sans text-[80px] font-bold leading-none text-[#B54708] md:text-[120px]"
			>
				404
			</p>

			<h1
				id="not-found-title"
				className="mb-3 font-sans text-xl font-semibold text-[#1F1F1F] md:text-2xl"
			>
				Page introuvable
			</h1>

			{/* Supporting message */}
			<p className="mb-8 w-full max-w-[450px] font-sans text-sm leading-6 text-[#4B5563] md:text-base">
				La page que vous recherchez n’existe pas ou a peut-être été déplacée.
			</p>

			{/* Return link */}
			<Link
				href="/"
				className="inline-flex min-h-12 w-full max-w-[250px] items-center justify-center rounded-[10px] bg-[#1F1F1F] px-5 font-sans text-sm font-medium text-white transition hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F1F1F] md:text-base"
			>
				Retour à l’accueil
			</Link>
		</section>
	);
}
