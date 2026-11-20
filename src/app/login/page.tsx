import LoginForm from "./form"
import Image from "next/image"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen bg-slate-950">
      <div className="flex w-full lg:w-1/2 flex-col justify-center items-center p-8 bg-background relative z-10 shadow-2xl">
        <div className="w-full max-w-sm">
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-bold tracking-tight mb-2 bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent">SewStudio</h1>
            <p className="text-muted-foreground">Tu taller digital de costura y diseño.</p>
          </div>
          <LoginForm />
        </div>
      </div>
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-background to-transparent z-10 w-32"></div>
        <Image 
          src="/login-bg.png" 
          alt="SewStudio Background" 
          fill 
          className="object-cover object-center transform hover:scale-105 transition-transform duration-1000"
          priority
        />
        <div className="absolute inset-0 bg-primary/10 mix-blend-overlay"></div>
      </div>
    </div>
  )
}
