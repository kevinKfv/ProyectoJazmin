"use client"

import { useChat } from '@ai-sdk/react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sparkles, Send, ImageIcon, Loader2, Bot, User, X, MessageCircle } from "lucide-react"
import { useState, useRef, useEffect } from "react"

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const { messages, sendMessage, status, error } = useChat()
  const isLoading = status === 'submitted' || status === 'streaming'
  
  const [files, setFiles] = useState<FileList | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!(input || '').trim() && !(files && files.length > 0)) return;
    
    const userMessage = input || '';
    setInput('');
    
    if (files && files.length > 0) {
      sendMessage({
        text: userMessage,
        files: files,
      })
      setFiles(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } else {
      sendMessage({
        text: userMessage,
      })
    }
  }

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  return (
    <>
      {/* Botón flotante para abrir/cerrar */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 p-0"
        size="icon"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>

      {/* Ventana de Chat */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-[350px] h-[500px] max-h-[calc(100vh-120px)] shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in-20">
          <CardHeader className="bg-slate-50 border-b pb-3 pt-4 px-4 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-md flex items-center">
              <Bot className="mr-2 h-5 w-5 text-purple-600" />
              SewStudio IA
            </CardTitle>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="flex-1 p-0 overflow-hidden relative bg-white dark:bg-slate-950">
            <ScrollArea className="h-full w-full p-4" ref={scrollAreaRef}>
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-sm text-center px-4 mt-8">
                  <Sparkles className="h-10 w-10 mb-3 opacity-20 text-purple-500" />
                  <p className="font-medium text-slate-700 dark:text-slate-300">¡Hola! Soy tu asistente de costura.</p>
                  <p className="mt-1">¿En qué proyecto estás trabajando hoy?</p>
                </div>
              ) : (
                <div className="space-y-4 pb-4">
                  {messages.map((m) => (
                    <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex gap-2 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 mt-1 ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-purple-100 text-purple-600'}`}>
                          {m.role === 'user' ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                        </div>
                        <div className={`p-2.5 rounded-lg text-sm ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'}`}>
                          <div className="text-sm">
                            <ReactMarkdown 
                              remarkPlugins={[remarkGfm]}
                              components={{
                                p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                                ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2" {...props} />,
                                ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-2" {...props} />,
                                li: ({node, ...props}) => <li className="mb-1" {...props} />,
                                h1: ({node, ...props}) => <h1 className="text-lg font-bold mb-2 mt-2" {...props} />,
                                h2: ({node, ...props}) => <h2 className="text-md font-bold mb-2 mt-2" {...props} />,
                                h3: ({node, ...props}) => <h3 className="text-sm font-bold mb-2 mt-2" {...props} />,
                                a: ({node, ...props}) => <a className="text-purple-600 dark:text-purple-400 hover:underline" {...props} />,
                                strong: ({node, ...props}) => <strong className="font-semibold" {...props} />,
                              }}
                            >
                              {(m as any).content || m.parts?.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('') || ''}
                            </ReactMarkdown>
                          </div>
                          {(m as any).experimental_attachments?.map((attachment: any, index: number) => (
                            <div key={index} className="mt-2">
                              {attachment.contentType?.startsWith('image/') && (
                                <img 
                                  src={attachment.url} 
                                  alt="Imagen adjunta" 
                                  className="max-w-full h-auto rounded max-h-48 object-contain"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex gap-2 max-w-[80%]">
                        <div className="h-6 w-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 mt-1">
                          <Bot className="h-3 w-3" />
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center h-9">
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                  )}
                  {error && (
                    <div className="flex justify-center p-2">
                      <div className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs max-w-[90%] text-center border border-red-100">
                        Error: {error.message || "Error al enviar el mensaje."}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </CardContent>
  
          <CardFooter className="bg-slate-50 border-t p-3">
            <form onSubmit={onSubmit} className="flex w-full gap-2 items-end">
              <div className="flex-1 space-y-2">
                {files && files.length > 0 && (
                  <div className="text-xs text-blue-600 bg-blue-50 p-1.5 rounded flex justify-between items-center">
                    <span>1 imagen lista</span>
                    <button type="button" onClick={() => { setFiles(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="text-red-500 hover:text-red-700 ml-2 font-medium">
                      ×
                    </button>
                  </div>
                )}
                <div className="flex gap-1.5">
                  <input
                    type="file"
                    className="hidden"
                    onChange={event => {
                      if (event.target.files) {
                        setFiles(event.target.files)
                      }
                    }}
                    ref={fileInputRef}
                    accept="image/*"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => fileInputRef.current?.click()}
                    title="Adjuntar imagen"
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                  <input 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 h-8 w-full min-w-0 rounded-md border border-input bg-white dark:bg-slate-900 px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isLoading}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if ((input || '').trim() || (files && files.length > 0)) {
                          e.currentTarget.form?.requestSubmit();
                        }
                      }
                    }}
                  />
                  <Button type="submit" size="icon" className="h-8 w-8 shrink-0" disabled={isLoading || (!(input || '').trim() && !files)}>
                    <Send className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </form>
          </CardFooter>
        </Card>
      )}
    </>
  )
}
