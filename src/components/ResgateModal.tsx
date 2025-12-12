'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Gift, CreditCard, Calculator } from 'lucide-react'
import toast from 'react-hot-toast'

const resgateSchema = z.object({
  item: z.string().min(1, 'Item é obrigatório'),
  pts_usados: z.number().min(1, 'Pontos devem ser maior que 0'),
  valor_brl: z.number().min(0.01, 'Valor deve ser maior que 0'),
})

type ResgateForm = z.infer<typeof resgateSchema>

interface ResgateModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: ResgateForm & { custo_efetivo: number }) => void
  mode: 'add' | 'simulate'
  currentPoints?: number
  dailyAverage?: number
}

const inventory = [
  { name: 'R$5 Gift Card', pts: 525, brl: 5 },
  { name: 'R$10 Gift Card', pts: 1050, brl: 10 },
  { name: 'R$25 Xbox Gift Card', pts: 2625, brl: 25 },
  { name: 'R$50 Amazon Gift Card', pts: 5250, brl: 50 },
]

export default function ResgateModal({ isOpen, onClose, onSave, mode, currentPoints = 0, dailyAverage = 0 }: ResgateModalProps) {
  const [selectedItem, setSelectedItem] = useState('')

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ResgateForm>({
    resolver: zodResolver(resgateSchema),
  })

  const watchedPts = watch('pts_usados') || 0
  const watchedBrl = watch('valor_brl') || 0
  const custoEfetivo = watchedBrl > 0 ? Math.round(watchedPts / watchedBrl) : 0

  const onSubmit = (data: ResgateForm) => {
    if (mode === 'add') {
      onSave({ ...data, custo_efetivo: custoEfetivo })
      onClose()
    } else {
      toast.success(`Simulação: ${custoEfetivo} pts por R$1`)
      onClose()
    }
  }

  const selectItem = (item: typeof inventory[0]) => {
    setSelectedItem(item.name)
    setValue('item', item.name)
    setValue('pts_usados', item.pts)
    setValue('valor_brl', item.brl)
  }

  if (!isOpen) return null

  return (
    <div className="xbox-modal-overlay" onClick={() => onClose()}>
      <div className="xbox-modal p-6" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-[var(--xbox-green)]/10 rounded">
              {mode === 'add' ? <CreditCard className="h-5 w-5 text-[var(--xbox-green)]" /> : <Gift className="h-5 w-5 text-[var(--xbox-green)]" />}
            </div>
            {mode === 'add' ? 'Adicionar Resgate' : 'Simular Resgate'}
          </h2>
          <button
            onClick={() => onClose()}
            className="p-2 hover:bg-[var(--bg-tertiary)] rounded transition-colors text-[var(--text-secondary)] hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Inventory Selection (Simulate mode only) */}
        {mode === 'simulate' && (
          <div className="mb-6">
            <label className="xbox-label mb-3 block">Inventory BRL</label>
            <div className="space-y-2">
              {inventory.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => selectItem(item)}
                  className={`w-full p-4 rounded text-left transition-all border ${selectedItem === item.name
                    ? 'border-[var(--xbox-green)] bg-[var(--xbox-green)]/10'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-tertiary)] hover:border-[var(--xbox-green)]/50'
                    }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-white">{item.name}</span>
                    <span className="text-sm font-bold text-[var(--xbox-green)]">{item.pts.toLocaleString()} pts</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Item */}
          <div>
            <label className="xbox-label">Item</label>
            <input
              {...register('item')}
              className="xbox-input"
              placeholder="Ex: R$5 Gift Card"
            />
            {errors.item && <p className="text-[var(--error)] text-xs mt-1">{errors.item.message}</p>}
          </div>

          {/* Pontos Usados */}
          <div>
            <label className="xbox-label">Pontos Usados</label>
            <input
              type="number"
              {...register('pts_usados', { valueAsNumber: true })}
              className="xbox-input"
              min="1"
            />
            {errors.pts_usados && <p className="text-[var(--error)] text-xs mt-1">{errors.pts_usados.message}</p>}
          </div>

          {/* Valor BRL */}
          <div>
            <label className="xbox-label">Valor BRL</label>
            <input
              type="number"
              step="0.01"
              {...register('valor_brl', { valueAsNumber: true })}
              className="xbox-input"
              min="0.01"
            />
            {errors.valor_brl && <p className="text-[var(--error)] text-xs mt-1">{errors.valor_brl.message}</p>}
          </div>

          {/* Custo Efetivo */}
          {watchedPts > 0 && watchedBrl > 0 && (
            <div className="p-4 rounded border border-[var(--xbox-green)]/30 bg-[var(--xbox-green)]/10 space-y-3">
              <div className="flex items-center gap-3">
                <Calculator className="h-5 w-5 text-[var(--xbox-green)]" />
                <div>
                  <p className="xbox-label mb-0">Custo Efetivo</p>
                  <p className="text-lg font-bold text-[var(--xbox-green)]">{custoEfetivo} pts <span className="text-sm font-normal text-[var(--text-secondary)]">por R$1</span></p>
                </div>
              </div>

              {/* Time to Goal Projection */}
              {mode === 'simulate' && dailyAverage > 0 && (
                <div className="pt-3 border-t border-[var(--xbox-green)]/30">
                  {watchedPts <= currentPoints ? (
                    <p className="text-[var(--xbox-green)] font-semibold">✓ Você já tem pontos suficientes!</p>
                  ) : (
                    (() => {
                      const needed = watchedPts - currentPoints
                      const days = Math.ceil(needed / dailyAverage)
                      const date = new Date()
                      date.setDate(date.getDate() + days)
                      return (
                        <>
                          <p className="text-sm text-white mb-1">
                            Faltam <span className="font-bold">{needed.toLocaleString()} pts</span>
                          </p>
                          <p className="text-sm text-[var(--text-secondary)]">
                            Com sua média de {dailyAverage} pts/dia, você alcançará em:
                          </p>
                          <p className="text-lg font-bold text-white mt-1">
                            {days} dias <span className="text-sm font-normal text-[var(--text-muted)]">({date.toLocaleDateString('pt-BR')})</span>
                          </p>
                        </>
                      )
                    })()
                  )}
                </div>
              )}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="xbox-btn xbox-btn-primary flex-1"
            >
              {mode === 'add' ? 'Adicionar' : 'Simular'}
            </button>
            <button
              type="button"
              onClick={() => onClose()}
              className="xbox-btn xbox-btn-outline"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}