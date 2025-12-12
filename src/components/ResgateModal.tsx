'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'

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

  const onSubmit = (data: ResgateForm) => {
    if (mode === 'add') {
      console.log('Adicionar resgate:', { ...data, data: new Date().toISOString().split('T')[0], custo_efetivo: custoEfetivo })
      // TODO: Save to Supabase
    } else {
      console.log('Simular resgate:', { ...data, custo_efetivo: custoEfetivo })
    }
    onClose()
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
      <div className="bg-white p-6 rounded-lg w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {mode === 'add' ? 'Adicionar Resgate' : 'Simular Resgate'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {mode === 'simulate' && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Inventory BRL</h3>
            <div className="space-y-2">
              {inventory.map((item) => (
                <button
                  key={item.name}
                  onClick={() => selectItem(item)}
                  className={`w-full p-3 border rounded-md text-left hover:bg-gray-50 ${
                    selectedItem === item.name ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                  }`}
                >
                  <div className="flex justify-between">
                    <span>{item.name}</span>
                    <span className="text-sm text-gray-600">{item.pts} pts</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Item</label>
            <input
              {...register('item')}
              className="w-full p-2 border rounded-md"
              placeholder="Ex: R$5 Gift Card"
            />
            {errors.item && <p className="text-red-500 text-sm">{errors.item.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Pontos Usados</label>
            <input
              type="number"
              {...register('pts_usados', { valueAsNumber: true })}
              className="w-full p-2 border rounded-md"
              min="1"
            />
            {errors.pts_usados && <p className="text-red-500 text-sm">{errors.pts_usados.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Valor BRL</label>
            <input
              type="number"
              step="0.01"
              {...register('valor_brl', { valueAsNumber: true })}
              className="w-full p-2 border rounded-md"
              min="0.01"
            />
            {errors.valor_brl && <p className="text-red-500 text-sm">{errors.valor_brl.message}</p>}
          </div>

          {watchedPts > 0 && watchedBrl > 0 && (
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm">
                <strong>Custo Efetivo:</strong> {custoEfetivo} pts por R$1
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
            >
              {mode === 'add' ? 'Adicionar' : 'Simular'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}