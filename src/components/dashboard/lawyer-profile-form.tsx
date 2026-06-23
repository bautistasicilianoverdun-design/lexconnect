'use client'

import { useState, useTransition } from 'react'
import { Save, CheckCircle2, Star } from 'lucide-react'
import { saveLawyerProfile } from '@/app/dashboard/perfil/lawyer-actions'

const PROVINCES = [
  { id: 1, name: 'Buenos Aires' },
  { id: 2, name: 'CABA' },
  { id: 3, name: 'Catamarca' },
  { id: 4, name: 'Chaco' },
  { id: 5, name: 'Chubut' },
  { id: 6, name: 'Córdoba' },
  { id: 7, name: 'Corrientes' },
  { id: 8, name: 'Entre Ríos' },
  { id: 9, name: 'Formosa' },
  { id: 10, name: 'Jujuy' },
  { id: 11, name: 'La Pampa' },
  { id: 12, name: 'La Rioja' },
  { id: 13, name: 'Mendoza' },
  { id: 14, name: 'Misiones' },
  { id: 15, name: 'Neuquén' },
  { id: 16, name: 'Río Negro' },
  { id: 17, name: 'Salta' },
  { id: 18, name: 'San Juan' },
  { id: 19, name: 'San Luis' },
  { id: 20, name: 'Santa Cruz' },
  { id: 21, name: 'Santa Fe' },
  { id: 22, name: 'Santiago del Estero' },
  { id: 23, name: 'Tierra del Fuego' },
  { id: 24, name: 'Tucumán' },
]

const RESPONSE_TIMES = [
  { value: 1, label: '1 hora' },
  { value: 2, label: '2 horas' },
  { value: 4, label: '4 horas' },
  { value: 8, label: '8 horas' },
  { value: 12, label: '12 horas' },
  { value: 24, label: '24 horas' },
  { value: 48, label: '48 horas' },
]

export type LawyerProfileData = {
  license_number: string | null
  license_province_id: number | null
  university: string | null
  graduation_year: number | null
  response_time_hours: number | null
  accepts_new_clients: boolean | null
  specialties: Array<{ category_id: string; is_primary: boolean; years_experience: number | null }>
}

export type Category = { id: string; name: string }

export default function LawyerProfileForm({
  lawyerProfile,
  categories,
}: {
  lawyerProfile: LawyerProfileData | null
  categories: Category[]
}) {
  const [form, setForm] = useState({
    license_number: lawyerProfile?.license_number ?? '',
    license_province_id: lawyerProfile?.license_province_id ?? 2,
    university: lawyerProfile?.university ?? '',
    graduation_year: lawyerProfile?.graduation_year?.toString() ?? '',
    response_time_hours: lawyerProfile?.response_time_hours ?? 24,
    accepts_new_clients: lawyerProfile?.accepts_new_clients ?? true,
  })

  const [selectedSpecialties, setSelectedSpecialties] = useState<
    Map<string, { is_primary: boolean; years_experience: string }>
  >(() => {
    const map = new Map<string, { is_primary: boolean; years_experience: string }>()
    for (const s of lawyerProfile?.specialties ?? []) {
      map.set(s.category_id, {
        is_primary: s.is_primary,
        years_experience: s.years_experience?.toString() ?? '',
      })
    }
    return map
  })

  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  function toggleSpecialty(categoryId: string) {
    setSelectedSpecialties((prev) => {
      const next = new Map(prev)
      if (next.has(categoryId)) {
        const wasPrimary = next.get(categoryId)!.is_primary
        next.delete(categoryId)
        if (wasPrimary && next.size > 0) {
          const firstKey = next.keys().next().value as string
          next.set(firstKey, { ...next.get(firstKey)!, is_primary: true })
        }
      } else {
        next.set(categoryId, { is_primary: next.size === 0, years_experience: '' })
      }
      return next
    })
    setSaved(false)
    setError('')
  }

  function setPrimary(categoryId: string) {
    setSelectedSpecialties((prev) => {
      const next = new Map(prev)
      for (const [id, val] of next) {
        next.set(id, { ...val, is_primary: id === categoryId })
      }
      return next
    })
    setSaved(false)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaved(false)

    startTransition(async () => {
      const result = await saveLawyerProfile({
        license_number: form.license_number,
        license_province_id: form.license_province_id || null,
        university: form.university,
        graduation_year: form.graduation_year ? Number(form.graduation_year) : null,
        response_time_hours: form.response_time_hours || null,
        accepts_new_clients: form.accepts_new_clients,
        specialties: Array.from(selectedSpecialties.entries()).map(([category_id, val]) => ({
          category_id,
          is_primary: val.is_primary,
          years_experience: val.years_experience ? Number(val.years_experience) : null,
        })),
      })

      if (result.success) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } else {
        setError('No se pudieron guardar los cambios. Intentá de nuevo.')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Perfil profesional</h2>
        <p className="text-sm text-slate-500 mt-0.5">Esta información aparece en tu perfil público para los clientes</p>
      </div>

      {/* Datos de matrícula */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
        <h3 className="text-sm font-semibold text-slate-700">Datos de matrícula</h3>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Número de matrícula</label>
            <input
              value={form.license_number}
              onChange={(e) => setForm((f) => ({ ...f, license_number: e.target.value }))}
              placeholder="Ej: 12345"
              className="w-full h-10 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none px-3 text-sm text-slate-900 placeholder:text-slate-400 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Provincia de matrícula</label>
            <select
              value={form.license_province_id}
              onChange={(e) => setForm((f) => ({ ...f, license_province_id: Number(e.target.value) }))}
              className="w-full h-10 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none px-3 text-sm text-slate-900 bg-white transition-all"
            >
              {PROVINCES.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Universidad</label>
            <input
              value={form.university}
              onChange={(e) => setForm((f) => ({ ...f, university: e.target.value }))}
              placeholder="Ej: UBA, UNC, UNR..."
              className="w-full h-10 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none px-3 text-sm text-slate-900 placeholder:text-slate-400 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Año de graduación</label>
            <input
              type="number"
              value={form.graduation_year}
              onChange={(e) => setForm((f) => ({ ...f, graduation_year: e.target.value }))}
              placeholder="Ej: 2010"
              min={1950}
              max={new Date().getFullYear()}
              className="w-full h-10 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none px-3 text-sm text-slate-900 placeholder:text-slate-400 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Especialidades */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-700">Especialidades</h3>
          <p className="text-xs text-slate-400 mt-0.5">Seleccioná las áreas en las que trabajás. Marcá la principal con ★</p>
        </div>

        {categories.length === 0 ? (
          <p className="text-sm text-slate-400">No hay categorías disponibles.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-2">
            {categories.map((cat) => {
              const selected = selectedSpecialties.get(cat.id)
              const isSelected = !!selected
              const isPrimary = selected?.is_primary ?? false

              return (
                <div
                  key={cat.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all select-none ${
                    isSelected
                      ? 'border-blue-200 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                  onClick={() => toggleSpecialty(cat.id)}
                >
                  <div
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                      isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                    }`}
                  >
                    {isSelected && (
                      <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span className={`flex-1 text-sm ${isSelected ? 'font-medium text-slate-900' : 'text-slate-600'}`}>
                    {cat.name}
                  </span>
                  {isSelected && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setPrimary(cat.id) }}
                      title="Marcar como especialidad principal"
                      className={`shrink-0 transition-colors ${isPrimary ? 'text-amber-400' : 'text-slate-300 hover:text-amber-300'}`}
                    >
                      <Star className={`h-4 w-4 ${isPrimary ? 'fill-current' : ''}`} />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {selectedSpecialties.size > 0 && (
          <p className="text-xs text-slate-400">
            {selectedSpecialties.size} especialidad{selectedSpecialties.size !== 1 ? 'es' : ''} seleccionada{selectedSpecialties.size !== 1 ? 's' : ''}.
            {' '}Tocá ★ para marcar la principal.
          </p>
        )}
      </div>

      {/* Disponibilidad */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
        <h3 className="text-sm font-semibold text-slate-700">Disponibilidad</h3>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Tiempo de respuesta estimado</label>
          <select
            value={form.response_time_hours ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, response_time_hours: Number(e.target.value) }))}
            className="w-full sm:w-64 h-10 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none px-3 text-sm text-slate-900 bg-white transition-all"
          >
            <option value="">Sin especificar</option>
            {RESPONSE_TIMES.map((rt) => (
              <option key={rt.value} value={rt.value}>{rt.label}</option>
            ))}
          </select>
          <p className="text-xs text-slate-400 mt-1">Cuánto tardás en responder consultas de nuevos clientes</p>
        </div>

        <div
          className="flex items-center justify-between p-4 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors"
          onClick={() => setForm((f) => ({ ...f, accepts_new_clients: !f.accepts_new_clients }))}
        >
          <div>
            <p className="text-sm font-medium text-slate-900">Acepto nuevos clientes</p>
            <p className="text-xs text-slate-400 mt-0.5">Aparecerás disponible para consultas en el directorio</p>
          </div>
          <div
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
              form.accepts_new_clients ? 'bg-blue-600' : 'bg-slate-200'
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                form.accepts_new_clients ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        {saved && (
          <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
            <CheckCircle2 className="h-4 w-4" />
            Cambios guardados
          </div>
        )}
        <div className="ml-auto">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            {isPending ? (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75" />
              </svg>
            ) : (
              <Save className="h-4 w-4" />
            )}
            Guardar cambios
          </button>
        </div>
      </div>
    </form>
  )
}
