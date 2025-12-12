'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import toast from 'react-hot-toast'

const registroSchema = z.object({
  data: z.string(),
  atividade: z.string(),
  pc_busca: z.number().min(0),
  mobile_busca: z.number().min(0),
  quiz: z.number().min(0),
  xbox: z.number().min(0),
  meta_batida: z.boolean(),
  notas: z.string().optional(),
})

type RegistroForm = z.infer<typeof registroSchema>

interface RegistroModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function RegistroModal({ isOpen, onClose }: RegistroModalProps) {
  const [totalPts, setTotalPts] = useState(0)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegistroForm>({
    resolver: zodResolver(registroSchema),
    defaultValues: {
      data: new Date().toISOString().split('T')[0],
      pc_busca: 0,
      mobile_busca: 0,
      quiz: 0,
      xbox: 0,
      meta_batida: false,
    }
  })

  const watchedValues = watch()

  // Simple calculation: PC 5pts, Mobile 5pts, Quiz 10pts, Xbox 10pts per activity
  const calculateTotal = () => {
    const pc = watchedValues.pc_busca || 0
    const mobile = watchedValues.mobile_busca || 0
    const quiz = watchedValues.quiz || 0
    const xbox = watchedValues.xbox || 0
    return (pc + mobile) * 5 + quiz * 10 + xbox * 10
  }

  const onSubmit = (data: RegistroForm) => {
    if (mode === 'add') {
      console.log('Adicionar resgate:', { ...data, data: new Date().toISOString().split('T')[0], custo_efetivo: custoEfetivo })
      toast.success('Resgate adicionado com sucesso!')
      // TODO: Save to Supabase
    } else {
      console.log('Simular resgate:', { ...data, custo_efetivo: custoEfetivo })
      toast.success('Simulação concluída!')
    }
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Registro Diário</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Data</label>
            <input
              type="date"
              {...register('data')}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Atividade</label>
            <select {...register('atividade')} className="w-full p-2 border rounded-md">
              <option value="">Selecione...</option>
              <option value="Buscas">Buscas</option>
              <option value="Quiz">Quiz</option>
              <option value="Xbox">Xbox</option>
              <option value="Outros">Outros</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">PC Busca</label>
              <input
                type="number"
                {...register('pc_busca', { valueAsNumber: true })}
                className="w-full p-2 border rounded-md"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mobile Busca</label>
              <input
                type="number"
                {...register('mobile_busca', { valueAsNumber: true })}
                className="w-full p-2 border rounded-md"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Quiz</label>
              <input
                type="number"
                {...register('quiz', { valueAsNumber: true })}
                className="w-full p-2 border rounded-md"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Xbox</label>
              <input
                type="number"
                {...register('xbox', { valueAsNumber: true })}
                className="w-full p-2 border rounded-md"
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                {...register('meta_batida')}
                className="mr-2"
              />
              Meta Batida
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notas</label>
            <textarea
              {...register('notas')}
              className="w-full p-2 border rounded-md"
              rows={3}
            />
          </div>

          <div className="text-lg font-semibold">
            Total Pontos: {calculateTotal()}
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
            >
              Salvar
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