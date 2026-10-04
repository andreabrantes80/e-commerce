"use client";

import { FormEvent, useEffect, useState } from "react";

type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

export default function CategoriasPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);

  async function loadCategories() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/categories`);

      if (!response.ok) {
        throw new Error("Não foi possível carregar as categorias.");
      }

      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erro ao carregar categorias."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  function resetForm() {
    setName("");
    setDescription("");
    setEditingId(null);
    setError("");
  }

  function startEdit(category: Category) {
    setEditingId(category.id);
    setName(category.name);
    setDescription(category.description ?? "");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      setError("Informe o nome da categoria.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const url = editingId
        ? `${API_URL}/api/admin/categories/${editingId}`
        : `${API_URL}/api/admin/categories`;

      const method = editingId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Não foi possível salvar a categoria."
        );
      }

      resetForm();
      await loadCategories();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erro ao salvar categoria."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(category: Category) {
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir a categoria "${category.name}" ? `
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `${API_URL}/api/admin/categories/${category.id} `,
        {
          method: "DELETE",
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Não foi possível excluir a categoria."
        );
      }

      if (editingId === category.id) {
        resetForm();
      }

      await loadCategories();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erro ao excluir categoria."
      );
    }
  }

  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-500">
            Administração
          </p>

          <h1 className="mt-2 text-3xl font-semibold text-neutral-900">
            Categorias
          </h1>

          <p className="mt-2 text-sm text-neutral-600">
            Crie, edite e organize as categorias da GJ TECH MODA FEMININA.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
          <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-neutral-900">
                {editingId ? "Editar categoria" : "Nova categoria"}
              </h2>

              <p className="mt-1 text-sm text-neutral-500">
                {editingId
                  ? "Atualize os dados da categoria."
                  : "Cadastre uma nova categoria para seus produtos."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-neutral-700"
                >
                  Nome
                </label>

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Ex.: Vestidos"
                  className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-neutral-900"
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-medium text-neutral-700"
                >
                  Descrição
                </label>

                <textarea
                  id="description"
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  placeholder="Ex.: Vestidos femininos para diferentes ocasiões."
                  rows={4}
                  className="w-full resize-none rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-neutral-900"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-neutral-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Salvando..."
                    : editingId
                      ? "Salvar alterações"
                      : "Criar categoria"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-xl border border-neutral-300 px-5 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </section>

          <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
            <div className="border-b border-neutral-200 px-6 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-neutral-900">
                    Categorias cadastradas
                  </h2>

                  <p className="mt-1 text-sm text-neutral-500">
                    {categories.length} categoria
                    {categories.length === 1 ? "" : "s"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={loadCategories}
                  className="rounded-lg border border-neutral-300 px-3 py-2 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-50"
                >
                  Atualizar
                </button>
              </div>
            </div>

            {loading ? (
              <div className="px-6 py-10 text-center text-sm text-neutral-500">
                Carregando categorias...
              </div>
            ) : categories.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <p className="text-sm font-medium text-neutral-900">
                  Nenhuma categoria cadastrada.
                </p>

                <p className="mt-1 text-sm text-neutral-500">
                  Crie a primeira categoria usando o formulário ao lado.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-200">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <h3 className="font-semibold text-neutral-900">
                        {category.name}
                      </h3>

                      <p className="mt-1 text-xs text-neutral-400">
                        /{category.slug}
                      </p>

                      {category.description && (
                        <p className="mt-2 text-sm text-neutral-600">
                          {category.description}
                        </p>
                      )}
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(category)}
                        className="rounded-lg border border-neutral-300 px-3 py-2 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-50"
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(category)}
                        className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

