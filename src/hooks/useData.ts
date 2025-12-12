import { supabase } from '@/lib/supabase'

// Helper to timeout promises
const withTimeout = async <T>(promise: PromiseLike<T>, ms: number = 10000): Promise<T> => {
    let timeoutId: NodeJS.Timeout
    const timeoutPromise = new Promise<T>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error('Request timed out')), ms)
    })
    try {
        const result = await Promise.race([promise, timeoutPromise])
        clearTimeout(timeoutId!)
        return result
    } catch (error) {
        clearTimeout(timeoutId!)
        throw error
    }
}

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

    const { data, error } = await withTimeout(query)
    return { data: data as DailyRecord[] | null, error }
}

// Fetch records for last N days
export async function fetchWeeklyRecords(userId: string) {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data, error } = await withTimeout(supabase
        .from('registros_diarios')
        .select('*')
        .eq('user_id', userId)
        .gte('data', sevenDaysAgo.toISOString().split('T')[0])
        .order('data', { ascending: true })
    )

    return { data: data as DailyRecord[] | null, error }
}

// Get user stats
export async function fetchUserStats(userId: string) {
    const { data: records, error } = await withTimeout(supabase
        .from('registros_diarios')
        .select('total_pts, meta_batida, data')
        .eq('user_id', userId)
    )

    if (error || !records) {
        return { totalSaldo: 0, streak: 0, mediaDiaria: 0 }
    }

    const typedRecords = records as Pick<DailyRecord, 'total_pts' | 'meta_batida' | 'data'>[]

    const totalSaldo = typedRecords.reduce((sum, r) => sum + (r.total_pts || 0), 0)
    const mediaDiaria = typedRecords.length > 0 ? Math.round(totalSaldo / typedRecords.length) : 0

    // Calculate streak (consecutive days with goal met)
    const sortedRecords = typedRecords
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
    const { data, error } = await withTimeout(supabase
        .from('resgates')
        .select('*')
        .eq('user_id', userId)
        .order('data', { ascending: false })
    )

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

export interface LeaderboardUser {
    rank: number
    name: string
    pts: number
    tier: string
    isCurrentUser: boolean
}


// Fetch dynamic leaderboard data
export async function fetchLeaderboardData(currentUserId?: string) {
    try {
        // Fetch profiles and records in parallel to verify performance
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const [profilesResult, recordsResult] = await Promise.all([
            withTimeout(supabase
                .from('profiles')
                .select('id, display_name, tier, email')
            ),
            withTimeout(supabase
                .from('registros_diarios')
                .select('user_id, total_pts')
                .gte('data', thirtyDaysAgo.toISOString().split('T')[0])
            )
        ])

        const { data: profiles, error: profilesError } = profilesResult
        const { data: records, error: recordsError } = recordsResult

        if (profilesError) {
            console.error('Error fetching profiles for leaderboard:', profilesError)
            return []
        }

        if (recordsError) {
            console.error('Error fetching records for leaderboard:', recordsError)
            return []
        }

        // 3. Aggregate points by user
        const userPoints: Record<string, number> = {}
        const typedRecords = records as { user_id: string, total_pts: number }[]

        typedRecords?.forEach(record => {
            if (record.user_id) {
                userPoints[record.user_id] = (userPoints[record.user_id] || 0) + (record.total_pts || 0)
            }
        })

        // 4. Map profiles to leaderboard format
        const typedProfiles = profiles as { id: string, display_name: string, tier: string, email: string }[]
        const leaderboard: LeaderboardUser[] = typedProfiles.map(profile => ({
            rank: 0,
            name: profile.display_name || profile.email?.split('@')[0] || 'Usuário',
            pts: userPoints[profile.id] || 0,
            tier: profile.tier || 'Sem',
            isCurrentUser: profile.id === currentUserId
        }))

        // 5. Sort by points (descending) and assign rank
        return leaderboard
            .sort((a, b) => b.pts - a.pts)
            .map((user, index) => ({ ...user, rank: index + 1 }))
            .slice(0, 10)
    } catch (error) {
        console.error('Leaderboard fetch timed out or failed', error)
        return []
    }
}
