const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

export type Product = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string | null;
  priceCents: number;
  stock: number;
  active: boolean;
  images: {
    id: string;
    url: string;
    alt: string | null;
    position: number;
  }[];
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
};

export async function getProducts(): Promise<Product[]> {
  const response = await fetch(`${API_URL}/api/products`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Não foi possível carregar os produtos");
  }

  return response.json();
}

export async function loginAdmin(email: string, password: string) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message ?? "Não foi possível realizar o login.");
  }

  return data as {
    success: true;
    user: AuthUser;
  };
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const response = await fetch(`${API_URL}/api/auth/me`, {
    cache: "no-store",
    credentials: "include",
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();

  return data.user as AuthUser;
}

export async function logoutAdmin() {
  const response = await fetch(`${API_URL}/api/auth/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    throw new Error("Não foi possível encerrar a sessão.");
  }
}
