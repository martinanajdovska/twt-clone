import Logout from "@/components/auth/Logout";
import Link from "next/link";
import {Home, User as UserIcon} from "lucide-react";
import Search from "@/components/ui/Search";
import {ModeToggle} from "@/components/ui/ModeToggle";
import {fetchSelfUsername} from "@/api-calls/users-api";
import {cookies} from "next/headers";
import {redirect} from "next/navigation";
import React from "react";
import NotificationListener from "@/listeners/NotificationListener";
import NotificationDropdown from "@/components/notifications/NotificationDropdown";

export default async function AuthenticatedLayout({children,}: { children: React.ReactNode; }) {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
        redirect("/login");
    }

    const self = await fetchSelfUsername({token});

    return (
        <div className="min-h-screen bg-background py-10">
            <NotificationListener token={token}/>

            <div className="max-w-12xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-10">
                    <aside className="md:col-span-1 lg:col-span-3 sticky top-10 left-10 flex flex-col h-fit">
                        <nav className="flex flex-col gap-1">
                            <NavLink href="/" icon={<Home size={26}/>} label="Home"/>
                            <NavLink href={`/users/${self.username}`} icon={<UserIcon size={26}/>} label="Profile"/>
                            <div
                                className="flex items-center gap-4 p-3 text-xl font-medium rounded-full hover:bg-accent transition-all w-fit pr-8 lg:pr-6">
                                <NotificationDropdown/>
                                <span className="hidden lg:inline">Notifications</span>
                            </div>
                        </nav>
                        <div className="mt-4">
                            <Logout/>
                        </div>
                    </aside>

                    <main
                        className="md:col-span-12 lg:col-span-6 mt-10 bg-card border border-border overflow-hidden shadow-sm">
                        <div className="flex flex-col pt-12 px-6 pb-6 gap-6">
                            {children}
                        </div>
                    </main>

                    <aside className="hidden lg:block lg:col-span-3 sticky top-10 -right-15 h-fit">
                        <div className="flex flex-col gap-6">
                            <Search/>
                            <div className="p-4 bg-card border border-border rounded-3xl">
                                <div className="flex items-center">
                                    <span className="text-sm font-bold">Theme</span>
                                    <ModeToggle/>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}

function NavLink({href, icon, label}: { href: string; icon: React.ReactNode; label: string }) {
    return (
        <Link
            href={href}
            className="flex items-center gap-4 p-3 text-xl font-medium rounded-full hover:bg-accent transition-all w-fit pr-8 lg:pr-6"
        >
            {icon}
            <span className="hidden lg:inline">{label}</span>
        </Link>
    );
}