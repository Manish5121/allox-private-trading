import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { ClientProviders } from "./client-providers";

export const metadata: Metadata = {
    title: "Allox - Private Company Trading",
    description: "Trade private company shares with real-time market data",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="antialiased">
                <Providers>
                    <ClientProviders>
                        {children}
                    </ClientProviders>
                </Providers>
            </body>
        </html>
    );
}
