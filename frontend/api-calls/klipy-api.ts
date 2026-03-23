import { GIFS_API_KEY } from "@/lib/constants";

const KLIPY_BASE = "https://api.klipy.com/api/v1";

export type Gif = {
  id: string;
  tinyGifUrl: string;
  mediumGifUrl: string;
};

export async function searchGifs(query: string, limit = 25): Promise<Gif[]> {
  if (!GIFS_API_KEY) throw new Error("Missing GIF API key.");

  const endpoint = query.trim()
    ? `${KLIPY_BASE}/${GIFS_API_KEY}/gifs/search?q=${encodeURIComponent(query)}&limit=${limit}&client_key=twt-web`
    : `${KLIPY_BASE}/${GIFS_API_KEY}/gifs/trending?limit=${limit}&client_key=twt-web`;

  const res = await fetch(endpoint);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to fetch from Klipy");
  }

  const data = await res.json();
  const items = data?.data?.data ?? [];

  return items.map((r: { id: string; file?: { sm?: { gif?: { url: string } }; xs?: { gif?: { url: string } }; md?: { gif?: { url: string } }; hd?: { gif?: { url: string } } } }) => ({
    id: String(r.id),
    tinyGifUrl: r.file?.sm?.gif?.url ?? r.file?.xs?.gif?.url ?? "",
    mediumGifUrl: r.file?.md?.gif?.url ?? r.file?.hd?.gif?.url ?? "",
  }));
}
