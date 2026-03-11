import Logout from "@/components/auth/Logout";
import Link from "next/link";
import { Home, User as UserIcon, Bookmark } from "lucide-react";
import { fetchSelfUsernameAndProfilePicture } from "@/api-calls/users-api";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";
import NotificationListener from "@/listeners/NotificationListener";
import NotificationLink from "@/components/notifications/NotificationLink";
import MessagesLink from "@/components/layout/MessagesLink";
import MobileTopBar from "@/components/layout/MobileTopBar";
import RightSidebarContent from "@/components/layout/RightSidebarContent";
import MainContentPadding from "@/components/layout/MainContentPadding";
import { ModeToggle } from "@/components/ui/ModeToggle";

export default async function AuthenticatedLayout({ children, }: { children: React.ReactNode; }) {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
        redirect("/login");
    }

    let self;
    try {
        self = await fetchSelfUsernameAndProfilePicture({ token });
    } catch {
        redirect('/api/auth/clear-session');
    }

    return (
        <div className="h-screen bg-background flex justify-between overflow-hidden">
            <NotificationListener />

            <div className="md:hidden">
                <MobileTopBar />
            </div>

            {/* Left sidebar */}
            <aside className="flex flex-col w-[72px] md:w-[80px] xl:w-[230px] shrink-0 px-2 py-2 sticky top-0 h-screen border-r border-border items-center xl:items-stretch">
                <nav className="flex flex-col gap-1 mt-1 w-full items-center xl:items-stretch">
                    <NavLink href="/" icon={<Home size={26} strokeWidth={1.5} />} label="Home" />
                    <NavLink href={`/users/${self.username}`} icon={<UserIcon size={26} strokeWidth={1.5} />} label="Profile" />
                    <NotificationLink />
                    <MessagesLink />
                    <NavLink href="/bookmarks" icon={<Bookmark size={26} strokeWidth={1.5} />} label="Bookmarks" />
                    <div className="w-full flex justify-center xl:justify-start">
                        <ModeToggle label="Theme" sidebar />
                    </div>
                </nav>
                <div className="mt-auto mb-4">
                    <Logout />
                </div>
            </aside>

            {/* Center column */}
            <main className="w-full min-w-0 border-x border-border bg-background h-screen overflow-y-auto">
                <MainContentPadding>{children}</MainContentPadding>
            </main>

            {/* Right sidebar */}
            <aside className="hidden lg:flex flex-col w-[400px] xl:w-[440px] px-3 py-3 sticky top-0 h-screen overflow-y-auto gap-4">
                <RightSidebarContent />
            </aside>
        </div>
    );
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    return (
        <Link
            href={href}
            className="flex items-center gap-3 py-3 px-3 xl:px-3 text-[19px] font-normal rounded-full hover:bg-accent transition-colors w-fit xl:w-fit justify-center xl:justify-start min-w-[48px]"
        >
            {icon}
            <span className="hidden xl:inline">{label}</span>
        </Link>
    );
}