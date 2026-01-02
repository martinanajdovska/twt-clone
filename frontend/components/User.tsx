import React from 'react'

import Logout from "@/components/Logout";
import Link from "next/link";
import TweetForm from "@/components/TweetForm";
import Feed from "@/components/Feed";
import {cookies} from "next/headers";
import Layout from "@/components/layout";
import {fetchSelfUsername} from "@/components/dataFetching";

const User = async () => {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        return (
            <div>
                <Layout>
                    <h1>Welcome!</h1>
                    <p><Link href="/register">Sign Up</Link></p>
                    <p><Link href="/login">Sign In</Link></p>
                </Layout>
            </div>
        )
    }

    const self = await fetchSelfUsername({token});
    const username = self.username;

    return (
        <div className="container-fluid pt-5">
            <Logout/>
            <section className="row">
                <div className="col-4">
                    <Link href={`/`}>Back to feed</Link>
                </div>
                <div className="col-8">
                    <TweetForm token={token}/>
                    <Feed token={token} username={username}/>
                </div>
            </section>
        </div>
    )
}
export default User
