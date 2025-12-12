'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function MensalPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Mock data for days with points
  const daysWithPoints = {
    '2024-12-01': 150,
    '2024-12-02': 200,
    '2024-12-03': 180,
    '2024-12-05': 220,
    '2024-12-07': 300,
    '2024-12-08': 250,
    '2024-12-10': 180,
    '2024-12-12': 350,
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      days.push({
        day,
        points: daysWithPoints[dateStr as keyof typeof daysWithPoints] || 0,
        date: dateStr
      })
    }

    return days
  }

  const days = getDaysInMonth(currentMonth)
  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

  const getIntensity = (points: number) => {
    if (points === 0) return 'bg-gray-100'
    if (points < 100) return 'bg-green-200'
    if (points < 200) return 'bg-green-300'
    if (points < 300) return 'bg-green-400'
    return 'bg-green-500'
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev)
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1)
      } else {
        newMonth.setMonth(prev.getMonth() + 1)
      }
      return newMonth
    })
  }

  const exportCSV = () => {
    // Simple CSV export
    const csv = 'Data,Pontos\n' + Object.entries(daysWithPoints).map(([date, points]) => `${date},${points}`).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'relatorio-mensal.csv'
    a.click()
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-xbox-green">📅 Mensal 2025</h1>
        <p className="text-gray-600">Heatmap dos seus pontos mensais</p>
      </header>

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-200 rounded-md"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-xl font-semibold">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h2>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-200 rounded-md"
          >
            <ChevronRight size={20} />
          </button>
        </div>
        <button
          onClick={exportCSV}
          className="bg-xbox-green text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors font-semibold"
        >
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
            <div key={day} className="text-center font-bold text-gray-900 py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => (
            <div
              key={index}
              className={`aspect-square flex items-center justify-center rounded-md text-sm font-medium cursor-pointer hover:opacity-80 transition-opacity ${
                day ? getIntensity(day.points) : ''
              }`}
              title={day ? `${day.points} pontos` : ''}
            >
              {day?.day}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Totais por Categoria</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Buscas PC</span>
            <span>1200 pts</span>
          </div>
          <div className="flex justify-between">
            <span>Buscas Mobile</span>
            <span>900 pts</span>
          </div>
          <div className="flex justify-between">
            <span>Quiz</span>
            <span>600 pts</span>
          </div>
          <div className="flex justify-between">
            <span>Xbox</span>
            <span>800 pts</span>
          </div>
          <div className="flex justify-between font-semibold border-t pt-2">
            <span>Total</span>
            <span>3500 pts</span>
          </div>
        </div>
      </div>
    </div>
  )
}