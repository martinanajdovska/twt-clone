'use client'
import React, {ChangeEvent, useState} from 'react'
import Link from "next/link";
import {useRegister} from "@/hooks/auth/useRegister";


const SignInForm = () => {

    const [state, setState] = useState({
        username: "",
        password: "",
        email: ""
    })

    const { mutate: handleRegister, isPending } = useRegister();

    function handleChange(e: ChangeEvent<HTMLInputElement>) {
        const {name, value} = e.target;
        setState(prevState => ({
            ...prevState,
            [name]: value
        }))
    }

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        handleRegister({...state});
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
            <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-sm bg-secondary">
                <div className="flex flex-col space-y-2 text-center mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Create an account</h1>
                    <p className="text-sm text-muted-foreground">Enter your details below to sign up</p>
                </div>

                <form className="flex flex-col gap-4" onSubmit={onSubmit}>
                    <div className="space-y-1">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="username">Username</label>
                        <input
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            type="text"
                            name="username"
                            id="username"
                            placeholder="johndoe"
                            value={state.username}
                            onChange={handleChange}
                            autoComplete="off"
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium leading-none" htmlFor="email">Email</label>
                        <input
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            type="email"
                            name="email"
                            id="email"
                            placeholder="name@example.com"
                            value={state.email}
                            onChange={handleChange}
                            autoComplete="off"
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium leading-none" htmlFor="password">Password</label>
                        <input
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            type="password"
                            name="password"
                            id="password"
                            placeholder="••••••••"
                            value={state.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button
                        className="mt-2 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                        type="submit"
                        disabled={isPending}
                    >
                        {isPending ? (
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                <span>Creating account...</span>
                            </div>
                        ) : "Sign Up"}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm">
                    <span className="text-muted-foreground">Already have an account? </span>
                    <Link href="/login" className="font-semibold text-primary hover:underline underline-offset-4">
                        Sign in here!
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default SignInForm