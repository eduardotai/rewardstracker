'use client'

import { useState, useCallback } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table'
import { Plus, Trash2, Search, Activity, ChevronLeft, ChevronRight, Home, BarChart3, PiggyBank, User, Gift, Menu, X as CloseIcon } from 'lucide-react'

type Atividade = {
  id: string
  nome: string
  pts_esperados: number
  frequencia: string
  categoria: string
  notas: string
}

const columnHelper = createColumnHelper<Atividade>()

const navItems = [
  { icon: Home, label: 'Dashboard', href: '/', active: false },
  { icon: Activity, label: 'Atividades', href: '/atividades', active: true },
  { icon: BarChart3, label: 'Gráficos', href: '/graficos', active: false },
  { icon: PiggyBank, label: 'Resgates', href: '/resgates', active: false },
  { icon: User, label: 'Perfil', href: '/perfil', active: false },
]

export default function AtividadesPage() {
  const [data, setData] = useState<Atividade[]>([
    { id: '1', nome: 'Buscas PC', pts_esperados: 150, frequencia: 'Diária', categoria: 'Buscas', notas: 'Máximo 150 pts/dia' },
    { id: '2', nome: 'Buscas Mobile', pts_esperados: 150, frequencia: 'Diária', categoria: 'Buscas', notas: 'Máximo 150 pts/dia' },
    { id: '3', nome: 'Quiz Diário', pts_esperados: 50, frequencia: 'Diária', categoria: 'Quiz', notas: '10 perguntas' },
    { id: '4', nome: 'Missões Xbox', pts_esperados: 100, frequencia: 'Diária', categoria: 'Xbox', notas: 'Varia por dia' },
  ])

  const [globalFilter, setGlobalFilter] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const deleteRow = useCallback((id: string) => {
    setData(old => old.filter(r => r.id !== id))
  }, [])

  const columns = [
    columnHelper.accessor('nome', { header: 'Nome' }),
    columnHelper.accessor('pts_esperados', { header: 'Pts Esperados' }),
    columnHelper.accessor('frequencia', { header: 'Frequência' }),
    columnHelper.accessor('categoria', { header: 'Categoria' }),
    columnHelper.accessor('notas', { header: 'Notas' }),
    columnHelper.display({
      id: 'actions',
      header: 'Ações',
      cell: ({ row }) => (
        <button
          onClick={() => deleteRow(row.original.id)}
          className="p-2 text-[var(--error)] hover:bg-[var(--error)]/10 rounded transition-colors"
        >
          <Trash2 size={16} />
        </button>
      ),
    }),
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: 'includesString',
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
  })

  const addNewRow = () => {
    const newId = Date.now().toString()
    setData(old => [...old, {
      id: newId,
      nome: 'Nova Atividade',
      pts_esperados: 0,
      frequencia: 'Diária',
      categoria: 'Outros',
      notas: '',
    }])
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
        <div className="p-6 border-b border-[var(--border-subtle)]">
          <h1 className="text-xl font-bold text-[var(--xbox-green)] flex items-center gap-2">
            <Gift className="h-6 w-6" />
            Rewards Tracker
          </h1>
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded text-sm font-medium transition-all relative ${item.active
                    ? 'bg-[var(--bg-tertiary)] text-white'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-white'
                    }`}
                >
                  {item.active && <span className="xbox-nav-indicator" />}
                  <item.icon className={`h-5 w-5 ${item.active ? 'text-[var(--xbox-green)]' : ''}`} />
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setIsSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-[var(--bg-secondary)] border-r border-[var(--border-subtle)]">
            <div className="p-6 border-b border-[var(--border-subtle)] flex items-center justify-between">
              <h1 className="text-xl font-bold text-[var(--xbox-green)]">Rewards</h1>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-[var(--bg-tertiary)] rounded">
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>
            <nav className="p-4">
              <ul className="space-y-1">
                {navItems.map((item) => (
                  <li key={item.label}>
                    <a href={item.href} className={`flex items-center gap-3 px-4 py-3 rounded text-sm font-medium relative ${item.active ? 'bg-[var(--bg-tertiary)] text-white' : 'text-[var(--text-secondary)]'
                      }`}>
                      {item.active && <span className="xbox-nav-indicator" />}
                      <item.icon className={`h-5 w-5 ${item.active ? 'text-[var(--xbox-green)]' : ''}`} />
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-40 bg-[var(--bg-primary)] border-b border-[var(--border-subtle)] p-4 flex items-center justify-between">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-[var(--bg-tertiary)] rounded">
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-bold text-[var(--xbox-green)]">Atividades</h1>
          <div className="w-10" />
        </header>

        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          <header className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Atividades</h2>
            <p className="text-[var(--text-secondary)]">Gerencie suas atividades personalizadas</p>
          </header>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
              <input
                value={globalFilter ?? ''}
                onChange={(e) => setGlobalFilter(String(e.target.value))}
                className="xbox-input pl-10"
                placeholder="Buscar atividades..."
              />
            </div>
            <button onClick={addNewRow} className="xbox-btn xbox-btn-primary">
              <Plus size={18} />
              Adicionar Atividade
            </button>
          </div>

          <div className="xbox-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="xbox-table">
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="cursor-pointer hover:text-white transition-colors"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                          {{ asc: ' ↑', desc: ' ↓' }[header.column.getIsSorted() as string] ?? null}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <tr key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="text-white">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={columns.length} className="text-center text-[var(--text-muted)] py-8">
                        Nenhuma atividade encontrada.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <button
                className="xbox-btn xbox-btn-ghost p-2"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                className="xbox-btn xbox-btn-ghost p-2"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <span className="text-sm text-[var(--text-secondary)]">
                Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
              </span>
            </div>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="xbox-input xbox-select w-auto"
            >
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>Mostrar {pageSize}</option>
              ))}
            </select>
          </div>
        </div>
      </main>
    </div>
  )
}