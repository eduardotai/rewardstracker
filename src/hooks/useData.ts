import { supabase } from '@/lib/supabase'

export interface DailyRecord {
    id: number
    created_at: string
    data: string
    atividade: string
    pc_busca: number
    mobile_busca: number
    quiz: number
    xbox: number
    total_pts: number
    meta_batida: boolean
    notas: string
    user_id?: string
}

export interface Resgate {
    id: number
    created_at: string
    data: string
    item: string
    pts_usados: number
    valor_brl: number
    custo_efetivo: number
    user_id?: string
}

// Fetch user's daily records
export async function fetchDailyRecords(userId: string, limit?: number) {
    let query = supabase
        .from('registros_diarios')
        .select('*')
        .eq('user_id', userId)
        .order('data', { ascending: false })

    if (limit) {
        query = query.limit(limit)
    }

    const { data, error } = await query
    return { data: data as DailyRecord[] | null, error }
}

// Fetch records for last N days
export async function fetchWeeklyRecords(userId: string) {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data, error } = await supabase
        .from('registros_diarios')
        .select('*')
        .eq('user_id', userId)
        .gte('data', sevenDaysAgo.toISOString().split('T')[0])
        .order('data', { ascending: true })

    return { data: data as DailyRecord[] | null, error }
}

// Get user stats
export async function fetchUserStats(userId: string) {
    const { data: records, error } = await supabase
        .from('registros_diarios')
        .select('total_pts, meta_batida, data')
        .eq('user_id', userId)

    if (error || !records) {
        return { totalSaldo: 0, streak: 0, mediaDiaria: 0 }
    }

    const totalSaldo = records.reduce((sum, r) => sum + (r.total_pts || 0), 0)
    const mediaDiaria = records.length > 0 ? Math.round(totalSaldo / records.length) : 0

    // Calculate streak (consecutive days with goal met)
    const sortedRecords = records
        .filter(r => r.meta_batida)
        .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())

    let streak = 0
    const today = new Date()
    let currentDate = new Date(today)

    for (const record of sortedRecords) {
        const recordDate = new Date(record.data)
        const diffDays = Math.floor((currentDate.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24))

        if (diffDays <= 1) {
            streak++
            currentDate = recordDate
        } else {
            break
        }
    }

    return { totalSaldo, streak, mediaDiaria }
}

// Fetch resgates
export async function fetchResgates(userId: string) {
    const { data, error } = await supabase
        .from('resgates')
        .select('*')
        .eq('user_id', userId)
        .order('data', { ascending: false })

    return { data: data as Resgate[] | null, error }
}

// Insert daily record
export async function insertDailyRecord(userId: string, record: Omit<DailyRecord, 'id' | 'created_at' | 'user_id'>) {
    const { data, error } = await supabase
        .from('registros_diarios')
        .insert([{ ...record, user_id: userId }])
        .select()
        .single()

    return { data, error }
}

// Insert resgate
export async function insertResgate(userId: string, resgate: Omit<Resgate, 'id' | 'created_at' | 'user_id'>) {
    const { data, error } = await supabase
        .from('resgates')
        .insert([{ ...resgate, user_id: userId }])
        .select()
        .single()

    return { data, error }
}
