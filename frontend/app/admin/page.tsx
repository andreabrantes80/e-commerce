"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCurrentUser, logoutAdmin, type AuthUser } from "@/lib/api";

export default function AdminPage() {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [checkingAuth, setCheckingAuth] = useState(true);

    useEffect(() => {
        async function checkAuth() {
            const currentUser = await getCurrentUser();

            if (!currentUser || currentUser.role !== "ADMIN") {
                window.location.replace("/login");
                return;
            }

            setUser(currentUser);
            setCheckingAuth(false);
        }

        checkAuth();
    }, []);

    async function handleLogout() {
        try {
            await logoutAdmin();
        } finally {
            window.location.replace("/login");
        }
    }

    if (checkingAuth) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-neutral-100">
                <p className="text-sm text-neutral-500">
                    Verificando sessão...
                </p>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-neutral-100">
            <header className="border-b border-neutral-200 bg-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">
                            GJ TECH
                        </p>

                        <h1 className="text-xl font-semibold text-neutral-900">
                            MODA FEMININA
                        </h1>
                    </div>

                    <div className="flex items-center gap-5">
                        {user && (
                            <span className="hidden text-sm text-neutral-600 sm:block">
                                Olá, {user.name}
                            </span>
                        )}

                        <Link
                            href="/"
                            className="text-sm font-medium text-neutral-600 hover:text-black"
                        >
                            Voltar para a loja
                        </Link>

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
                        >
                            Sair
                        </button>
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-7xl px-6 py-10">
                <div className="mb-10">
                    <p className="text-sm font-medium text-neutral-500">
                        Painel administrativo
                    </p>

                    <h2 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950">
                        Dashboard
                    </h2>

                    <p className="mt-2 text-neutral-600">
                        Gerencie produtos, categorias e estoque da sua loja.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <Link
                        href="/admin/produtos"
                        className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                    >
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-900 text-xl text-white">
                            👗
                        </div>

                        <h3 className="text-lg font-semibold text-neutral-900">
                            Produtos
                        </h3>

                        <p className="mt-2 text-sm text-neutral-500">
                            Cadastre, edite e gerencie os produtos da loja.
                        </p>

                        <span className="mt-5 inline-block text-sm font-semibold text-neutral-900">
                            Gerenciar produtos →
                        </span>
                    </Link>

                    <Link
                        href="/admin/categorias"
                        className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                    >
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100 text-xl">
                            🗂️
                        </div>

                        <h3 className="text-lg font-semibold text-neutral-900">
                            Categorias
                        </h3>

                        <p className="mt-2 text-sm text-neutral-500">
                            Crie, edite e organize as categorias da loja.
                        </p>

                        <span className="mt-5 inline-block text-sm font-semibold text-neutral-900">
                            Gerenciar categorias →
                        </span>
                    </Link>

                    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100 text-xl">
                            📦
                        </div>

                        <h3 className="text-lg font-semibold text-neutral-900">
                            Estoque
                        </h3>

                        <p className="mt-2 text-sm text-neutral-500">
                            Controle de estoque será integrado ao gerenciamento
                            de produtos.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}