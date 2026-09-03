export type NavigationLink = {
  label: string;
  href: string;
};

export const navigationLinks: NavigationLink[] = [
  { label: "Accueil", href: "/" },
  { label: "Projets", href: "/projects" },
  { label: "Dashboard", href: "/dashboard" },
];
