"use client"

import { useState, useTransition, useRef } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { toggleProjectVisibility } from "@/app/actions/catalogo"
import { Loader2, ImagePlus, Globe, Lock } from "lucide-react"
import Image from "next/image"

export default function CatalogCard({ project }: { project: any }) {
  const [isPending, startTransition] = useTransition()
  const [isPublic, setIsPublic] = useState(project.isPublic)
  const [price, setPrice] = useState(project.publicPrice?.toString() || "")
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState(project.publicImageUrl)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0]
      setFile(f)
      setPreviewUrl(URL.createObjectURL(f))
    }
  }

  const handleSave = () => {
    startTransition(async () => {
      const formData = new FormData()
      formData.append("projectId", project.id)
      formData.append("isPublic", isPublic.toString())
      if (price) formData.append("publicPrice", price)
      if (file) formData.append("file", file)
      
      await toggleProjectVisibility(formData)
    })
  }

  return (
    <Card className={`overflow-hidden transition-all ${isPublic ? 'border-primary ring-1 ring-primary/20' : ''}`}>
      <div 
        className="w-full h-48 bg-slate-100 flex items-center justify-center relative cursor-pointer group"
        onClick={() => fileInputRef.current?.click()}
      >
        {previewUrl ? (
          <Image src={previewUrl} alt={project.name} fill className="object-cover" />
        ) : (
          <div className="flex flex-col items-center text-slate-400 group-hover:text-primary transition-colors">
            <ImagePlus className="h-8 w-8 mb-2" />
            <span className="text-sm font-medium">Subir foto de portada</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="text-white font-medium drop-shadow">Cambiar imagen</span>
        </div>
      </div>
      
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*"
        onChange={handleFileChange}
      />

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl line-clamp-1" title={project.name}>{project.name}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Finalizado el {new Date(project.updatedAt).toLocaleDateString()}</p>
          </div>
          <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-full px-3">
            {isPublic ? <Globe className="h-4 w-4 text-green-600" /> : <Lock className="h-4 w-4 text-slate-400" />}
            <Switch 
              checked={isPublic} 
              onCheckedChange={setIsPublic} 
              className="data-[state=checked]:bg-green-600"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-2">
        <div className="space-y-2">
          <Label htmlFor={`price-${project.id}`}>Precio de Venta ($)</Label>
          <Input 
            id={`price-${project.id}`}
            type="number" 
            placeholder="Ej: 1500" 
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
      </CardContent>

      <CardFooter>
        <Button 
          className="w-full" 
          onClick={handleSave} 
          disabled={isPending}
          variant={isPublic ? "default" : "secondary"}
        >
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Guardar Cambios
        </Button>
      </CardFooter>
    </Card>
  )
}
