import {BASE_URL} from "@/lib/constants";

//  feed for logged in user
export const fetchTweets = async ({ pageParam = 0 }: {pageParam:number}) => {
    const response = await fetch(`${BASE_URL}/api/tweets?page=${pageParam}`, {
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
    const res = await fetch(`${BASE_URL}/api/tweets/${id}/details?page=${pageParam}`, {
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