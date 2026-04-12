import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLogin } from "@/hooks/Login/useLogin"
import { AlertCircle, ArrowRight, Loader2, Users, Shield, Zap, BarChart2 } from "lucide-react"

function Login() {
    const {
        email,
        setEmail,
        password,
        setPassword,
        isLoading,
        error,
        handleLogin
    } = useLogin();

    return (
        <div className="relative min-h-screen flex overflow-hidden bg-background selection:bg-primary/20">
            {/* === Left panel — branding / feature highlights (hidden on mobile) === */}
            <div className="hidden lg:flex flex-col justify-between w-[48%] relative overflow-hidden bg-primary p-12">
                {/* Animated orbs */}
                <div className="absolute top-[-20%] right-[-15%] w-[60%] h-[60%] rounded-full bg-white/8 blur-3xl animate-mesh-drift pointer-events-none" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full bg-primary-foreground/5 blur-3xl animate-mesh-drift-slow pointer-events-none" />
                <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] rounded-full bg-white/5 blur-2xl pointer-events-none" />

                {/* Brand */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
                        <Users className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold text-white tracking-tight">NexusHR</span>
                </div>

                {/* Hero content */}
                <div className="relative z-10 space-y-10">
                    <div className="space-y-4">
                        <h2 className="text-4xl font-extrabold text-white leading-tight">
                            Your workforce,
                            <br />
                            <span className="text-white/70">beautifully managed.</span>
                        </h2>
                        <p className="text-white/60 text-base leading-relaxed max-w-xs">
                            A unified platform for HR operations — from hiring to payroll, all in one place.
                        </p>
                    </div>

                    {/* Feature pills */}
                    <div className="space-y-3">
                        {[
                            { icon: Shield, label: "Enterprise-grade security", desc: "AES-256 encrypted data" },
                            { icon: BarChart2, label: "Real-time analytics", desc: "Department & payroll insights" },
                            { icon: Zap, label: "Smart automation", desc: "Bulk payroll & roster generation" },
                        ].map(({ icon: Icon, label, desc }) => (
                            <div key={label} className="flex items-center gap-4 bg-white/8 rounded-xl px-4 py-3 border border-white/10 backdrop-blur-sm">
                                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                                    <Icon className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">{label}</p>
                                    <p className="text-xs text-white/55">{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer quote */}
                <p className="relative z-10 text-white/35 text-xs">
                    © {new Date().getFullYear()} NexusHR · Empowering teams everywhere
                </p>
            </div>

            {/* === Right panel — login form === */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-10 relative">
                {/* Subtle ambient orbs (light mode) */}
                <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-primary/6 blur-3xl pointer-events-none" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-primary/4 blur-3xl pointer-events-none" />

                <div className="relative w-full max-w-[420px] animate-slide-up-fade">
                    {/* Mobile brand */}
                    <div className="flex items-center gap-3 mb-8 lg:hidden">
                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
                            <Users className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="text-lg font-extrabold tracking-tight text-foreground">NexusHR</h1>
                            <p className="text-xs text-muted-foreground">Human Capital Platform</p>
                        </div>
                    </div>

                    {/* Form card */}
                    <Card className="border-border/60 shadow-2xl shadow-primary/6 bg-card/90 backdrop-blur-xl">
                        <CardHeader className="space-y-1.5 pb-5">
                            <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
                            <CardDescription className="text-sm">
                                Sign in to access your workspace
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <form onSubmit={handleLogin}>
                                <div className="flex flex-col gap-5">
                                    {error && (
                                        <div className="flex items-start gap-3 bg-destructive/8 text-destructive text-sm p-3.5 rounded-xl border border-destructive/20 animate-slide-up-fade">
                                            <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                                            <span className="font-medium leading-relaxed">{error}</span>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-sm font-semibold">
                                            Email Address
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="name@company.com"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            disabled={isLoading}
                                            className="h-11 px-4 bg-muted/40 border-border/60 focus:bg-card transition-colors placeholder:text-muted-foreground/50 rounded-xl"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
                                            <a href="#" className="text-xs font-semibold text-primary hover:text-primary/75 transition-colors">
                                                Forgot password?
                                            </a>
                                        </div>
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="••••••••"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            disabled={isLoading}
                                            className="h-11 px-4 bg-muted/40 border-border/60 focus:bg-card transition-colors placeholder:text-muted-foreground/50 rounded-xl"
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full h-11 text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 rounded-xl"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Authenticating...
                                            </>
                                        ) : (
                                            <>
                                                Sign In
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>

                        <CardFooter className="flex flex-col pt-4 pb-5">
                            <p className="text-xs text-muted-foreground text-center leading-relaxed">
                                By signing in, you agree to our{" "}
                                <a href="#" className="underline underline-offset-3 hover:text-primary transition-colors">Terms</a>
                                {" "}and{" "}
                                <a href="#" className="underline underline-offset-3 hover:text-primary transition-colors">Privacy Policy</a>
                            </p>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default Login