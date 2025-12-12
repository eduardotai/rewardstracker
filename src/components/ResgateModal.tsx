'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
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
  mode: 'add' | 'simulate'
}

const inventory = [
  { name: 'R$5 Gift Card', pts: 525, brl: 5 },
  { name: 'R$10 Gift Card', pts: 1050, brl: 10 },
  { name: 'R$25 Xbox Gift Card', pts: 2625, brl: 25 },
  { name: 'R$50 Amazon Gift Card', pts: 5250, brl: 50 },
]

export default function ResgateModal({ isOpen, onClose, mode }: ResgateModalProps) {
  const [selectedItem, setSelectedItem] = useState('')

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ResgateForm>({
    resolver: zodResolver(resgateSchema),
  })

  const watchedPts = watch('pts_usados') || 0
  const watchedBrl = watch('valor_brl') || 0
  const custoEfetivo = watchedBrl > 0 ? Math.round(watchedPts / watchedBrl) : 0

  const onSubmit = async (data: ResgateForm) => {
    try {
      if (mode === 'add') {
        const { supabase } = await import('@/lib/supabase')
        
        const { error } = await supabase
          .from('resgates')
          .insert([
            {
              data: new Date().toISOString().split('T')[0],
              item: data.item,
              pts_usados: data.pts_usados,
              valor_brl: data.valor_brl,
              custo_efetivo: custoEfetivo,
            }
          ])
        
        if (error) throw error
        toast.success('Resgate adicionado com sucesso!')
      } else {
        // Simular apenas mostra o cálculo
        toast.success(`Simulação: ${custoEfetivo} pts por R$1`)
      }
      onClose()
    } catch (error) {
      toast.error('Erro ao processar resgate')
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'add' ? '💳 Adicionar Resgate' : '🎁 Simular Resgate'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {mode === 'simulate' && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">🛍️ Inventory BRL</h3>
            <div className="space-y-2">
              {inventory.map((item) => (
                <button
                  key={item.name}
                  onClick={() => selectItem(item)}
                  className={`w-full p-3 border rounded-lg text-left hover:shadow-md transition-all ${
                    selectedItem === item.name ? 'border-xbox-green bg-xbox-light' : 'border-gray-300 hover:border-xbox-green'
                  }`}
                >
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900">{item.name}</span>
                    <span className="text-sm font-semibold text-xbox-green">{item.pts} pts</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Item</label>
            <input
              {...register('item')}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-xbox-green focus:border-transparent transition-colors"
              placeholder="Ex: R$5 Gift Card"
            />
            {errors.item && <p className="text-xbox-red text-sm mt-1">{errors.item.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Pontos Usados</label>
            <input
              type="number"
              {...register('pts_usados', { valueAsNumber: true })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-xbox-green focus:border-transparent transition-colors"
              min="1"
            />
            {errors.pts_usados && <p className="text-xbox-red text-sm mt-1">{errors.pts_usados.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Valor BRL</label>
            <input
              type="number"
              step="0.01"
              {...register('valor_brl', { valueAsNumber: true })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-xbox-green focus:border-transparent transition-colors"
              min="0.01"
            />
            {errors.valor_brl && <p className="text-xbox-red text-sm mt-1">{errors.valor_brl.message}</p>}
          </div>

          {watchedPts > 0 && watchedBrl > 0 && (
            <div className="bg-xbox-light border-l-4 border-xbox-green p-4 rounded-lg">
              <p className="text-sm text-gray-900">
                <strong>Custo Efetivo:</strong> <span className="text-xbox-green font-semibold">{custoEfetivo} pts</span> por R$1
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 bg-xbox-green text-white py-3 rounded-lg hover:bg-opacity-90 transition-all font-semibold"
            >
              {mode === 'add' ? 'Adicionar' : 'Simular'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-all font-semibold"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}