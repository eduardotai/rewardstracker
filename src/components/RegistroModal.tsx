'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Plus, Monitor, Smartphone, Brain, Gamepad2, Target } from 'lucide-react'
import toast from 'react-hot-toast'

const GUEST_DATA_KEY = 'rewards_tracker_guest_data'

const registroSchema = z.object({
  data: z.string().min(1, 'Data é obrigatória'),
  atividade: z.string().min(1, 'Selecione uma atividade'),
  pc_busca: z.number().min(0).max(1000, 'Valor muito alto'), // Practical cap
  mobile_busca: z.number().min(0).max(1000),
  quiz: z.number().min(0),
  xbox: z.number().min(0),
  meta_batida: z.boolean(),
  notas: z.string().optional(),
})

type RegistroForm = z.infer<typeof registroSchema>

interface RegistroModalProps {
  isOpen: boolean
  onClose: () => void
  onSave?: (record: any) => void
  isGuest?: boolean
  initialData?: Partial<RegistroForm> // Allow pre-filling data
}

export default function RegistroModal({ isOpen, onClose, onSave, isGuest = false, initialData }: RegistroModalProps) {
  const [metaDiaria, setMetaDiaria] = useState(150)

  // Merge default values with initialData if provided
  const defaults = {
    data: new Date().toISOString().split('T')[0],
    pc_busca: 0,
    mobile_busca: 0,
    quiz: 0,
    xbox: 0,
    meta_batida: false,
    atividade: '', // Default empty
    ...initialData // Override with passed data
  }

  const { register, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm<RegistroForm>({
    resolver: zodResolver(registroSchema),
    defaultValues: defaults
  })

  // Reset form when initialData changes or modal opens
  useEffect(() => {
    if (isOpen && initialData) {
      reset({
        ...defaults,
        ...initialData
      })
    }
  }, [isOpen, initialData, reset])

  const watchedValues = watch()

  const calculateTotal = () => {
    const pc = watchedValues.pc_busca || 0
    const mobile = watchedValues.mobile_busca || 0
    const quiz = watchedValues.quiz || 0
    const xbox = watchedValues.xbox || 0
    return pc + mobile + quiz + xbox
  }

  const totalPts = calculateTotal()
  const metaAlcancada = totalPts >= metaDiaria

  // Auto-update meta checkbox
  useEffect(() => {
    setValue('meta_batida', metaAlcancada)
  }, [metaAlcancada, setValue])

  // Save to localStorage for guest mode
  const saveGuestRecord = (data: RegistroForm) => {
    const savedData = localStorage.getItem(GUEST_DATA_KEY)
    const guestData = savedData ? JSON.parse(savedData) : { registros: [], profile: { display_name: 'Visitante', tier: 'Sem', meta_mensal: 12000 } }

    const newRecord = {
      id: Date.now(),
      data: data.data,
      atividade: data.atividade,
      pc_busca: data.pc_busca,
      mobile_busca: data.mobile_busca,
      quiz: data.quiz,
      xbox: data.xbox,
      total_pts: totalPts,
      meta_batida: data.meta_batida,
      notas: data.notas || '',
      created_at: new Date().toISOString(),
    }

    guestData.registros.unshift(newRecord)
    localStorage.setItem(GUEST_DATA_KEY, JSON.stringify(guestData))
    return newRecord
  }

  const onSubmit = async (data: RegistroForm) => {
    try {
      // Guest mode: save to localStorage
      if (isGuest) {
        const newRecord = saveGuestRecord(data)
        toast.success('Registro salvo localmente!')
        reset()
        if (onSave) onSave(newRecord)
        onClose()
        return
      }

      // Logged in user: save to Supabase
      const { supabase } = await import('@/lib/supabase')
      const { insertDailyRecord } = await import('@/hooks/useData')

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Você precisa estar logado para registrar atividades.')
        return
      }

      const { data: insertedData, error } = await insertDailyRecord(user.id, {
        data: data.data,
        atividade: data.atividade,
        pc_busca: data.pc_busca,
        mobile_busca: data.mobile_busca,
        quiz: data.quiz,
        xbox: data.xbox,
        total_pts: totalPts,
        meta_batida: data.meta_batida,
        notas: data.notas || '',
      })

      if (error) {
        console.error('Supabase error:', error)
        toast.error(`Erro: ${error.message}`)
        return
      }
      toast.success('Registro salvo com sucesso!')
      reset()
      if (onSave && insertedData) onSave(insertedData)
      onClose()
    } catch (err) {
      console.error('Error saving registro:', err)
      toast.error('Erro ao salvar registro. Verifique a conexão.')
    }
  }

  if (!isOpen) return null

  return (
    <div className="xbox-modal-overlay" onClick={onClose}>
      <div className="xbox-modal p-6" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-[var(--xbox-green)]/10 rounded">
              <Plus className="h-5 w-5 text-[var(--xbox-green)]" />
            </div>
            Registro de Pontuação
            {isGuest && <span className="text-xs text-[var(--warning)]">(local)</span>}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--bg-tertiary)] rounded transition-colors text-[var(--text-secondary)] hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Data */}
          <div>
            <label className="xbox-label">Data da Atividade</label>
            <input
              type="date"
              {...register('data')}
              className="xbox-input"
            />
            {errors.data && <p className="text-[var(--error)] text-xs mt-1">{errors.data.message}</p>}
          </div>

          {/* Tipo de Atividade - Visual Cards */}
          <div>
            <label className="xbox-label mb-3">Tipo de Atividade</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'Buscas', icon: Monitor, label: 'Buscas', desc: 'PC & Mobile' },
                { id: 'Quiz', icon: Brain, label: 'Ativ. Web', desc: 'Quiz, News' },
                { id: 'Xbox', icon: Gamepad2, label: 'Xbox/GP', desc: 'App, Console' },
                { id: 'Outros', icon: Plus, label: 'Outros', desc: 'Extras' },
              ].map((type) => {
                const isSelected = watchedValues.atividade === type.id
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setValue('atividade', type.id)}
                    className={`p-3 rounded border text-left transition-all duration-200 group relative overflow-hidden ${isSelected
                      ? 'bg-[var(--xbox-green)]/20 border-[var(--xbox-green)] shadow-[0_0_15px_rgba(16,124,16,0.3)]'
                      : 'bg-[var(--bg-tertiary)] border-[var(--border-subtle)] hover:border-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]'
                      }`}
                  >
                    {/* Glow effect on hover/select */}
                    {isSelected && <div className="absolute inset-0 bg-gradient-to-tr from-[var(--xbox-green)]/10 to-transparent pointer-events-none" />}

                    <div className="flex items-center gap-3 relative z-10">
                      <div className={`p-2 rounded-full ${isSelected ? 'bg-[var(--xbox-green)] text-white' : 'bg-[var(--bg-primary)] text-[var(--text-secondary)] group-hover:text-white'}`}>
                        <type.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className={`font-semibold text-sm ${isSelected ? 'text-white' : 'text-[var(--text-secondary)] group-hover:text-white'}`}>
                          {type.label}
                        </p>
                        <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide">
                          {type.desc}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
            {errors.atividade && <p className="text-[var(--error)] text-xs mt-2 ml-1">{errors.atividade.message}</p>}
          </div>

          {/* Meta Diária Configurável */}
          <div className="bg-[var(--bg-tertiary)] p-4 rounded border border-[var(--border-subtle)]">
            <label className="flex items-center gap-2 xbox-label mb-2">
              <Target className="h-4 w-4 text-[var(--xbox-green)]" />
              Meta Diária (pontos)
            </label>
            <input
              type="number"
              value={metaDiaria}
              onChange={(e) => setMetaDiaria(Number(e.target.value) || 0)}
              className="xbox-input"
              min="1"
              placeholder="150"
            />
            <p className="text-xs text-[var(--text-muted)] mt-1">
              O checkbox será marcado automaticamente quando atingir esta meta
            </p>
          </div>

          {/* Detalhamento de Pontos */}
          <div className="bg-[var(--bg-tertiary)] p-4 rounded border border-[var(--border-subtle)]">
            <h3 className="xbox-label mb-4">Detalhamento de Pontos</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-xs text-[var(--text-secondary)] mb-2">
                  <Monitor className="h-4 w-4" />
                  Busca PC
                  <button
                    type="button"
                    onClick={() => setValue('pc_busca', 90)}
                    className="ml-auto text-[10px] bg-[var(--bg-elevated)] px-1.5 py-0.5 rounded text-[var(--xbox-green)] hover:bg-[var(--xbox-green)] hover:text-white transition-colors"
                  >
                    Max (90)
                  </button>
                </label>
                <input
                  type="number"
                  {...register('pc_busca', { valueAsNumber: true })}
                  className="xbox-input"
                  min="0"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-xs text-[var(--text-secondary)] mb-2">
                  <Smartphone className="h-4 w-4" />
                  Busca Mobile
                  <button
                    type="button"
                    onClick={() => setValue('mobile_busca', 60)}
                    className="ml-auto text-[10px] bg-[var(--bg-elevated)] px-1.5 py-0.5 rounded text-[var(--xbox-green)] hover:bg-[var(--xbox-green)] hover:text-white transition-colors"
                  >
                    Max (60)
                  </button>
                </label>
                <input
                  type="number"
                  {...register('mobile_busca', { valueAsNumber: true })}
                  className="xbox-input"
                  min="0"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-xs text-[var(--text-secondary)] mb-2" title="Inclui Conjunto Diário, Notícias Start, etc.">
                  <Brain className="h-4 w-4" />
                  Ativ. Web
                </label>
                <input
                  type="number"
                  {...register('quiz', { valueAsNumber: true })}
                  className="xbox-input"
                  min="0"
                  placeholder="Quiz/News"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-xs text-[var(--text-secondary)] mb-2" title="Inclui Jewel, PC Game, Console, Game Pass Quests">
                  <Gamepad2 className="h-4 w-4" />
                  Xbox & GP
                </label>
                <input
                  type="number"
                  {...register('xbox', { valueAsNumber: true })}
                  className="xbox-input"
                  min="0"
                  placeholder="App/Quests"
                />
              </div>
            </div>
          </div>

          {/* Meta Checkbox */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              {...register('meta_batida')}
              className="xbox-checkbox"
              checked={watchedValues.meta_batida}
              onChange={(e) => setValue('meta_batida', e.target.checked)}
            />
            <label className="text-sm text-[var(--text-secondary)]">
              Meta diária alcançada ({metaDiaria}+ pontos)
            </label>
          </div>

          {/* Notas */}
          <div>
            <label className="xbox-label">Notas (opcional)</label>
            <textarea
              {...register('notas')}
              className="xbox-input resize-none"
              rows={3}
              placeholder="Adicione observações sobre sua atividade..."
            />
          </div>

          {/* Total de Pontos */}
          <div className={`relative p-6 rounded-lg border transition-all duration-300 overflow-hidden ${metaAlcancada
              ? 'bg-gradient-to-br from-[var(--xbox-green)]/20 to-[var(--bg-secondary)] border-[var(--xbox-green)] shadow-[0_0_20px_rgba(16,124,16,0.2)]'
              : 'bg-[var(--bg-tertiary)] border-[var(--border-subtle)]'
            }`}>
            <div className="flex justify-between items-center relative z-10">
              <div>
                <span className="xbox-label mb-1">Total de Pontos</span>
                <div className={`text-sm flex items-center gap-1.5 ${metaAlcancada ? 'text-[var(--xbox-green)]' : 'text-[var(--text-muted)]'}`}>
                  <Target className="h-3 w-3" />
                  Meta: {metaDiaria}
                </div>
              </div>
              <div className="text-right">
                <span className={`block text-5xl font-bold tracking-tighter transition-all ${metaAlcancada
                    ? 'text-[var(--xbox-green)] drop-shadow-[0_0_10px_rgba(16,124,16,0.5)] scale-110'
                    : 'text-white'
                  }`}>
                  {totalPts}
                </span>
                {metaAlcancada && (
                  <span className="text-xs font-bold text-[var(--xbox-green)] uppercase tracking-widest animate-pulse">
                    Meta Batida!
                  </span>
                )}
              </div>
            </div>

            {/* Dynamic Background Effect */}
            {metaAlcancada && (
              <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-[var(--xbox-green)]/20 blur-3xl rounded-full pointer-events-none" />
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="xbox-btn xbox-btn-primary flex-1 py-4 text-base shadow-lg shadow-black/20"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Salvando...
                </>
              ) : (
                'Confirmar e Salvar'
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="xbox-btn xbox-btn-outline px-6"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}