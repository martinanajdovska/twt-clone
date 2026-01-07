import {BASE_URL} from "@/lib/constants";

// get profile feed for username
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
    return data.tweets;
}

// get username and profile picture of logged in user
export const fetchSelfUsernameAndProfilePicture = async ({token}:{token:string}) => {
    const response = await fetch(`${BASE_URL}/api/users/me/info`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            // fails with credentials instead of token
            'Cookie': `token=${token}`,
        },
    });
    if (!response.ok) {
        throw new Error('Error getting user data');
    }

    const data = await response.json();
    return data;
}

// get profile header
export const fetchProfileHeader = async ({username}:{username:string}) => {
    const response = await fetch(`${BASE_URL}/api/users/${username}/info`, {
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
    return data;
}

// get users by username
export const fetchUsers = async (searchTerm: string) => {
    if (!searchTerm) return [];

    const res = await fetch(`${BASE_URL}/api/users?search=${searchTerm}`, {
        method: 'GET',
        headers: {'Content-Type': 'application/json'},
        credentials: 'include'
    });

    if (!res.ok) {
        const error = await res.text()
        throw new Error(error)
    }
    return res.json();
};