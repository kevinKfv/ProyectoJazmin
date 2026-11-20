import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { AiChatWidget } from "@/components/ai-chat-widget"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen bg-white dark:bg-slate-950 relative">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
      <AiChatWidget />
    </div>
  )
}
