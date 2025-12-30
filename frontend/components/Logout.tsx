'use client'
import React, {FormEvent} from 'react'
import { useRouter } from 'next/navigation'

const Logout = () => {
    const router = useRouter()

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();


        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });
        if (response.ok) {
            router.push('/login');
            router.refresh();
        } else {
            alert("Error while logging out");
        }
    }


    return (
        <div>
            <form onSubmit={handleSubmit}>
                <button type="submit">Logout</button>
            </form>
        </div>
    )
}
export default Logout
