'use client'
import React, {ChangeEvent, useState} from 'react'
import {useRouter} from 'next/navigation'
import {useMutation} from '@tanstack/react-query'
import styles from "../styles/styles.module.css"
import Link from "next/link";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const SignInForm = () => {
    const router = useRouter();

    const [state, setState] = useState({
        username: "",
        password: "",
        email: ""
    })

    const {mutate: handleRegister, isPending} = useMutation({
        mutationFn: async (userData: typeof state) => {
            const res = await fetch(`${BASE_URL}/api/auth/register`, {
                method: "POST",
                body: JSON.stringify(userData),
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: 'include'
            });

            if (res.status !== 201) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || "Registration failed");
            }

            return res;
        },
        onSuccess: () => {
            router.push('/');
            router.refresh();
        },
        onError: (err: Error) => {
            alert(err.message);
        }
    });

    function handleChange(e: ChangeEvent<HTMLInputElement>) {
        const {name, value} = e.target;
        setState(prevState => ({
            ...prevState,
            [name]: value
        }))
    }

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        handleRegister(state);
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Sign Up</h1>
            <form className={styles.form} onSubmit={onSubmit}>
                <input className={styles.input}
                       type="text"
                       name="username"
                       placeholder="username"
                       value={state.username}
                       onChange={handleChange}
                       autoComplete="off"
                       required/>
                <input className={styles.input}
                       type="text"
                       name="email"
                       placeholder="email"
                       value={state.email}
                       onChange={handleChange}
                       autoComplete="off"
                       required/>
                <input className={styles.input}
                       type="password"
                       name="password"
                       placeholder="password"
                       value={state.password}
                       onChange={handleChange}
                       required/>
                <button
                    className="my-3 rounded px-4 py-2 bg-blue-500 text-black disabled:bg-gray-400"
                    type="submit"
                    disabled={isPending}
                >
                    {isPending ? "Signing up..." : "Submit"}
                </button>
                <p>Already have an account? <Link href="/login" className="text-decoration-underline text-primary">Sign in here!</Link></p>
            </form>
        </div>
    )
}

export default SignInForm