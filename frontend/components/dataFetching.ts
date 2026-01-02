const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// get feed for logged in user
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
    return data;
}

// get profile for username
export const fetchProfileFeed = async ({pageParam = 0, username = ""}: { pageParam: number, username: string }) => {
    const response = await fetch(`${BASE_URL}/api/users/${username}?page=${pageParam}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include'
    });

    if (!response.ok) {
        throw new Error('Error getting user data');
    }

    const data = await response.json();
    const tweets = await data.tweets;
    return tweets;
}

// get username of logged in user
export const fetchSelfUsername = async ({token}:{token:string}) => {
    const response = await fetch(`${BASE_URL}/api/me`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': `token=${token}`,
        },
    });
    if (!response.ok) {
        throw new Error('Error getting user data');
    }

    const data = await response.json();
    return data;
}