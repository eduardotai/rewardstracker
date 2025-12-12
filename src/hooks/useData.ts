import { supabase } from '@/lib/supabase'

// Helper to timeout promises
const withTimeout = async <T>(promiseFactory: () => PromiseLike<T>, ms: number = 15000, retries: number = 3): Promise<T> => {
    for (let i = 0; i < retries; i++) {
        let timeoutId: NodeJS.Timeout
        try {
            const promise = promiseFactory()
            const timeoutPromise = new Promise<T>((_, reject) => {
                timeoutId = setTimeout(() => reject(new Error('Request timed out')), ms)
            })
            const result = await Promise.race([promise, timeoutPromise])
            clearTimeout(timeoutId!)
            return result
        } catch (error) {
            clearTimeout(timeoutId!)
            const isLastAttempt = i === retries - 1
            if (isLastAttempt) throw error

            // Wait before retrying (exponential backoff: 1s, 2s, 4s...)
            const delay = 1000 * Math.pow(2, i)
            console.log(`Attempt ${i + 1} failed, retrying in ${delay}ms...`)
            await new Promise(resolve => setTimeout(resolve, delay))
        }
    }
    throw new Error('All retries failed')
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

// Simple in-memory cache
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const dataCache: {
    dailyRecords: { [userId: string]: { data: DailyRecord[], timestamp: number } }
    resgates: { [userId: string]: { data: Resgate[], timestamp: number } }
    stats: { [userId: string]: { data: any, timestamp: number } }
    leaderboard: { data: LeaderboardUser[], timestamp: number } | null
} = {
    dailyRecords: {},
    resgates: {},
    stats: {},
    leaderboard: null
}

export function invalidateCache(userId: string) {
    if (dataCache.dailyRecords[userId]) delete dataCache.dailyRecords[userId]
    if (dataCache.resgates[userId]) delete dataCache.resgates[userId]
    if (dataCache.stats[userId]) delete dataCache.stats[userId]
    dataCache.leaderboard = null
}

// Fetch user's daily records
export async function fetchDailyRecords(userId: string, limit?: number) {
    const cacheKey = userId
    const cached = dataCache.dailyRecords[cacheKey]

    // Return cached data if valid
    // If we have a full list cached, we can satisfy ANY limit request by slicing
    if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
        if (limit) {
            return { data: cached.data.slice(0, limit), error: null }
        }
        return { data: cached.data, error: null }
    }

    let query = supabase
        .from('registros_diarios')
        .select('*')
        .eq('user_id', userId)
        .order('data', { ascending: false })

    if (limit) {
        query = query.limit(limit)
    }

    const { data, error } = await withTimeout(() => query)

    // Cache the full result if it wasn't limited, or if we can handle merging later
    // For now, only cache if no limit (full list) to avoid complexity
    if (!limit && data) {
        dataCache.dailyRecords[cacheKey] = {
            data: data as DailyRecord[],
            timestamp: Date.now()
        }
    }

    return { data: data as DailyRecord[] | null, error }
}

// Fetch records for last N days
export async function fetchWeeklyRecords(userId: string) {
    // Use full daily records cache if available to filter locally
    const cachedFull = dataCache.dailyRecords[userId]
    if (cachedFull && (Date.now() - cachedFull.timestamp < CACHE_DURATION)) {
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        const cutoff = sevenDaysAgo.toISOString().split('T')[0]

        const filtered = cachedFull.data
            .filter(r => r.data >= cutoff)
            .sort((a, b) => a.data.localeCompare(b.data)) // Ascending for chart

        return { data: filtered, error: null }
    }

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data, error } = await withTimeout(() => supabase
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
    // Check cache (Stats specific or derived from DailyRecords)
    const cachedStats = dataCache.stats[userId]
    if (cachedStats && (Date.now() - cachedStats.timestamp < CACHE_DURATION)) {
        return cachedStats.data
    }

    // Optimization: If we have full daily records cached, derive stats from there!
    const cachedDaily = dataCache.dailyRecords[userId]
    if (cachedDaily && (Date.now() - cachedDaily.timestamp < CACHE_DURATION)) {
        const records = cachedDaily.data
        const totalSaldo = records.reduce((sum, r) => sum + (r.total_pts || 0), 0)
        const mediaDiaria = records.length > 0 ? Math.round(totalSaldo / records.length) : 0

        // Calculate streak
        const sorted = [...records].filter(r => r.meta_batida).sort((a, b) => b.data.localeCompare(a.data))
        let streak = 0
        let currentDate = new Date()

        for (const record of sorted) {
            const recordDate = new Date(record.data)
            const diffDays = Math.floor((currentDate.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24))
            if (diffDays <= 1) {
                streak++
                currentDate = recordDate
            } else {
                break
            }
        }

        const stats = { totalSaldo, streak, mediaDiaria }
        dataCache.stats[userId] = { data: stats, timestamp: Date.now() }
        return stats
    }

    const { data: records, error } = await withTimeout(() => supabase
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

    const stats = { totalSaldo, streak, mediaDiaria }

    // Update cache
    dataCache.stats[userId] = {
        data: stats,
        timestamp: Date.now()
    }

    return stats
}

// Fetch resgates
export async function fetchResgates(userId: string) {
    const cached = dataCache.resgates[userId]
    if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
        return { data: cached.data, error: null }
    }

    const { data, error } = await withTimeout(() => supabase
        .from('resgates')
        .select('*')
        .eq('user_id', userId)
        .order('data', { ascending: false })
    )

    if (data) {
        dataCache.resgates[userId] = {
            data: data as Resgate[],
            timestamp: Date.now()
        }
    }

    return { data: data as Resgate[] | null, error }
}

// Insert daily record
export async function insertDailyRecord(userId: string, record: Omit<DailyRecord, 'id' | 'created_at' | 'user_id'>) {
    const { data, error } = await supabase
        .from('registros_diarios')
        .insert([{ ...record, user_id: userId }])
        .select()
        .single()

    if (!error) {
        invalidateCache(userId)
    }

    return { data, error }
}

// Insert resgate
export async function insertResgate(userId: string, resgate: Omit<Resgate, 'id' | 'created_at' | 'user_id'>) {
    const { data, error } = await supabase
        .from('resgates')
        .insert([{ ...resgate, user_id: userId }])
        .select()
        .single()

    if (!error) {
        invalidateCache(userId)
    }

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
    // Check cache
    if (dataCache.leaderboard && (Date.now() - dataCache.leaderboard.timestamp < CACHE_DURATION)) {
        return dataCache.leaderboard.data
    }

    try {
        // Fetch profiles and records in parallel to verify performance
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const [profilesResult, recordsResult] = await Promise.all([
            withTimeout(() => supabase
                .from('profiles')
                .select('id, display_name, tier, email')
            ),
            withTimeout(() => supabase
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
        const sortedLeaderboard = leaderboard
            .sort((a, b) => b.pts - a.pts)
            .map((user, index) => ({ ...user, rank: index + 1 }))
            .slice(0, 10)

        // Update cache
        dataCache.leaderboard = {
            data: sortedLeaderboard,
            timestamp: Date.now()
        }

        return sortedLeaderboard
    } catch (error) {
        console.error('Leaderboard fetch timed out or failed', error)
        return []
    }
}
