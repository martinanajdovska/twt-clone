'use client'
import React from 'react'
import {useQuery} from "@tanstack/react-query";
import {ITweetResponse} from "@/dtos/ITweetResponse";
import Tweet from "@/components/Tweet";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const User = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            const response = await fetch(`${BASE_URL}/api/me`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Error getting user data');
            }

            return response.json();
        },
    });


    if (isLoading) return <div>Loading user...</div>;

    if (error) return <div>Error loading user</div>;

    return (
        <div>
            <div>Hello {data?.username}</div>
            <ul className="m-0 p-0">
                {data?.tweets?.map((tweet:ITweetResponse) => (
                    <li key={tweet.id} className="mb-3 tweet">
                        <Tweet {...tweet} />
                    </li>
                ))}
            </ul>
        </div>

    )
}
export default User
