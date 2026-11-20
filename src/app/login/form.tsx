"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError("Credenciales inválidas. Por favor intenta de nuevo.")
      setLoading(false)
    } else {
      router.push("/dashboard")
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 w-full">
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="email" className="font-semibold text-slate-700 dark:text-slate-300">Correo Electrónico</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="tu@correo.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 transition-all focus-visible:ring-primary focus-visible:border-primary"
            required 
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password" className="font-semibold text-slate-700 dark:text-slate-300">Contraseña</Label>
          <Input 
            id="password" 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 transition-all focus-visible:ring-primary focus-visible:border-primary"
            required 
          />
        </div>
      </div>
      {error && (
        <div className="p-3 text-sm bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400 rounded-md border border-red-100 dark:border-red-900 text-center animate-in fade-in slide-in-from-top-1">
          {error}
        </div>
      )}
      <Button className="w-full h-12 text-md font-semibold mt-2 shadow-lg hover:shadow-primary/25 transition-all" type="submit" disabled={loading}>
        {loading ? "Entrando..." : "Ingresar a mi Taller"}
      </Button>
    </form>
  )
}
