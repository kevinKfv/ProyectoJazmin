"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { updateProjectStatus } from "@/app/actions/proyectos"
import Link from "next/link"

const STATUSES = ["Idea", "Diseño", "Corte", "Costura", "Ajustes", "Finalizado"]

type Project = {
  id: string
  name: string
  status: string
  totalCost: number | null
}

export default function KanbanBoard({ initialProjects }: { initialProjects: Project[] }) {
  const [projects, setProjects] = useState(initialProjects)
  
  const handleDragStart = (e: React.DragEvent, projectId: string) => {
    e.dataTransfer.setData("projectId", projectId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault() // Necessary to allow dropping
  }

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault()
    const projectId = e.dataTransfer.getData("projectId")
    
    // Optimistic update
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, status: newStatus } : p))
    
    // Server update
    const formData = new FormData()
    formData.append("projectId", projectId)
    formData.append("status", newStatus)
    await updateProjectStatus(formData)
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-200px)]">
      {STATUSES.map(status => {
        const columnProjects = projects.filter(p => p.status === status)
        
        return (
          <div 
            key={status} 
            className="flex-shrink-0 w-80 bg-slate-100 rounded-lg p-4 flex flex-col gap-3"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status)}
          >
            <div className="flex justify-between items-center px-1">
              <h3 className="font-medium">{status}</h3>
              <Badge variant="secondary">{columnProjects.length}</Badge>
            </div>
            
            <div className="flex-1 space-y-3 overflow-y-auto">
              {columnProjects.map(project => (
                <div 
                  key={project.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, project.id)}
                  className="cursor-move"
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-base">
                        <Link href={`/dashboard/proyectos/${project.id}`} className="hover:underline">
                          {project.name}
                        </Link>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 text-sm flex justify-between">
                      <span className="text-muted-foreground">Costo:</span>
                      <span className="font-medium">${project.totalCost || 0}</span>
                    </CardContent>
                  </Card>
                </div>
              ))}
              
              {columnProjects.length === 0 && (
                <div className="h-20 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-400 text-sm">
                  Arrastra aquí
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
