import { BASE_URL } from '@/lib/constants';

export const fetchBookmarks = async ({
  pageParam = 0,
}: {
  pageParam: number;
}) => {
  const base = BASE_URL || (typeof window !== 'undefined' ? '' : 'http://localhost:3000');
  const url = base ? `${base}/api/bookmarks?page=${pageParam}&size=5` : `/api/bookmarks?page=${pageParam}&size=5`;
  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch bookmarks');
  const data = await res.json();
  return data.content ?? [];
};
