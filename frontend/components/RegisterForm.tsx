'use client'
import React, { ChangeEvent, FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from "../styles/styles.module.css"
import Link from "next/link";

const SignInForm = () => {
    const router = useRouter();

    const [state, setState] = useState({
        username: "",
        password: "",
        email: ""
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
            const res = await fetch(`http://localhost:8080/api/auth/register`, {
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
            <h1 className={styles.title}>Sign Up</h1>
            <div className={styles.form}>
                <input className={styles.input}
                       type="text"
                       name="username"
                       placeholder="username"
                       value={state.username}
                       onChange={handleChange}
                       autoComplete="off" />
                <input className={styles.input}
                       type="text"
                       name="email"
                       placeholder="email"
                       value={state.email}
                       onChange={handleChange}
                       autoComplete="off" />
                <input className={styles.input}
                       type="password"
                       name="password"
                       placeholder="password"
                       value={state.password}
                       onChange={handleChange} />
                <button className={styles.btn} onClick={handleSubmit}>Submit</button>
                <p>Already have an account? <Link href="/login">Sign in here!</Link></p>
            </div>
        </div>
    )
}

export default SignInForm