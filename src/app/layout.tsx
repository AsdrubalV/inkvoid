import type { Metadata } from "next";
import "./globals.css";
import { ReactNode } from "react";
import { createServerSupabase } from "@/lib/supabase/server";
import { AuthProvider } from "@/components/AuthProvider";
import Footer from "@/components/Footer";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import NavbarClient from "@/components/NavbarClient";
import Script from "next/script";

export const metadata: Metadata = {
  title: "InkVoid",
  description: "Lee, escribe y descubre historias",
  icons: {
    icon: "/inkvoidlogo1.png",
    apple: "/inkvoidlogo1.png"
  }
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  let username: string | null = null;
  let hasSubscription = false;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single();
    username = profile?.username ?? null;

    const { data: sub } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();
    hasSubscription = !!sub;
  }

  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />

        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-BBPW5SHKDW"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-BBPW5SHKDW');
          `}
        </Script>

        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1545799847111899');
            fbq('track', 'PageView');
          `}
        </Script>
      </head>
      <body className="min-h-screen bg-background text-foreground">
        <AuthProvider>
          <ServiceWorkerRegister />
          <NavbarClient user={user} username={username} hasSubscription={hasSubscription} />
          <main className="container py-8">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}