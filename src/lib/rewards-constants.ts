// Official Microsoft Rewards Constants (Brazil) based on 2024/2025 data

export const REWARDS_DEFAULTS = {
    SEARCH_POINTS_PER_SEARCH: 3,
}

export const REWARDS_LIMITS = {
    LEVEL_1: {
        PC_SEARCH: 33, // 11 searches * 3
        MOBILE_SEARCH: 0,
    },
    LEVEL_2: {
        PC_SEARCH: 90, // 30 searches * 3
        MOBILE_SEARCH: 60, // 20 searches * 3
    },
    BONUSES: {
        JEWEL: 13, // Average (levels vary 5, 10, 30 etc, 13 is a safe avg)
        PLAY_PC_GAME: 10, // Base
        USE_XBOX_APP: 5, // Check-in
        DAILY_SET: 30, // Minimum average (10+10+10 usually)
        READ_NEWS: 30, // Start app / Read news
        XBOX_WEEKLY_CONSISTENCY: 100, // Normalized to daily approx ~14 but tracked separately
    }
}

export const ACTIVITIES_LIST = [
    { id: 'pc_search', label: 'Buscas no PC', points: 90, type: 'search', limit_l1: 33, limit_l2: 90 },
    { id: 'mobile_search', label: 'Buscas Mobile', points: 60, type: 'search', limit_l1: 0, limit_l2: 60 },
    { id: 'daily_set', label: 'Conjunto Diário', points: 30, type: 'daily' },
    { id: 'xbox_app_checkin', label: 'Usar Aplicativo Xbox', points: 2, type: 'xbox' },
    { id: 'play_pc_game', label: 'Jogar um jogo para PC', points: 5, type: 'xbox' },
    { id: 'play_console_game', label: 'Jogar um jogo no console', points: 5, type: 'xbox' },
    { id: 'jewel', label: 'Jogar Jewel', points: 5, type: 'xbox' },
    { id: 'read_news', label: 'Ler Notícias (Start)', points: 30, type: 'other' },
    // Game Pass Quests
    { id: 'gp_weekly_streak', label: 'Quest Semanal (5 Dias)', points: 40, type: 'gamepass' },
    { id: 'gp_monthly_4', label: 'Quest Mensal (4 Jogos)', points: 40, type: 'gamepass' },
    { id: 'gp_monthly_8', label: 'Quest Mensal (8 Jogos)', points: 280, type: 'gamepass' },
] as const

export type ActivityId = typeof ACTIVITIES_LIST[number]['id']
