import { API_BASE } from "@/lib/constants";

//  feed for logged in user
export const fetchTweets = async ({ pageParam = 0 }: {pageParam:number}) => {
    const response = await fetch(`${API_BASE}/api/tweets?page=${pageParam}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });
    if (!response.ok) throw new Error("Failed to fetch tweets");
    const data = await response.json();
    return data.content;
}

export const fetchTweetDetails = async ({pageParam=0, id}:{pageParam:number, id:number}) => {
    const res = await fetch(`${API_BASE}/api/tweets/${id}/details?page=${pageParam}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include'
    });
    if (!res.ok) {
        const error = await res.text()
        throw new Error(error)
    }

    const data = await res.json();
    return data;
}

export const fetchTweetQuotes = async ({
    tweetId,
    pageParam = 0,
    pageSize = 10,
}: {
    tweetId: number;
    pageParam?: number;
    pageSize?: number;
}) => {
    const res = await fetch(
        `${API_BASE}/api/tweets/${tweetId}/quotes?page=${pageParam}&size=${pageSize}`,
        {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
        }
    );
    if (!res.ok) {
        const error = await res.text();
        throw new Error(error);
    }
    return res.json();
};

export const fetchTweetsBySearchTerm = async (searchTerm: string) => {
    const res = await fetch(`${API_BASE}/api/tweets/search?q=${searchTerm}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
};

export const pinTweet = async (id: number) => {
    const res = await fetch(`${API_BASE}/api/tweets/${id}/pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
};

export const unpinTweet = async (id: number) => {
    const res = await fetch(`${API_BASE}/api/tweets/${id}/pin`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
};