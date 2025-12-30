import type {Metadata} from 'next'
import "bootstrap/dist/css/bootstrap.min.css";
import AddBootstrap from "@/components/bootstrap";
import QueryProvider from "@/providers/QueryProvider";

export const metadata: Metadata = {
    title: 'Twitter Clone',
    description: 'Twitter clone with Spring Boot and NextJS',
}


export default function RootLayout({children}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>
                <QueryProvider>
                    {children}
                </QueryProvider>
                <AddBootstrap/>
            </body>
        </html>
    )
}