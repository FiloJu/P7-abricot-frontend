export default function Navbar({ links }: { links: unknown[] }) {
	return <nav aria-label="Main navigation">{links.length > 0 ? null : null}</nav>
}
