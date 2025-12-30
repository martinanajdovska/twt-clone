'use client'
import React, { ChangeEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import styles from "../styles/styles.module.css"
import Link from "next/link";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const LogInForm = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    const [state, setState] = useState({
        username: "",
        password: ""
    })

    const { mutate: handleLogin, isPending } = useMutation({
        mutationFn: async (credentials: typeof state) => {
            const res = await fetch(`${BASE_URL}/api/auth/login`, {
                method: "POST",
                body: JSON.stringify(credentials),
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: 'include'
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || "Invalid username or password");
            }

            return res;
        },
        onSuccess: () => {
            queryClient.clear();

            router.push('/');
            router.refresh();
        },
        onError: (err: Error) => {
            alert(err.message);
        }
    });

    function handleChange(e: ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setState(prevState => ({
            ...prevState,
            [name]: value
        }))
    }

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        handleLogin(state);
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Sign In</h1>
            <form className={styles.form} onSubmit={onSubmit}>
                <input
                    className={styles.input}
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={state.username}
                    onChange={handleChange}
                    autoComplete="username"
                    required
                />
                <input
                    className={styles.input}
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={state.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                    required
                />
                <button
                    className="my-3 rounded px-4 py-2 bg-blue-500 text-black disabled:bg-gray-400"
                    type="submit"
                    disabled={isPending}
                >
                    {isPending ? "Signing in..." : "Submit"}
                </button>
            </form>
            <p>Don't have an account? <Link href="/register" className="text-decoration-underline text-primary">Sign up here!</Link></p>
        </div>
    )
}

export default LogInForm