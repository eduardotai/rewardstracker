import { supabase } from '@/lib/supabase'
import { getLocalDateString } from '@/lib/rewards-constants'

interface UserStats {
    totalSaldo: number
    streak: number
    mediaDiaria: number
}

const withTimeout = async <T>(promiseFactory: () => PromiseLike<T>, ms: number = 10000, retries: number = 1): Promise<T> => {
    let lastError: Error | undefined
    for (let i = 0; i <= retries; i++) {
        let timeoutId: ReturnType<typeof setTimeout>
        try {
            const promise = promiseFactory()
            const timeoutPromise = new Promise<T>((_, reject) => {
                timeoutId = setTimeout(() => reject(new Error(`Request timed out after ${ms}ms`)), ms)
            })
            const result = await Promise.race([promise, timeoutPromise])
            clearTimeout(timeoutId!)
            return result
        } catch (err) {
            clearTimeout(timeoutId!)
            lastError = err instanceof Error ? err : new Error(String(err))
            const isLastAttempt = i === retries
            if (isLastAttempt) {
                throw lastError
            }

            // Wait before retrying (exponential backoff: 1s, 2s)
            const delay = 1000 * Math.pow(2, i)
            await new Promise(resolve => setTimeout(resolve, delay))
        }
    }
    throw lastError ?? new Error('All retries failed')
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
    id: string
    created_at: string
    data: string
    item: string
    pts_usados: number
    valor_brl: number | null
    custo_efetivo: number | null
    user_id?: string
}

// Simple in-memory cache
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const dataCache: {
    dailyRecords: { [userId: string]: { data: DailyRecord[], timestamp: number } }
    resgates: { [userId: string]: { data: Resgate[], timestamp: number } }
    stats: { [userId: string]: { data: UserStats, timestamp: number } }
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

// Fetch monthly status for calendar
export async function fetchMonthlyStatus(userId: string, month: number, year: number) {
    const startOfMonth = new Date(year, month, 1)
    const endOfMonth = new Date(year, month + 1, 0)

    // Check local cache if needed, but for now strict fetch to ensure sync
    const { data: records, error } = await withTimeout(() => supabase
        .from('registros_diarios')
        .select('data, meta_batida, total_pts')
        .eq('user_id', userId)
        .gte('data', getLocalDateString(startOfMonth))
        .lte('data', getLocalDateString(endOfMonth))
    )

    if (error) return { data: [], error }

    return { data: records as Pick<DailyRecord, 'data' | 'meta_batida' | 'total_pts'>[], error: null }
}

// Fetch records for last N days
export async function fetchWeeklyRecords(userId: string) {
    // Use full daily records cache if available to filter locally
    const cachedFull = dataCache.dailyRecords[userId]
    if (cachedFull && (Date.now() - cachedFull.timestamp < CACHE_DURATION)) {
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        const cutoff = getLocalDateString(sevenDaysAgo)

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
        .gte('data', getLocalDateString(sevenDaysAgo))
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

        // Calculate streak strictly
        // Streak rules:
        // 1. Must be consecutive days (gap of 1 day max between records)
        // 2. "Today" counts if meta is met.
        // 3. If "Today" is not logged yet, "Yesterday" keeps the streak alive.
        // 4. If gap >= 2 days (e.g. last record was day before yesterday), streak is broken (0, unless today is logged).

        // Sort records by date descending (newest first)
        const sorted = [...records]
            .filter(r => r.meta_batida) // Only count days where meta was met
            .sort((a, b) => b.data.localeCompare(a.data))

        let streak = 0
        const today = new Date()
        today.setHours(0, 0, 0, 0) // Normalize today to 00:00:00

        let lastDate: Date | null = null

        for (const record of sorted) {
            // Parse record date (assuming YYYY-MM-DD format from Supabase dates)
            // Note: splitting 'T' handles both ISO timestamps and simple dates
            const recordDateParts = record.data.split('T')[0].split('-')
            const recordDate = new Date(
                parseInt(recordDateParts[0]),
                parseInt(recordDateParts[1]) - 1,
                parseInt(recordDateParts[2])
            )
            recordDate.setHours(0, 0, 0, 0)

            // Calculate difference in days from the "reference" date
            // For the first item, reference is Today. For subsequent, it's the previous recordDate.
            if (lastDate === null) {
                // First valid record found.
                // Check if it is Today or Yesterday. If older, streak is broken immediately (unless we want to show 0).
                const diffTime = today.getTime() - recordDate.getTime()
                const diffDays = Math.round(diffTime / (1000 * 3600 * 24))

                if (diffDays <= 1) { // 0 (Today) or 1 (Yesterday)
                    streak++
                    lastDate = recordDate
                } else {
                    // Last valid record is too old (2+ days ago). Streak is 0.
                    break
                }
            } else {
                // Check consecutiveness with previous record in the loop
                const diffTime = lastDate.getTime() - recordDate.getTime()
                const diffDays = Math.round(diffTime / (1000 * 3600 * 24))

                if (diffDays === 0) {
                    continue // Same day, multiple records. Skip this one, keep looking back.
                }

                if (diffDays === 1) {
                    streak++
                    lastDate = recordDate
                } else {
                    // Gap found (e.g. skipped a day)
                    break
                }
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
    const { data, error } = await withTimeout(() => supabase
        .from('registros_diarios')
        .insert([{ ...record, user_id: userId }])
        .select()
        .single()
    )

    if (!error) {
        invalidateCache(userId)
    }

    return { data, error }
}

// Insert resgate
export async function insertResgate(userId: string, resgate: Omit<Resgate, 'id' | 'created_at' | 'user_id'>) {
    // Verify the session is active and user_id matches
    const { data: sessionData } = await supabase.auth.getSession()
    const authenticatedUserId = sessionData?.session?.user?.id

    if (!authenticatedUserId || authenticatedUserId !== userId) {
        return { data: null, error: new Error('Session expired or user mismatch. Please refresh and try again.') }
    }

    // Ensure we don't send any id field to let Supabase generate it
    const resgateData = {
        data: resgate.data,
        item: resgate.item,
        pts_usados: resgate.pts_usados,
        valor_brl: resgate.valor_brl,
        custo_efetivo: resgate.custo_efetivo,
        user_id: authenticatedUserId // Use the verified authenticated user ID
    }

    const { data, error } = await withTimeout(() => supabase
        .from('resgates')
        .insert([resgateData])
        .select()
        .single()
    )

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
                .select('id, display_name, tier, email'),
                60000 // Increase timeout to 60s for heavy leaderboard fetch
            ),
            withTimeout(() => supabase
                .from('registros_diarios')
                .select('user_id, total_pts')
                .gte('data', getLocalDateString(thirtyDaysAgo)),
                60000 // Increase timeout to 60s for heavy leaderboard fetch
            )
        ])

        const { data: profiles, error: profilesError } = profilesResult
        const { data: records, error: recordsError } = recordsResult

        if (profilesError || recordsError) {
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
    } catch {
        return []
    }
}
