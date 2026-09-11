"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Cookies from "js-cookie";
import { useEffect, useState, useSyncExternalStore } from "react";
import Image from "next/image";

export default function Navbar() {
  const pathname = usePathname();
  const token = useSyncExternalStore(
    () => () => {},
    () => Cookies.get("auth_token"),
    () => undefined,
  );
  const isAuthenticated = Boolean(token);
  const [userInitials, setUserInitials] = useState("");

  useEffect(() => {
    // Load the profile used to build the avatar label.
    const fetchUserInfos = async () => {
      if (!token) return;
      try {
        const res = await fetch("http://localhost:8000/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const json = await res.json();

          // Support the response shapes currently returned by the API.
          const userData = json.data?.user || json.data || json.user || json;

          const firstName = userData.firstName || "";
          const lastName = userData.lastName || "";
          const fullName = userData.name || `${firstName} ${lastName}`.trim();

          if (fullName) {
            // Prefer two initials and fall back to the first two characters.
            const parts = fullName.split(" ");
            const initials =
              parts.length > 1
                ? (parts[0][0] + parts[1][0]).toUpperCase()
                : fullName.substring(0, 2).toUpperCase();

            setUserInitials(initials);
          }
        }
      } catch (error) {
        console.error("Erreur API:", error);
      }
    };

    fetchUserInfos();
  }, [pathname, token]);

  // Hide navigation on public pages and for signed-out users.
  if (pathname === "/login" || pathname === "/register") return null;
  if (!isAuthenticated) return null;

  // Highlight the current section in the navigation.
  const isActive = (path: string) => pathname.startsWith(path);
  const isProfilePage = pathname === "/profile";

  return (
    <nav className="border-b border-gray-200 px-6 py-4">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <Link href="/dashboard" aria-label="Redirection vers tableau de bord">
          <Image
            src="/logoabricot.svg"
            alt="Logo Abricot"
            width={120}
            height={30}
            priority
          />
        </Link>

        <div className="flex gap-6 text-sm">
          <Link
            href="/dashboard"
            className={
              isActive("/dashboard") ? "font-semibold" : "text-gray-600"
            }
          >
            Tableau de bord
          </Link>

          <Link
            href="/projects"
            className={
              isActive("/projects") ? "font-semibold" : "text-gray-600"
            }
          >
            Projets
          </Link>

          <Link
            href="/profile"
            aria-label="Voir mon profil"
            className={`flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs ${
              isProfilePage ? "bg-gray-900 text-white" : "text-gray-700"
            }`}
          >
            {userInitials && <span>{userInitials}</span>}
          </Link>
        </div>
      </div>
    </nav>
  );
}
