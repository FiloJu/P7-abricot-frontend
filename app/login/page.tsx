"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    // Submit credentials to the authentication endpoint.
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Keep the token for authenticated requests and redirect the user.
        Cookies.set("auth_token", data.data.token, { expires: 1 });
        router.push("/dashboard");
      } else {
        // Display the API message when the credentials are rejected.
        setError(data.message || "Email ou mot de passe incorrect");
      }
    } catch {
      // Handle unavailable authentication services.
      setError("Impossible de joindre le serveur.");
    }
  };

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-3xl font-bold">Connexion</h1>

      {error && (
        <p className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <form onSubmit={handleLogin} className="mt-8 space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="mt-2 w-full rounded border border-gray-300 px-3 py-2 focus:border-gray-900 focus:outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            className="mt-2 w-full rounded border border-gray-300 px-3 py-2 focus:border-gray-900 focus:outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full rounded bg-gray-900 px-4 py-2 text-white hover:bg-gray-700"
        >
          Se connecter
        </button>

        <div className="flex justify-between text-sm">
          <Link href="/forgot-password" className="underline">
            Mot de passe oublié ?
          </Link>
          <Link href="/register" className="underline">
            Créer un compte
          </Link>
        </div>
      </form>
    </div>
  );
}
