'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Plus } from 'lucide-react'
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
    console.log('Registro diário:', { ...data, total_pts: calculateTotal() })
    toast.success('Registro salvo com sucesso!')
    // TODO: Save to Supabase
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white p-8 rounded-2xl w-full max-w-lg shadow-2xl border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Plus className="h-6 w-6 text-xbox-green mr-3" />
            Registro Diário
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Data da Atividade</label>
            <input
              type="date"
              {...register('data')}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-xbox-green focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Atividade</label>
            <select
              {...register('atividade')}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-xbox-green focus:border-transparent transition-colors bg-white"
            >
              <option value="">Selecione uma atividade...</option>
              <option value="Buscas">🔍 Buscas no PC/Mobile</option>
              <option value="Quiz">🧠 Quiz Diário</option>
              <option value="Xbox">🎮 Missões Xbox</option>
              <option value="Outros">📝 Outros</option>
            </select>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Detalhamento de Pontos</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">PC Busca</label>
                <input
                  type="number"
                  {...register('pc_busca', { valueAsNumber: true })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-xbox-green focus:border-transparent"
                  min="0"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Mobile Busca</label>
                <input
                  type="number"
                  {...register('mobile_busca', { valueAsNumber: true })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-xbox-green focus:border-transparent"
                  min="0"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Quiz</label>
                <input
                  type="number"
                  {...register('quiz', { valueAsNumber: true })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-xbox-green focus:border-transparent"
                  min="0"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Xbox</label>
                <input
                  type="number"
                  {...register('xbox', { valueAsNumber: true })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-xbox-green focus:border-transparent"
                  min="0"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              {...register('meta_batida')}
              className="w-4 h-4 text-xbox-green bg-gray-100 border-gray-300 rounded focus:ring-xbox-green focus:ring-2"
            />
            <label className="text-sm font-medium text-gray-700">
              Meta diária alcançada (150+ pontos)
            </label>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Notas (opcional)</label>
            <textarea
              {...register('notas')}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-xbox-green focus:border-transparent transition-colors resize-none"
              rows={3}
              placeholder="Adicione observações sobre sua atividade..."
            />
          </div>

          <div className="bg-xbox-green bg-opacity-10 p-4 rounded-lg border border-xbox-green border-opacity-20">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-700">Total de Pontos:</span>
              <span className="text-2xl font-bold text-xbox-green">{calculateTotal()}</span>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-xbox-green hover:bg-xbox-green/90 text-white py-3 px-6 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200"
            >
              💾 Salvar Registro
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}