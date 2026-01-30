export const updateStats = (key: string, value: number | string | any, mode: 'increment' | 'set' | 'push' = 'increment') => {
    const saved = localStorage.getItem('swasth_stats');
    let stats = saved ? JSON.parse(saved) : {
        streak: 0,
        meditations: 0,
        focus_sessions: 0,
        features_used: [],
        library_access: 0,
        zen_points: 0,
        badges: [],
        chat_messages: 0,
        unique_moods: [],
        games_played: 0,
        morning_sessions: 0,
        night_sessions: 0
    };

    if (mode === 'increment') {
        stats[key] = (stats[key] || 0) + (value as number);
    } else if (mode === 'set') {
        stats[key] = value;
    } else if (mode === 'push') {
        if (!stats[key]) stats[key] = [];
        if (!stats[key].includes(value)) {
            stats[key].push(value);
        }
    }

    localStorage.setItem('swasth_stats', JSON.stringify(stats));
    window.dispatchEvent(new Event('statsUpdated'));
};
