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
    meta_mensal: number
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
    profile: {
        display_name: string
        tier: string
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const defaultGuestData: GuestData = {
    registros: [],
    profile: {
        display_name: 'Visitante',
        tier: 'Sem',
        meta_mensal: 12000,
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)
    const [isGuest, setIsGuest] = useState(false)
    const [guestData, setGuestData] = useState<GuestData | null>(null)

    const fetchProfile = async (userId: string) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()

        if (!error && data) {
            setProfile(data)
        }
    }

    const refreshProfile = async () => {
        if (user) {
            await fetchProfile(user.id)
        }
    }

    const loadGuestMode = () => {
        if (typeof window === 'undefined') return false

        const isGuestMode = localStorage.getItem(GUEST_STORAGE_KEY) === 'true'
        if (isGuestMode) {
            const savedData = localStorage.getItem(GUEST_DATA_KEY)
            setGuestData(savedData ? JSON.parse(savedData) : defaultGuestData)
            setIsGuest(true)
            return true
        }
        return false
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

    useEffect(() => {
        // Check for guest mode first
        if (loadGuestMode()) {
            setLoading(false)
            return
        }

        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            setUser(session?.user ?? null)
            if (session?.user) {
                fetchProfile(session.user.id)
            }
            setLoading(false)
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setSession(session)
                setUser(session?.user ?? null)

                if (session?.user) {
                    // Clear guest mode when logging in
                    localStorage.removeItem(GUEST_STORAGE_KEY)
                    setIsGuest(false)
                    await fetchProfile(session.user.id)
                } else {
                    setProfile(null)
                }

                setLoading(false)
            }
        )

        return () => {
            subscription.unsubscribe()
        }
    }, [])

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
            updateGuestData
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
