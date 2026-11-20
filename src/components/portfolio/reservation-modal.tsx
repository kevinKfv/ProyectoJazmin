"use client"

import { useState } from "react"
import { 
  ShoppingBag, 
  CreditCard, 
  CheckCircle2, 
  X, 
  ShieldCheck, 
  Sparkles, 
  Calendar, 
  Lock, 
  RefreshCw,
  Phone,
  Mail,
  User,
  Ruler
} from "lucide-react"
import { createCatalogReservation } from "@/app/actions/reservas"

interface ReservationModalProps {
  project: {
    id: string
    name: string
    description?: string | null
    publicPrice: number
    publicImageUrl?: string | null
  }
  onClose: () => void
}

export function ReservationModal({ project, onClose }: ReservationModalProps) {
  const [step, setStep] = useState<"form" | "checkout_mp" | "success">("form")
  const [clientName, setClientName] = useState("")
  const [clientEmail, setClientEmail] = useState("")
  const [clientPhone, setClientPhone] = useState("")
  const [sizeNotes, setSizeNotes] = useState("")
  const [depositPct, setDepositPct] = useState<number>(50)
  const [loading, setLoading] = useState(false)
  const [mpPreference, setMpPreference] = useState<any>(null)
  const [reservationResult, setReservationResult] = useState<any>(null)
  const [paymentMethod, setPaymentMethod] = useState<"card" | "wallet" | "transfer">("card")

  const totalPrice = project.publicPrice
  const depositAmount = Math.round((totalPrice * (depositPct / 100)) * 100) / 100
  const balanceDue = Math.round((totalPrice - depositAmount) * 100) / 100

  const handleStartCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientName.trim() || !clientEmail.trim() || !clientPhone.trim()) {
      alert("Por favor completa tu nombre, email y teléfono para registrar la reserva.")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/mercadopago/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          clientName,
          clientEmail,
          clientPhone,
          sizeOrNotes: sizeNotes,
          depositPct
        })
      })

      const data = await res.json()
      if (data.success) {
        setMpPreference(data.preference)
        setStep("checkout_mp")
      } else {
        alert(data.error || "No se pudo iniciar la reserva.")
      }
    } catch (err) {
      console.error(err)
      alert("Ocurrió un error al conectar con MercadoPago.")
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmMPPayment = async () => {
    setLoading(true)
    try {
      const mpPaymentId = `MP-PAY-${Math.floor(100000000 + Math.random() * 900000000)}`
      
      const res = await createCatalogReservation({
        projectId: project.id,
        clientName,
        clientEmail,
        clientPhone,
        sizeOrNotes: sizeNotes,
        depositAmount,
        totalPrice,
        mpPaymentId
      })

      if (res.success) {
        setReservationResult(res)
        setStep("success")
      }
    } catch (err: any) {
      alert("Error al confirmar reserva: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl relative">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all z-10"
        >
          <X className="h-4 w-4" />
        </button>

        {step === "form" && (
          <form onSubmit={handleStartCheckout} className="p-6 space-y-6">
            {/* Header del modal */}
            <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              {project.publicImageUrl ? (
                <img
                  src={project.publicImageUrl}
                  alt={project.name}
                  className="h-16 w-16 object-cover rounded-xl border border-slate-200 dark:border-slate-800 shrink-0"
                />
              ) : (
                <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <ShoppingBag className="h-8 w-8" />
                </div>
              )}
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  Reserva Online con Seña
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1 line-clamp-1">
                  {project.name}
                </h3>
                <span className="text-xs text-slate-500">
                  Reserva abonando el 50% online a través de MercadoPago
                </span>
              </div>
            </div>

            {/* Desglose de Precios */}
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Precio Total de la Prenda:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Porcentaje de Seña:</span>
                <span className="font-semibold text-primary">50% Inicial</span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">Seña a Abonar Ahora</span>
                  <span className="text-[11px] text-slate-400">Saldo restante a la entrega: ${balanceDue.toFixed(2)}</span>
                </div>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">${depositAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Formulario Datos del Cliente */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Datos de la Reserva & Medidas
              </h4>

              <div className="space-y-3">
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Nombre completo"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="Correo electrónico"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>

                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="tel"
                      required
                      placeholder="Teléfono / WhatsApp"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>

                <div className="relative">
                  <Ruler className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Talle preferido (S, M, L, XL) o medidas personalizadas"
                    value={sizeNotes}
                    onChange={(e) => setSizeNotes(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
            </div>

            {/* Botón Acción Checkout */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Generando Checkout de Pago...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  Pagar Seña (${depositAmount.toFixed(2)}) con MercadoPago
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <Lock className="h-3.5 w-3.5 text-emerald-500" /> Pago 100% Protegido e Encriptado por MercadoPago
            </div>
          </form>
        )}

        {step === "checkout_mp" && (
          <div className="p-6 space-y-6">
            <div className="text-center space-y-2">
              <div className="h-12 w-12 rounded-full bg-sky-500/10 text-sky-500 mx-auto flex items-center justify-center">
                <CreditCard className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                MercadoPago Checkout
              </h3>
              <p className="text-xs text-slate-500">
                Selecciona tu medio de pago para abonar la seña de <strong>${depositAmount.toFixed(2)}</strong>
              </p>
            </div>

            {/* Opciones de pago simuladas */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                className={`w-full p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                  paymentMethod === "card"
                    ? "border-sky-500 bg-sky-500/5 ring-1 ring-sky-500/30 text-slate-900 dark:text-slate-100 font-bold"
                    : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-base">💳</span>
                  <div className="text-left">
                    <div>Tarjeta de Crédito / Débito</div>
                    <div className="text-[10px] text-slate-400">Visa, Mastercard, Cabal (Hasta 12 cuotas)</div>
                  </div>
                </div>
                {paymentMethod === "card" && <CheckCircle2 className="h-4 w-4 text-sky-500" />}
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("wallet")}
                className={`w-full p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                  paymentMethod === "wallet"
                    ? "border-sky-500 bg-sky-500/5 ring-1 ring-sky-500/30 text-slate-900 dark:text-slate-100 font-bold"
                    : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-base">🟦</span>
                  <div className="text-left">
                    <div>Mercado Pago Wallet</div>
                    <div className="text-[10px] text-slate-400">Dinero disponible en cuenta de MercadoPago</div>
                  </div>
                </div>
                {paymentMethod === "wallet" && <CheckCircle2 className="h-4 w-4 text-sky-500" />}
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("transfer")}
                className={`w-full p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                  paymentMethod === "transfer"
                    ? "border-sky-500 bg-sky-500/5 ring-1 ring-sky-500/30 text-slate-900 dark:text-slate-100 font-bold"
                    : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-base">🏦</span>
                  <div className="text-left">
                    <div>Transferencia Débito Inmediato</div>
                    <div className="text-[10px] text-slate-400">CBU / CVU / QR bancario instantáneo</div>
                  </div>
                </div>
                {paymentMethod === "transfer" && <CheckCircle2 className="h-4 w-4 text-sky-500" />}
              </button>
            </div>

            {/* Simulación MercadoPago sandbox */}
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 space-y-1">
              <div className="font-semibold text-slate-700 dark:text-slate-300">Entorno Sandbox MercadoPago:</div>
              <div>ID Preferencia: <span className="font-mono text-primary">{mpPreference?.id}</span></div>
              <div>Importe Seña: <span className="font-bold text-emerald-600">${depositAmount.toFixed(2)}</span></div>
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={handleConfirmMPPayment}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-sky-600 to-blue-700 text-white font-bold text-xs shadow-lg shadow-sky-500/25 hover:bg-sky-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" /> Procesando pago en MercadoPago...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" /> Aprobar y Confirmar Pago de Seña
                </>
              )}
            </button>
          </div>
        )}

        {step === "success" && reservationResult && (
          <div className="p-8 text-center space-y-6">
            <div className="h-16 w-16 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 animate-bounce" />
            </div>

            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 uppercase tracking-wider">
                ¡Seña Pagada y Reserva Confirmada!
              </span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">
                ¡Gracias, {reservationResult.clientName}!
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Hemos registrado con éxito tu seña para la confección de <strong>{project.name}</strong>.
              </p>
            </div>

            {/* Ficha Comprobante */}
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-slate-400">N° de Comprobante:</span>
                <span className="font-bold font-mono text-slate-800 dark:text-slate-200">{reservationResult.quoteNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Seña Abonada (MP):</span>
                <span className="font-bold text-emerald-600">${reservationResult.depositPaid.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Saldo Pendiente al Entregar:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">${reservationResult.balanceDue.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full h-11 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs hover:bg-slate-800 dark:hover:bg-white transition-all"
            >
              Cerrar y Volver al Catálogo
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
