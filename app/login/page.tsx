"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
        const authToken =
          data?.data?.token ||
          data?.token ||
          data?.data?.accessToken ||
          data?.accessToken;

        if (authToken) {
          Cookies.set("auth_token", authToken, { expires: 1, path: "/" });
          Cookies.set("token", authToken, { expires: 1, path: "/" });
        }

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
        <div className="flex min-h-screen bg-[#F9FAFB] font-sans overflow-x-hidden lg:overflow-hidden">

            <div className="relative w-full lg:w-[562px] min-h-screen lg:min-h-[1024px] shrink-0 bg-[#F9FAFB] flex flex-col lg:block">

                <div className="absolute top-[40px] lg:top-[92.92px] left-1/2 -translate-x-1/2 lg:translate-x-0 lg:left-[154.72px]">
                    <Image src="/logoabricot.svg" alt="Logo Abricot" width={252.57} height={32.17} priority className="w-[180px] lg:w-[252.57px] h-auto" />
                </div>

                <div className="mt-[120px] lg:mt-[300px] w-full px-4 lg:px-0 lg:w-[282px] mx-auto flex flex-col items-center">

                    <h1
                        className="text-[32px] lg:text-[40px] text-[#D3590B] leading-none text-center mb-[30px] mt-[20px] lg:mt-[102px] font-manrope font-bold"
                    >
                        Connexion
                    </h1>

                    {error && (
                        <div className="w-full max-w-[282px] bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4 text-xs text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="w-full max-w-[282px] flex flex-col items-center">

                        <div className="w-full flex flex-col">
                            <label
                                htmlFor="email"
                                className="text-[#000000] text-[14px] font-normal mb-[7px] text-left font-inter"
                            >
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                className="w-full lg:w-[282px] h-[53px] rounded-[4px] border border-[#E5E7EB] bg-[#FFFFFF] px-3 focus:outline-none [&:-webkit-autofill]:[box-shadow:0_0_0_1000px_white_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:black]"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="w-full flex flex-col mt-[29px]">
                            <label
                                htmlFor="password"
                                className="text-[#000000] text-[14px] font-normal mb-[7px] text-left font-inter"
                            >
                                Mot de passe
                            </label>
                            <input
                                id="password"
                                type="password"
                                className="w-full lg:w-[282px] h-[53px] rounded-[4px] border border-[#E5E7EB] bg-[#FFFFFF] px-3 focus:outline-none [&:-webkit-autofill]:[box-shadow:0_0_0_1000px_white_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:black]"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full lg:w-[249px] h-[50px] mt-[28px] bg-[#1F1F1F] text-[#FFFFFF] text-[16px] font-normal rounded-[10px] flex justify-center items-center font-inter"
                        >
                            Se connecter
                        </button>

                        <Link
                            href="/forgot-password"
                            className="mt-[21px] text-[#D3590B] text-[14px] font-normal underline font-inter"
                        >
                            Mot de passe oublié?
                        </Link>
                    </form>
                </div>

                <div className="absolute bottom-[40px] lg:bottom-[92.92px] w-full flex justify-center gap-[10px] font-inter">
                    <span className="text-[#000000] text-[14px] font-normal">
                        Pas encore de compte ?
                    </span>
                    <Link href="/register" className="text-[#D3590B] text-[14px] font-normal underline">
                        Créer un compte
                    </Link>
                </div>
            </div>

            <div className="hidden lg:block relative h-[1024px] flex-1 ">
                <Image
                    src="/hero-login.jpg"
                    alt="Bureau avec outils"
                    fill
                    style={{ objectFit: 'cover', objectPosition: 'center', overflow: 'hidden' }}
                    priority
                />
            </div>

        </div>
    );
}