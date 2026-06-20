'use client'
import { useState } from 'react'
import {
  User, MapPin, Phone, Mail, Save, Camera,
  CheckCircle2, AlertCircle, Star, FileText, MessageSquare,
} from 'lucide-react'

const PROVINCES = [
  'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba',
  'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja',
  'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan',
  'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego', 'Tucumán',
]

export default function PerfilPage() {
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    first_name: 'María',
    last_name: 'González',
    email: 'maria.gonzalez@gmail.com',
    phone: '+54 9 11 4567 8901',
    province: 'Buenos Aires',
    city: 'CABA',
    bio: 'Cliente habitual de servicios legales. Busco profesionales confiables para distintas necesidades.',
  })

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
    setSaved(false)
  }

  function save(e: React.FormEvent) {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mi perfil</h1>
        <p className="text-sm text-slate-500 mt-0.5">Actualizá tu información personal</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Casos publicados', value: '2', icon: FileText },
          { label: 'Propuestas recibidas', value: '10', icon: MessageSquare },
          { label: 'Valoración promedio', value: '4.8', icon: Star },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-200 p-4 text-center">
            <Icon className="h-5 w-5 mx-auto text-slate-400 mb-1.5" />
            <p className="text-xl font-bold text-slate-900">{value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Verification notice */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl p-4">
        <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-900">Verificá tu identidad</p>
          <p className="text-xs text-amber-700 mt-0.5">
            Perfiles verificados generan más confianza. Podés verificar con tu DNI desde la sección de configuración.
          </p>
        </div>
      </div>

      <form onSubmit={save} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {/* Avatar */}
        <div className="p-6 border-b border-slate-100 flex items-center gap-5">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-2xl">
              MG
            </div>
            <button
              type="button"
              className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-white border-2 border-slate-200 text-slate-500 hover:text-blue-600 transition-colors"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
          </div>
          <div>
            <p className="font-semibold text-slate-900">{form.first_name} {form.last_name}</p>
            <p className="text-sm text-slate-400 mt-0.5">Cliente · Plan Gratuito</p>
            <div className="flex items-center gap-1 mt-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-slate-300" />
              <span className="text-xs text-slate-400">Identidad no verificada</span>
            </div>
          </div>
        </div>

        {/* Form fields */}
        <div className="p-6 space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nombre</label>
              <div className="flex items-center gap-2 h-10 rounded-xl border border-slate-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 px-3 transition-all">
                <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <input
                  value={form.first_name}
                  onChange={(e) => update('first_name', e.target.value)}
                  className="flex-1 text-sm outline-none text-slate-900"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Apellido</label>
              <div className="flex items-center gap-2 h-10 rounded-xl border border-slate-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 px-3 transition-all">
                <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <input
                  value={form.last_name}
                  onChange={(e) => update('last_name', e.target.value)}
                  className="flex-1 text-sm outline-none text-slate-900"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email</label>
            <div className="flex items-center gap-2 h-10 rounded-xl border border-slate-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 px-3 transition-all">
              <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <input
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                className="flex-1 text-sm outline-none text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Teléfono</label>
            <div className="flex items-center gap-2 h-10 rounded-xl border border-slate-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 px-3 transition-all">
              <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <input
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                className="flex-1 text-sm outline-none text-slate-900"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Provincia</label>
              <div className="flex items-center gap-2 h-10 rounded-xl border border-slate-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 px-3 transition-all">
                <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <select
                  value={form.province}
                  onChange={(e) => update('province', e.target.value)}
                  className="flex-1 text-sm outline-none bg-transparent text-slate-900"
                >
                  {PROVINCES.map((p) => <option key={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Ciudad</label>
              <div className="flex items-center gap-2 h-10 rounded-xl border border-slate-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 px-3 transition-all">
                <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <input
                  value={form.city}
                  onChange={(e) => update('city', e.target.value)}
                  className="flex-1 text-sm outline-none text-slate-900"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Sobre mí (opcional)</label>
            <textarea
              value={form.bio}
              onChange={(e) => update('bio', e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 resize-none transition-all"
              placeholder="Breve descripción para los abogados que quieran contactarte..."
            />
          </div>
        </div>

        <div className="px-6 pb-6 flex items-center justify-between">
          {saved && (
            <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
              <CheckCircle2 className="h-4 w-4" />
              Cambios guardados
            </div>
          )}
          <div className="ml-auto">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              <Save className="h-4 w-4" />
              Guardar cambios
            </button>
          </div>
        </div>
      </form>

      {/* Danger zone */}
      <div className="bg-white rounded-2xl border border-red-100 overflow-hidden">
        <div className="p-5 border-b border-red-100">
          <h3 className="font-semibold text-red-700">Zona peligrosa</h3>
        </div>
        <div className="p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-900">Eliminar cuenta</p>
            <p className="text-xs text-slate-400 mt-0.5">Una vez eliminada tu cuenta, no hay vuelta atrás. Pensalo bien.</p>
          </div>
          <button className="shrink-0 px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-sm font-medium transition-colors">
            Eliminar cuenta
          </button>
        </div>
      </div>
    </div>
  )
}
