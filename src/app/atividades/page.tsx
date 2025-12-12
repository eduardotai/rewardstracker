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
  ColumnDef,
} from '@tanstack/react-table'
import { Plus, Edit, Trash2, Save, X } from 'lucide-react'

type Atividade = {
  id: string
  nome: string
  pts_esperados: number
  frequencia: string
  categoria: string
  notas: string
}

const columnHelper = createColumnHelper<Atividade>()

export default function AtividadesPage() {
  const [data, setData] = useState<Atividade[]>([
    {
      id: '1',
      nome: 'Buscas PC',
      pts_esperados: 150,
      frequencia: 'Diária',
      categoria: 'Buscas',
      notas: 'Máximo 150 pts/dia',
    },
    {
      id: '2',
      nome: 'Buscas Mobile',
      pts_esperados: 150,
      frequencia: 'Diária',
      categoria: 'Buscas',
      notas: 'Máximo 150 pts/dia',
    },
    {
      id: '3',
      nome: 'Quiz Diário',
      pts_esperados: 50,
      frequencia: 'Diária',
      categoria: 'Quiz',
      notas: '10 perguntas',
    },
    {
      id: '4',
      nome: 'Missões Xbox',
      pts_esperados: 100,
      frequencia: 'Diária',
      categoria: 'Xbox',
      notas: 'Varia por dia',
    },
  ])

  const [globalFilter, setGlobalFilter] = useState('')

  const deleteRow = useCallback((id: string) => {
    setData(old => old.filter(r => r.id !== id))
  }, [])

  const columns: ColumnDef<Atividade, any>[] = [
    columnHelper.accessor('nome', {
      header: 'Nome',
    }),
    columnHelper.accessor('pts_esperados', {
      header: 'Pts Esperados',
    }),
    columnHelper.accessor('frequencia', {
      header: 'Frequência',
    }),
    columnHelper.accessor('categoria', {
      header: 'Categoria',
    }),
    columnHelper.accessor('notas', {
      header: 'Notas',
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Ações',
      cell: ({ row }) => (
        <button
          onClick={() => deleteRow(row.original.id)}
          className="p-1 text-xbox-red hover:text-red-700 transition-colors"
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
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  })

  const addNewRow = () => {
    const newId = Date.now().toString()
    const newRow: Atividade = {
      id: newId,
      nome: 'Nova Atividade',
      pts_esperados: 0,
      frequencia: 'Diária',
      categoria: 'Outros',
      notas: '',
    }
    setData(old => [...old, newRow])
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-xbox-green">Atividades BR</h1>
        <p className="text-gray-600">Gerencie suas atividades personalizadas</p>
      </header>

      <div className="flex justify-between items-center mb-6">
        <input
          value={globalFilter ?? ''}
          onChange={(event) => setGlobalFilter(String(event.target.value))}
          className="p-2 border rounded-md w-64 focus:ring-2 focus:ring-xbox-green focus:border-transparent transition-colors"
          placeholder="Buscar atividades..."
        />
        <button
          onClick={addNewRow}
          className="bg-xbox-green text-white px-4 py-2 rounded-md hover:bg-opacity-90 flex items-center gap-2 transition-all"
        >
          <Plus size={20} />
          Adicionar Atividade
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    {{
                      asc: ' 🔼',
                      desc: ' 🔽',
                    }[header.column.getIsSorted() as string] ?? null}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-4 text-center text-gray-500">
                  Nenhuma atividade encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <button
            className="p-1 border rounded hover:bg-gray-100 disabled:opacity-50"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {'<'}
          </button>
          <button
            className="p-1 border rounded hover:bg-gray-100 disabled:opacity-50"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {'>'}
          </button>
          <span className="text-sm text-gray-700">
            Página {table.getState().pagination.pageIndex + 1} de{' '}
            {table.getPageCount()}
          </span>
        </div>
        <select
          value={table.getState().pagination.pageSize}
          onChange={(e) => {
            table.setPageSize(Number(e.target.value))
          }}
          className="p-1 border rounded"
        >
          {[10, 20, 30, 40, 50].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              Mostrar {pageSize}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}