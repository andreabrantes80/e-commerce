"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { loginAdmin } from "@/lib/api";

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setError("");

        if (!email.trim() || !password) {
            setError("Informe seu e-mail e sua senha.");
            return;
        }

        try {
            setLoading(true);

            await loginAdmin(email.trim(), password);

            router.replace("/admin");
            router.refresh();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Não foi possível realizar o login.",
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-neutral-100 px-6">
            <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
                <div className="mb-8">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">
                        GJ TECH
                    </p>

                    <h1 className="mt-2 text-3xl font-semibold text-neutral-900">
                        Área administrativa
                    </h1>

                    <p className="mt-2 text-sm text-neutral-600">
                        Entre com sua conta de administrador.
                    </p>
                </div>

                {error && (
                    <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label
                            htmlFor="email"
                            className="mb-2 block text-sm font-medium text-neutral-700"
                        >
                            E-mail
                        </label>

                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            autoComplete="email"
                            placeholder="seu@email.com"
                            className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-neutral-900"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="mb-2 block text-sm font-medium text-neutral-700"
                        >
                            Senha
                        </label>

                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            autoComplete="current-password"
                            placeholder="••••••••"
                            className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-neutral-900"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-neutral-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading ? "Entrando..." : "Entrar"}
                    </button>
                </form>
            </div>
        </main>
    );
}