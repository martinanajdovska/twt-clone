import Link from 'next/link'

import Layout from '../components/layout'
import Tweet from "@/components/Tweet";
import { cookies } from 'next/headers';
import {ITweetResponse} from "@/dtos/ITweetResponse";
import Logout from "@/components/Logout";
import TweetForm from "@/components/TweetForm";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default async function Home() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    const response = await fetch(`${BASE_URL}/api/tweets`, {
        method: 'GET',
        headers: {
            'Cookie': `token=${token}`,
            'Content-Type': 'application/json',
        },
    });
    if (response.ok) {
        const tweets = await response.json();
        console.log(tweets);

        return (
            <div className="container-fluid pt-5">
                <Logout/>
                <section className="row">
                    <div className="col-4">
                        Profile info
                    </div>
                    <div className="col-8">
                        <TweetForm/>
                        <ul className="m-0 p-0">
                            {tweets && tweets.length > 0 && tweets.map((tweet : ITweetResponse) => (
                                <li key={tweet.id} className="mb-3 tweet">
                                    <Tweet {...tweet} />
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>
            </div>
        )
    }

    return (
        <div>
            <Layout>
                <h1>Home</h1>
                <p><Link href="/register">Sign Up</Link></p>
                <p><Link href="/login">Sign In</Link></p>
            </Layout>
        </div>
    )
}