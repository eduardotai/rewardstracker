'use client'

import { useState } from 'react'
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

const columns: ColumnDef<Atividade, any>[] = [
  columnHelper.accessor('nome', {
    header: 'Nome',
    cell: ({ getValue, row, table }) => {
      const isEditing = table.options.meta?.editingRow === row.id
      const value = getValue()
      return isEditing ? (
        <input
          value={value}
          onChange={(e) => table.options.meta?.updateData(row.index, 'nome', e.target.value)}
          className="w-full p-1 border rounded"
        />
      ) : (
        value
      )
    },
  }),
  columnHelper.accessor('pts_esperados', {
    header: 'Pts Esperados',
    cell: ({ getValue, row, table }) => {
      const isEditing = table.options.meta?.editingRow === row.id
      const value = getValue()
      return isEditing ? (
        <input
          type="number"
          value={value}
          onChange={(e) => table.options.meta?.updateData(row.index, 'pts_esperados', parseInt(e.target.value))}
          className="w-full p-1 border rounded"
        />
      ) : (
        value
      )
    },
  }),
  columnHelper.accessor('frequencia', {
    header: 'Frequência',
    cell: ({ getValue, row, table }) => {
      const isEditing = table.options.meta?.editingRow === row.id
      const value = getValue()
      return isEditing ? (
        <select
          value={value}
          onChange={(e) => table.options.meta?.updateData(row.index, 'frequencia', e.target.value)}
          className="w-full p-1 border rounded"
        >
          <option value="Diária">Diária</option>
          <option value="Semanal">Semanal</option>
          <option value="Mensal">Mensal</option>
          <option value="Única">Única</option>
        </select>
      ) : (
        value
      )
    },
  }),
  columnHelper.accessor('categoria', {
    header: 'Categoria',
    cell: ({ getValue, row, table }) => {
      const isEditing = table.options.meta?.editingRow === row.id
      const value = getValue()
      return isEditing ? (
        <select
          value={value}
          onChange={(e) => table.options.meta?.updateData(row.index, 'categoria', e.target.value)}
          className="w-full p-1 border rounded"
        >
          <option value="Buscas">Buscas</option>
          <option value="Quiz">Quiz</option>
          <option value="Xbox">Xbox</option>
          <option value="Outros">Outros</option>
        </select>
      ) : (
        value
      )
    },
  }),
  columnHelper.accessor('notas', {
    header: 'Notas',
    cell: ({ getValue, row, table }) => {
      const isEditing = table.options.meta?.editingRow === row.id
      const value = getValue()
      return isEditing ? (
        <input
          value={value}
          onChange={(e) => table.options.meta?.updateData(row.index, 'notas', e.target.value)}
          className="w-full p-1 border rounded"
        />
      ) : (
        value
      )
    },
  }),
  columnHelper.display({
    id: 'actions',
    header: 'Ações',
    cell: ({ row, table }) => {
      const isEditing = table.options.meta?.editingRow === row.id
      return isEditing ? (
        <div className="flex gap-2">
          <button
            onClick={() => table.options.meta?.saveRow(row.id)}
            className="p-1 text-green-600 hover:text-green-800"
          >
            <Save size={16} />
          </button>
          <button
            onClick={() => table.options.meta?.cancelEdit()}
            className="p-1 text-gray-600 hover:text-gray-800"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={() => table.options.meta?.startEdit(row.id)}
            className="p-1 text-blue-600 hover:text-blue-800"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => table.options.meta?.deleteRow(row.id)}
            className="p-1 text-red-600 hover:text-red-800"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    },
  }),
]

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
    meta: {
      editingRow: null as string | null,
      updateData: (rowIndex: number, columnId: string, value: any) => {
        setData(old =>
          old.map((row, index) =>
            index === rowIndex
              ? {
                  ...old[rowIndex]!,
                  [columnId]: value,
                }
              : row
          )
        )
      },
      startEdit: (rowId: string) => {
        table.options.meta!.editingRow = rowId
        table.setState({ ...table.getState() })
      },
      saveRow: (rowId: string) => {
        // TODO: Save to Supabase
        console.log('Saving row:', rowId)
        table.options.meta!.editingRow = null
        table.setState({ ...table.getState() })
      },
      cancelEdit: () => {
        table.options.meta!.editingRow = null
        table.setState({ ...table.getState() })
      },
      deleteRow: (rowId: string) => {
        setData(old => old.filter(row => row.id !== rowId))
      },
    },
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
    table.options.meta!.startEdit(newId)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-blue-600">Atividades BR</h1>
        <p className="text-gray-600">Gerencie suas atividades personalizadas</p>
      </header>

      <div className="flex justify-between items-center mb-6">
        <input
          value={globalFilter ?? ''}
          onChange={(event) => setGlobalFilter(String(event.target.value))}
          className="p-2 border rounded-md w-64"
          placeholder="Buscar atividades..."
        />
        <button
          onClick={addNewRow}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
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