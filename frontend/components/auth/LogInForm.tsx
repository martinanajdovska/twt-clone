'use client'
import React, { ChangeEvent, useEffect, useRef, useState } from 'react'
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLogin } from "@/hooks/auth/useLogin";
import { BASE_URL } from "@/lib/constants";

const LogInForm = () => {
    const searchParams = useSearchParams();
    const oauthRedirectHandledRef = useRef(false);
    const [state, setState] = useState({
        email: "",
        password: ""
    })

    const { mutate: handleLogin, isPending } = useLogin();

    useEffect(() => {
        const oauth = searchParams.get('oauth');
        const error = searchParams.get('error');
        const accessToken = searchParams.get('access_token');

        if (searchParams.get('session_expired') === '1') {
            document.cookie = 'token=; Path=/; Max-Age=0';
            window.history.replaceState({}, '', '/login');
        }

        if (oauth === 'success') {
            if (!oauthRedirectHandledRef.current) {
                oauthRedirectHandledRef.current = true;
                if (accessToken) {
                    const secureAttr = window.location.protocol === 'https:' ? '; Secure' : '';
                    document.cookie = `token=${encodeURIComponent(accessToken)}; Path=/; Max-Age=${60 * 60 * 24}; SameSite=Lax${secureAttr}`;
                }
                setTimeout(() => window.location.replace('/'), 100);
            }
            return;
        }
        if (error) {
            alert(decodeURIComponent(error));
        }
    }, [searchParams]);

    function handleChange(e: ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setState(prevState => ({
            ...prevState,
            [name]: value
        }))
    }

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        handleLogin({ email: state.email, password: state.password });
    }

    function onGoogleLogin() {
        if (typeof window === 'undefined') return;
        const returnTo = encodeURIComponent(window.location.href);
        window.location.assign(
            `${BASE_URL}/api/auth/google/authorize?platform=web&returnTo=${returnTo}`,
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
            <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-sm bg-secondary">
                <div className="flex flex-col space-y-2 text-center mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome back</h1>
                    <p className="text-sm text-muted-foreground">Sign in with your email and password</p>
                </div>

                <form className="flex flex-col gap-4" onSubmit={onSubmit}>
                    <div className="space-y-1">
                        <label className="text-sm font-medium" htmlFor="email">Email</label>
                        <input
                            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50"
                            type="email"
                            name="email"
                            id="email"
                            placeholder="you@example.com"
                            value={state.email}
                            onChange={handleChange}
                            autoComplete="email"
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium" htmlFor="password">Password</label>
                        </div>
                        <input
                            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50"
                            type="password"
                            name="password"
                            id="password"
                            placeholder="••••••••"
                            value={state.password}
                            onChange={handleChange}
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    <button
                        className="mt-2 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                        type="submit"
                        disabled={isPending}
                    >
                        {isPending ? (
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                <span>Signing in...</span>
                            </div>
                        ) : "Sign In"}
                    </button>
                    <button
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 h-10 px-4 py-2"
                        type="button"
                        onClick={onGoogleLogin}
                        disabled={isPending}
                    >
                        Continue with Google
                    </button>
                </form>

                <div className="mt-6 text-center text-sm">
                    <span className="text-muted-foreground">Don&apos;t have an account? </span>
                    <Link href="/register" className="font-semibold text-primary hover:underline underline-offset-4">
                        Sign up here!
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default LogInForm