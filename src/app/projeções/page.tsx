'use client'

import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, Calendar, Target, Award } from 'lucide-react'

const projectionData = [
  { month: 'Dez 2024', pts: 8500 },
  { month: 'Jan 2025', pts: 12000 },
  { month: 'Fev 2025', pts: 15500 },
  { month: 'Mar 2025', pts: 19000 },
  { month: 'Abr 2025', pts: 22500 },
  { month: 'Mai 2025', pts: 26000 },
  { month: 'Jun 2025', pts: 29500 },
  { month: 'Jul 2025', pts: 33000 },
  { month: 'Ago 2025', pts: 36500 },
  { month: 'Set 2025', pts: 40000 },
  { month: 'Out 2025', pts: 43500 },
  { month: 'Nov 2025', pts: 47000 },
  { month: 'Dez 2025', pts: 50500 },
]

export default function ProjecoesPage() {
  const [currentPts] = useState(8500)
  const [dailyAvg] = useState(150)

  const daysTo12k = Math.ceil((12000 - currentPts) / dailyAvg)
  const daysTo50Brl = Math.ceil((5250 - (currentPts % 5250)) / dailyAvg) // Assuming 105 pts/R$
  const roi = dailyAvg * 30 / 9.9 // Monthly pts / premium cost

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-xbox-green">📊 Projeções</h1>
        <p className="text-gray-600">Veja suas metas e projeções futuras</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-xbox-green mr-3" />
            <div>
              <p className="text-sm font-semibold text-gray-700">Dias para 12k pts</p>
              <p className="text-2xl font-bold">{daysTo12k} dias</p>
              <p className="text-sm font-semibold text-gray-700">Meta mensal</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <Target className="h-8 w-8 text-xbox-blue mr-3" />
            <div>
              <p className="text-sm font-semibold text-gray-700">Dias para R$50</p>
              <p className="text-2xl font-bold">{daysTo50Brl} dias</p>
              <p className="text-sm font-semibold text-gray-700">Próximo resgate</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-xbox-green mr-3" />
            <div>
              <p className="text-sm font-semibold text-gray-700">ROI Premium</p>
              <p className="text-2xl font-bold">{roi.toFixed(1)}x</p>
              <p className="text-sm font-semibold text-gray-700">Retorno mensal</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <Award className="h-8 w-8 text-xbox-yellow mr-3" />
            <div>
              <p className="text-sm font-semibold text-gray-700">Próximo Level</p>
              <p className="text-2xl font-bold">Essential</p>
              <p className="text-sm font-semibold text-gray-700">Faltam 3500 pts</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Projeção de Pontos Futuros</h2>
        <p className="text-sm font-semibold text-gray-700 mb-4">
          Baseado na média diária de {dailyAvg} pontos
        </p>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={projectionData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => [value.toLocaleString(), 'Pontos']} />
            <Line
              type="monotone"
              dataKey="pts"
              stroke="#0078D4"
              strokeWidth={3}
              dot={{ fill: '#0078D4', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Sugestões para Melhorar</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-xbox-light rounded-lg border-l-4 border-xbox-green">
            <TrendingUp className="h-6 w-6 text-xbox-green mt-1" />
            <div>
              <h3 className="font-semibold text-xbox-green">Aumente Buscas Diárias</h3>
              <p className="text-sm text-gray-700">
                Com 200 pontos/dia, você alcançaria 12k em {Math.ceil((12000 - currentPts) / 200)} dias.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
            <Award className="h-6 w-6 text-green-500 mt-1" />
            <div>
              <h3 className="font-semibold text-green-900">Complete Missões Xbox</h3>
              <p className="text-sm text-green-700">
                Adicione +50 pontos/dia focando em missões Xbox semanais.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
            <Calendar className="h-6 w-6 text-purple-500 mt-1" />
            <div>
              <h3 className="font-semibold text-purple-900">Mantenha Streak</h3>
              <p className="text-sm text-purple-700">
                Streak atual: 5 dias. Manter por 30 dias dá bônus de 500 pontos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}