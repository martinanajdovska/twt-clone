export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const API_BASE =
  typeof window === "undefined"
    ? process.env.NEXT_PUBLIC_API_URL ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      "http://localhost:3000"
    : "";
