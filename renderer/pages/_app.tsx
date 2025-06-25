// pages/_app.tsx
import "../styles/globals.css";
import type { AppProps } from "next/app";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import WindowControls from "@/components/ui/WindowControls";
import Link from "next/link";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className="bg-[url('/images/bg.png')] bg-cover bg-center bg-no-repeat text-foreground min-h-screen flex flex-col">
      {/* شريط المهام العلوي */}
      <div className="w-full h-[10vh] bg-[#2B2B32]">
        <Card className="w-full h-full rounded-none shadow-sm">
          <CardContent className="w-full h-full flex items-center justify-between px-6 py-2 text-card-foreground">
            <Link href="/home">
              <Button
                variant="link"
                className="text-lg px-6 py-3 font-semibold shadow-xl hover:scale-105 transition-transform bg-transparent text-foreground hover:bg-muted"
              >
                الصفحة الرئيسية
              </Button>
            </Link>
            <WindowControls />
          </CardContent>
        </Card>
        <Separator className="bg-border" />
      </div>

      {/* محتوى الصفحة */}
      <div className="flex flex-col w-full flex-1">
        {/* الشعار */}
        <Link href="/home" className="mx-auto mt-4">
          <img className="logo" src="/images/logo.png" alt="شعار التطبيق" />
        </Link>

        {/* المحتوى الفعلي */}
        <main className="flex-1 w-full px-4 mt-4">
          <Component {...pageProps} />
        </main>
      </div>
    </div>
  );
}
