'use client'
import React, { ChangeEvent, FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from "../styles/styles.module.css"
import Link from "next/link";

const SignInForm = () => {
    const router = useRouter();

    const [state, setState] = useState({
        username: "",
        password: ""
    })

    function handleChange(e: ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setState(prevState => ({
            ...prevState,
            [name]: value
        }))
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();

        try {
            const res = await fetch(`http://localhost:8080/api/auth/login`, {
                method: "POST",
                body: JSON.stringify(state),
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: 'include'
            })

            if (res.ok) {
                router.push('/');
                router.refresh();
            } else {
                alert("Invalid username or password");
            }
        } catch (err) {
            console.error("Connection error:", err);
            alert("Could not connect to the server.");
        }
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Sign In</h1>
            <form className={styles.form} onSubmit={handleSubmit}>
                <input
                    className={styles.input}
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={state.username}
                    onChange={handleChange}
                    autoComplete="username"
                />
                <input
                    className={styles.input}
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={state.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                />
                <button className={styles.btn} type="submit">Submit</button>
            </form>
            <p>Don't have an account? <Link href="/register">Sign up here!</Link></p>
        </div>
    )
}

export default SignInForm