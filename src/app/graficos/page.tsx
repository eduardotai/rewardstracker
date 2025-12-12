'use client'

import { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  BarChart, Bar
} from 'recharts'
import { Calendar, Filter } from 'lucide-react'

const dailyData = [
  { date: '2024-12-01', pts: 120 },
  { date: '2024-12-02', pts: 150 },
  { date: '2024-12-03', pts: 200 },
  { date: '2024-12-04', pts: 180 },
  { date: '2024-12-05', pts: 220 },
  { date: '2024-12-06', pts: 250 },
  { date: '2024-12-07', pts: 300 },
  { date: '2024-12-08', pts: 280 },
  { date: '2024-12-09', pts: 320 },
  { date: '2024-12-10', pts: 350 },
  { date: '2024-12-11', pts: 400 },
  { date: '2024-12-12', pts: 450 },
]

const sourceData = [
  { name: 'PC Busca', value: 40, color: '#0078D4' },
  { name: 'Mobile Busca', value: 30, color: '#107C10' },
  { name: 'Quiz', value: 20, color: '#FF8C00' },
  { name: 'Xbox', value: 10, color: '#E81123' },
]

const resgateData = [
  { month: 'Jan', pts: 12000 },
  { month: 'Fev', pts: 15000 },
  { month: 'Mar', pts: 18000 },
  { month: 'Abr', pts: 22000 },
  { month: 'Mai', pts: 25000 },
  { month: 'Jun', pts: 28000 },
]

const monthlyData = [
  { month: 'Jan', pts: 3500 },
  { month: 'Fev', pts: 4200 },
  { month: 'Mar', pts: 3800 },
  { month: 'Abr', pts: 5100 },
  { month: 'Mai', pts: 4600 },
  { month: 'Jun', pts: 5300 },
  { month: 'Jul', pts: 4800 },
  { month: 'Ago', pts: 5500 },
  { month: 'Set', pts: 4900 },
  { month: 'Out', pts: 5200 },
  { month: 'Nov', pts: 4700 },
  { month: 'Dez', pts: 5400 },
]

export default function GraficosPage() {
  const [dateRange, setDateRange] = useState('30d')
  const [categoria, setCategoria] = useState('all')

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-blue-600">Gráficos</h1>
        <p className="text-gray-600">Visualize seu progresso e padrões</p>
      </header>

      <div className="flex gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Calendar size={20} />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="p-2 border rounded-md"
          >
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
            <option value="1y">Último ano</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Filter size={20} />
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="p-2 border rounded-md"
          >
            <option value="all">Todas as categorias</option>
            <option value="buscas">Buscas</option>
            <option value="quiz">Quiz</option>
            <option value="xbox">Xbox</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Pontos Diários</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="pts" stroke="#0078D4" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Fontes de Pontos</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sourceData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {sourceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Resgates por Mês</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={resgateData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="pts" fill="#107C10" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Pontos Mensais</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="pts" stroke="#FF8C00" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}