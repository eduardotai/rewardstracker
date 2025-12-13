'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
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
        return savedData ? JSON.parse(savedData) : defaultGuestData
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
            console.log('AuthContext: Fetching profile for user:', userId)

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle()

            if (error) {
                console.error('AuthContext: Error fetching profile:', error)
                return null
            }

            if (data) {
                console.log('AuthContext: Profile found')
                setProfile(data)
                return data
            } else if (userEmail) {
                console.log('AuthContext: Profile not found, creating new one')

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
                    console.log('AuthContext: Profile created successfully')
                    setProfile(createdProfile as UserProfile)
                    return createdProfile
                } else {
                    console.error('AuthContext: Error creating profile:', createError)
                    return null
                }
            }

            return null
        } catch (error) {
            console.error('AuthContext: Unexpected error in fetchProfile:', error)
            return null
        }
    }

    const refreshProfile = async () => {
        if (user && !loading) {
            console.log('AuthContext: Refreshing profile for user:', user.id)
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

        const updated = { ...guestData, ...newData }
        setGuestData(updated)
        localStorage.setItem(GUEST_DATA_KEY, JSON.stringify(updated))
    }

    const updateGuestProfile = (profileData: Partial<GuestData['profile']>) => {
        if (!guestData) {
            console.warn('AuthContext: updateGuestProfile called but guestData is null')
            return
        }

        console.log('AuthContext: updateGuestProfile called with:', profileData)
        console.log('AuthContext: current guestData before update:', {
            registrosCount: guestData.registros?.length || 0,
            atividadesCount: guestData.atividades?.length || 0,
            resgatesCount: guestData.resgates?.length || 0,
            currentTier: guestData.profile?.tier
        })

        const updated = {
            ...guestData,
            profile: { ...guestData.profile, ...profileData }
        }

        console.log('AuthContext: updated guestData:', {
            registrosCount: updated.registros?.length || 0,
            atividadesCount: updated.atividades?.length || 0,
            resgatesCount: updated.resgates?.length || 0,
            newTier: updated.profile?.tier
        })

        setGuestData(updated)
        localStorage.setItem(GUEST_DATA_KEY, JSON.stringify(updated))

        // Verify storage
        const stored = localStorage.getItem(GUEST_DATA_KEY)
        if (stored) {
            const parsed = JSON.parse(stored)
            console.log('AuthContext: verified storage:', {
                registrosCount: parsed.registros?.length || 0,
                tier: parsed.profile?.tier
            })
        }
    }

    useEffect(() => {
        let isMounted = true
        let profileOperationInProgress = false

        // Safety timeout to prevent infinite loading - increased to 15 seconds
        const timeout = setTimeout(() => {
            if (isMounted && loading && !profileOperationInProgress) {
                console.log('AuthContext: Loading timed out after 15s, forcing false')
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
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            if (!isMounted) return

            setSession(session)
            setUser(session?.user ?? null)

            if (session?.user) {
                await handleProfileOperation(session.user.id, session.user.email)
            } else {
                setLoading(false)
            }

            clearTimeout(timeout)
        }).catch(err => {
            console.error('AuthContext: GetSession error', err)
            if (isMounted) {
                setLoading(false)
            }
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (!isMounted) return

                console.log('AuthContext: Auth State Change:', event, session?.user?.email)

                // Always update session for token refresh
                setSession(session)

                const newUserId = session?.user?.id

                // Only update user and fetch profile if user actually changed
                if (newUserId !== lastUserId.current) {
                    console.log('AuthContext: User changed, updating state...', newUserId)
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
                    console.log('AuthContext: User unchanged, skipping update logic.')
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
