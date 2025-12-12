'use client'

import { useState } from 'react'
import { Plus, Calculator } from 'lucide-react'
import ResgateModal from '@/components/ResgateModal'

export default function ResgatesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'add' | 'simulate'>('add')

  const mockResgates = [
    { id: 1, data: '2024-12-10', item: 'R$5 Gift Card', pts_usados: 525, valor_brl: 5, custo_efetivo: 105 },
    { id: 2, data: '2024-12-08', item: 'R$10 Gift Card', pts_usados: 1050, valor_brl: 10, custo_efetivo: 105 },
    { id: 3, data: '2024-12-05', item: 'R$25 Xbox Gift Card', pts_usados: 2625, valor_brl: 25, custo_efetivo: 105 },
  ]

  const openAddModal = () => {
    setModalMode('add')
    setIsModalOpen(true)
  }

  const openSimulateModal = () => {
    setModalMode('simulate')
    setIsModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-xbox-green">💳 Resgates</h1>
        <p className="text-gray-600">Gerencie seus resgates de pontos</p>
      </header>

      <div className="flex gap-4 mb-6">
        <button
          onClick={openAddModal}
          className="bg-xbox-green text-white px-4 py-2 rounded-md hover:bg-opacity-90 flex items-center gap-2 transition-all"
        >
          <Plus size={20} />
          Adicionar Resgate
        </button>
        <button
          onClick={openSimulateModal}
          className="bg-xbox-yellow text-gray-900 px-4 py-2 rounded-md hover:bg-opacity-90 flex items-center gap-2 transition-all font-semibold"
        >
          <Calculator size={20} />
          Simular Resgate
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Data</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Item</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-900 uppercase tracking-wider">Pts Usados</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-900 uppercase tracking-wider">Valor BRL</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-900 uppercase tracking-wider">Custo Efetivo</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mockResgates.map((resgate) => (
              <tr key={resgate.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{resgate.data}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{resgate.item}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{resgate.pts_usados.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">R$ {resgate.valor_brl}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{resgate.custo_efetivo} pts/R$</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ResgateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
      />
    </div>
  )
}