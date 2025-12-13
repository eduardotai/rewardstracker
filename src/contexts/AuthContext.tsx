'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

const GUEST_STORAGE_KEY = 'rewards_tracker_guest_mode'
const GUEST_DATA_KEY = 'rewards_tracker_guest_data'

interface UserProfile {
    id: string
    email: string
    display_name: string
    tier: string
    level: 1 | 2 // New field for Rewards Level
    meta_mensal: number
    created_at: string
}

interface GuestAtividade {
    id: string
    nome: string
    pts_esperados: number
    frequencia: string
    categoria: string
    notas: string
}

interface GuestResgate {
    id: string | number
    data: string
    item: string
    pts_usados: number
    valor_brl: number | null
    custo_efetivo: number | null
    created_at: string
}

interface GuestData {
    registros: Array<{
        id: number
        data: string
        atividade: string
        pc_busca: number
        mobile_busca: number
        quiz: number
        xbox: number
        total_pts: number
        meta_batida: boolean
        notas: string
        created_at: string
    }>
    atividades: GuestAtividade[]
    resgates: GuestResgate[]
    profile: {
        display_name: string
        tier: string
        level: 1 | 2 // New field for Guest Level
        meta_mensal: number
    }
}

interface AuthContextType {
    user: User | null
    profile: UserProfile | null
    session: Session | null
    loading: boolean
    isGuest: boolean
    guestData: GuestData | null
    signOut: () => Promise<void>
    refreshProfile: () => Promise<void>
    enterAsGuest: () => void
    updateGuestData: (data: Partial<GuestData>) => void
    updateGuestProfile: (profile: Partial<GuestData['profile']>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const defaultGuestData: GuestData = {
    registros: [],
    atividades: [],
    resgates: [],
    profile: {
        display_name: 'Visitante',
        tier: 'Sem',
        level: 2, // Default to Level 2
        meta_mensal: 12000,
    }
}

const getInitialGuestMode = (): boolean => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(GUEST_STORAGE_KEY) === 'true'
}

const getInitialGuestData = (): GuestData | null => {
    if (typeof window === 'undefined') return null
    const isGuestMode = localStorage.getItem(GUEST_STORAGE_KEY) === 'true'
    if (isGuestMode) {
        const savedData = localStorage.getItem(GUEST_DATA_KEY)
        if (savedData) {
            try {
                return JSON.parse(savedData)
            } catch {
                return defaultGuestData
            }
        }
        return defaultGuestData
    }
    return null
}

const getInitialLoadingState = (): boolean => {
    if (typeof window === 'undefined') return true
    // Don't show loading if we're in guest mode
    return localStorage.getItem(GUEST_STORAGE_KEY) !== 'true'
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(getInitialLoadingState)
    const [isGuest, setIsGuest] = useState(getInitialGuestMode)
    const [guestData, setGuestData] = useState<GuestData | null>(getInitialGuestData)

    const fetchProfile = async (userId: string, userEmail?: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle()

            if (error) {
                return null
            }

            if (data) {
                setProfile(data)
                return data
            } else if (userEmail) {
                // Profile doesn't exist, create one for new users
                const newProfile = {
                    id: userId,
                    email: userEmail,
                    display_name: userEmail.split('@')[0],
                    tier: 'Sem',
                    level: 2, // Default to Level 2
                    meta_mensal: 12000,
                }

                const { data: createdProfile, error: createError } = await supabase
                    .from('profiles')
                    .insert([newProfile])
                    .select()
                    .single()

                if (!createError && createdProfile) {
                    setProfile(createdProfile as UserProfile)
                    return createdProfile
                } else {
                    return null
                }
            }

            return null
        } catch {
            return null
        }
    }

    const refreshProfile = async () => {
        if (user && !loading) {
            await fetchProfile(user.id, user.email)
        }
    }


    const enterAsGuest = () => {
        localStorage.setItem(GUEST_STORAGE_KEY, 'true')
        localStorage.setItem(GUEST_DATA_KEY, JSON.stringify(defaultGuestData))
        setIsGuest(true)
        setGuestData(defaultGuestData)
        setLoading(false)
    }

    const updateGuestData = (newData: Partial<GuestData>) => {
        if (!guestData) return

        // Read current data from localStorage to ensure we have the latest
        let currentData = guestData
        try {
            const storedData = localStorage.getItem(GUEST_DATA_KEY)
            if (storedData) {
                currentData = JSON.parse(storedData)
            }
        } catch {
            // Use state data if localStorage read fails
        }

        // Merge with deep copy to prevent reference issues
        const updated: GuestData = {
            registros: newData.registros ?? (currentData.registros ? currentData.registros.map(r => ({ ...r })) : []),
            atividades: newData.atividades ?? (currentData.atividades ? currentData.atividades.map(a => ({ ...a })) : []),
            resgates: newData.resgates ?? (currentData.resgates ? currentData.resgates.map(r => ({ ...r })) : []),
            profile: newData.profile ?? { ...currentData.profile }
        }

        // Save to localStorage first to ensure persistence
        localStorage.setItem(GUEST_DATA_KEY, JSON.stringify(updated))
        // Then update state
        setGuestData(updated)
    }

    const updateGuestProfile = (profileData: Partial<GuestData['profile']>) => {
        if (!guestData) {
            return
        }

        // Read current data from localStorage to ensure we have the latest
        let currentData = guestData
        try {
            const storedData = localStorage.getItem(GUEST_DATA_KEY)
            if (storedData) {
                currentData = JSON.parse(storedData)
            }
        } catch {
            // Use state data if localStorage read fails
        }

        // Create updated data with deep copy to prevent reference issues
        const updated: GuestData = {
            registros: currentData.registros ? currentData.registros.map(r => ({ ...r })) : [],
            atividades: currentData.atividades ? currentData.atividades.map(a => ({ ...a })) : [],
            resgates: currentData.resgates ? currentData.resgates.map(r => ({ ...r })) : [],
            profile: { ...currentData.profile, ...profileData }
        }

        // Save to localStorage first to ensure persistence
        localStorage.setItem(GUEST_DATA_KEY, JSON.stringify(updated))
        // Then update state
        setGuestData(updated)
    }

    useEffect(() => {
        let isMounted = true
        let profileOperationInProgress = false

        // Safety timeout to prevent infinite loading - increased to 15 seconds
        const timeout = setTimeout(() => {
            if (isMounted && loading && !profileOperationInProgress) {
                setLoading(false)
            }
        }, 15000)

        // Track last user ID to prevent unnecessary updates/refetches on window focus
        const lastUserId = { current: user?.id }

        // Function to handle profile operations
        const handleProfileOperation = async (userId: string, userEmail?: string) => {
            if (profileOperationInProgress) return
            profileOperationInProgress = true

            try {
                await fetchProfile(userId, userEmail)
            } finally {
                profileOperationInProgress = false
                if (isMounted) {
                    setLoading(false)
                }
            }
        }

        // Get initial session
        const initSession = async () => {
            try {
                const { data } = await supabase.auth.getSession()
                const initialSession = data?.session as Session | null
                if (!isMounted) return

                setSession(initialSession)
                setUser(initialSession?.user ?? null)

                if (initialSession?.user) {
                    await handleProfileOperation(initialSession.user.id, initialSession.user.email)
                } else {
                    setLoading(false)
                }
            } catch {
                if (isMounted) {
                    setLoading(false)
                }
            } finally {
                clearTimeout(timeout)
            }
        }

        initSession()

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event: AuthChangeEvent, session: Session | null) => {
                if (!isMounted) return

                // Always update session for token refresh
                setSession(session)

                const newUserId = session?.user?.id

                // Only update user and fetch profile if user actually changed
                if (newUserId !== lastUserId.current) {
                    lastUserId.current = newUserId
                    setUser(session?.user ?? null)

                    if (session?.user) {
                        // Clear guest mode when logging in
                        localStorage.removeItem(GUEST_STORAGE_KEY)
                        setIsGuest(false)
                        await handleProfileOperation(session.user.id, session.user.email)
                    } else {
                        setProfile(null)
                        setLoading(false)
                    }
                } else {
                    setLoading(false)
                }
            }
        )

        return () => {
            isMounted = false
            clearTimeout(timeout)
            subscription.unsubscribe()
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const signOut = async () => {
        if (isGuest) {
            localStorage.removeItem(GUEST_STORAGE_KEY)
            localStorage.removeItem(GUEST_DATA_KEY)
            setIsGuest(false)
            setGuestData(null)
        } else {
            await supabase.auth.signOut()
            setUser(null)
            setProfile(null)
            setSession(null)
        }
    }

    return (
        <AuthContext.Provider value={{
            user,
            profile,
            session,
            loading,
            isGuest,
            guestData,
            signOut,
            refreshProfile,
            enterAsGuest,
            updateGuestData,
            updateGuestProfile
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
