import { Outlet } from "react-router-dom"
import Header from "./Header"
import Sidebar from "./Sidebar"
import BulletinBanner from "./bulletins/BulletinBanner"

export default function Layout() {
    return (
        <div className="flex flex-col h-screen w-full bg-background text-foreground font-sans selection:bg-primary/20 overflow-hidden">
            <Header />
            <BulletinBanner />
            <div className="flex flex-1 overflow-hidden relative">
                {/* Ambient mesh gradient backgrounds */}
                <div
                    className="absolute top-[-15%] left-[-5%] w-[50%] h-[50%] rounded-full pointer-events-none -z-10 animate-mesh-drift opacity-60"
                    style={{ background: "radial-gradient(circle, oklch(0.51 0.22 264 / 0.05) 0%, transparent 70%)" }}
                />
                <div
                    className="absolute bottom-[-10%] right-[-5%] w-[45%] h-[45%] rounded-full pointer-events-none -z-10 animate-mesh-drift-slow opacity-50"
                    style={{ background: "radial-gradient(circle, oklch(0.62 0.22 290 / 0.04) 0%, transparent 70%)" }}
                />
                <div
                    className="absolute top-[40%] right-[20%] w-[30%] h-[30%] rounded-full pointer-events-none -z-10 opacity-30"
                    style={{ background: "radial-gradient(circle, oklch(0.64 0.18 200 / 0.04) 0%, transparent 70%)" }}
                />

                <Sidebar />
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
