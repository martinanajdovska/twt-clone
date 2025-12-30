'use client'
import React, { ChangeEvent, FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'

const TweetForm = () => {
    const router = useRouter();

    const [state, setState] = useState({
        content: "",
    })

    function handleChange(e: ChangeEvent<HTMLTextAreaElement>) {
        const { name, value } = e.target;
        setState(prevState => ({
            ...prevState,
            [name]: value
        }))
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();

        try {
            const res = await fetch(`http://localhost:8080/api/tweets`, {
                method: "POST",
                body: JSON.stringify(state),
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: 'include'
            })
            if (res.status === 201) {
                router.push('/');
                router.refresh();
            } else {
                alert("Error creating tweet");
            }
        } catch (err) {
            console.error("Connection error:", err);
            alert("Could not connect to the server.");
        }
    }

    return (
        <div className="mb-3">
            <form onSubmit={handleSubmit}>
                <textarea
                    name="content"
                    placeholder="Share your thoughts..."
                    value={state.content}
                    cols={40}
                    rows={5}
                    autoComplete="content"
                    onChange={handleChange}
                />
                 {/*TODO: upload image*/}
                <button className="ms-3"  type="submit">Tweet</button>
            </form>
        </div>
    )
}

export default TweetForm