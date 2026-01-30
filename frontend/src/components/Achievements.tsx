import { useState, useEffect } from 'react';
import { Card, Text, Stack, Badge, ThemeIcon, Title, useMantineColorScheme, Box, SimpleGrid, Group, Progress } from '@mantine/core';
import { IconTrophy, IconStar, IconFlame, IconTarget, IconMedal, IconAward, IconCrown, IconDiamond } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { supabase } from '../supabaseClient';
import { updateStats } from '../utils/stats';
import { notifications } from '@mantine/notifications';




const ACHIEVEMENT_CONFIG = [
    { id: 1, key: 'streak', goal: 7, title: '7-Day Streak', desc: 'Logged mood for 7 consecutive days', icon: IconFlame, color: 'orange' },
    { id: 2, key: 'meditations', goal: 10, title: 'Meditation Master', desc: 'Completed 10 meditation sessions', icon: IconStar, color: 'yellow' },
    { id: 3, key: 'focus_sessions', goal: 5, title: 'Focus Champion', desc: 'Completed 5 Pomodoro sessions', icon: IconTarget, color: 'blue' },
    { id: 4, key: 'features_used', goal: 6, title: 'Wellness Warrior', desc: 'Used all features at least once', icon: IconMedal, color: 'violet' },
    { id: 5, key: 'library_access', goal: 20, title: 'Study Sage', desc: 'Accessed Expert Library 20 times', icon: IconAward, color: 'teal' },
    { id: 6, key: 'zen_points', goal: 1000, title: 'Zen Master', desc: 'Reached 1000 Zen Points', icon: IconCrown, color: 'grape' },
    { id: 7, key: 'chat_messages', goal: 50, title: 'Swasth Sage', desc: 'Deeply interacted with Swasth AI', icon: IconCrown, color: 'indigo' },
    { id: 8, key: 'unique_moods', goal: 5, title: 'Mood Maestro', desc: 'Explored a wide range of emotions', icon: IconMedal, color: 'orange' },
    { id: 9, key: 'games_played', goal: 10, title: 'Arcade Champ', desc: 'Mastered student arcade games', icon: IconDiamond, color: 'cyan' },
    { id: 10, key: 'morning_sessions', goal: 5, title: 'Morning Glory', desc: 'Mindful start before 9 AM', icon: IconStar, color: 'yellow' },
    { id: 11, key: 'night_sessions', goal: 5, title: 'Night Owl', desc: 'Late night focus sessions', icon: IconDiamond, color: 'violet' },
    { id: 12, key: 'zen_points', goal: 5000, title: 'Zen Legend', desc: 'Reached 5000 Zen Points', icon: IconTrophy, color: 'gold' },
];

export function Achievements() {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const [stats, setStats] = useState<any>({
        streak: 0,
        meditations: 0,
        focus_sessions: 0,
        features_used: [],
        library_access: 0,
        zen_points: 0,
        chat_messages: 0,
        unique_moods: [],
        games_played: 0,
        morning_sessions: 0,
        night_sessions: 0,
        badges: []
    });

    useEffect(() => {
        const loadStats = () => {
            const saved = localStorage.getItem('swasth_stats');
            if (saved) {
                setStats(JSON.parse(saved));
            }
        };

        const loadHistory = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch from login_history
            const { data: loginData } = await supabase
                .from('login_history')
                .select('login_at')
                .eq('user_id', user.id);

            // Fetch from moods
            const { data: moodData } = await supabase
                .from('moods')
                .select('timestamp')
                .eq('user_id', user.id);

            const allDates: string[] = [];
            if (loginData) loginData.forEach(l => allDates.push(l.login_at));
            if (moodData) moodData.forEach(m => allDates.push(m.timestamp));

            if (allDates.length > 0) {
                calculateStreak(allDates);
            }
        };

        const calculateStreak = (dates: string[]) => {
            if (!dates || dates.length === 0) return;

            const uniqueDates = Array.from(new Set(dates.map(d =>
                new Date(d).toDateString()
            )));

            let streak = 0;
            const today = new Date();
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            const hasLoggedInToday = uniqueDates.includes(today.toDateString());
            const hasLoggedInYesterday = uniqueDates.includes(yesterday.toDateString());

            if (!hasLoggedInToday && !hasLoggedInYesterday) {
                updateStats('streak', 0, 'set');
                return;
            }

            let checkDate = hasLoggedInToday ? today : yesterday;

            while (uniqueDates.includes(checkDate.toDateString())) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            }

            updateStats('streak', streak, 'set');
        };

        loadStats();
        loadHistory();

        window.addEventListener('storage', loadStats);
        window.addEventListener('statsUpdated', loadStats);
        return () => {
            window.removeEventListener('storage', loadStats);
            window.removeEventListener('statsUpdated', loadStats);
        };
    }, []);

    const achievements = ACHIEVEMENT_CONFIG.map(config => {
        let current = 0;
        if (config.key === 'features_used') {
            current = (stats.features_used || []).length;
        } else if (config.key === 'unique_moods') {
            current = (stats.unique_moods || []).length;
        } else {
            current = stats[config.key] || 0;
        }

        const progress = Math.min(100, Math.floor((current / config.goal) * 100));
        const unlocked = progress >= 100;

        return {
            ...config,
            progress,
            unlocked
        };
    });

    // Award badges in a side effect
    useEffect(() => {
        achievements.forEach(achievement => {
            if (achievement.unlocked && stats.badges && !stats.badges.includes(achievement.title)) {
                const newBadges = [...stats.badges, achievement.title];
                updateStats('badges', newBadges, 'set');
                notifications.show({
                    title: 'New Badge Earned! 🏅',
                    message: `You've unlocked the "${achievement.title}" badge!`,
                    color: 'yellow',
                    icon: <IconTrophy size={18} />
                });
            }
        });
    }, [stats.badges, achievements]);

    const unlockedCount = achievements.filter(a => a.unlocked).length;

    return (
        <Stack gap="xl">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Card
                    radius="32px"
                    p="xl"
                    style={{
                        background: isDark
                            ? 'linear-gradient(135deg, rgba(250, 176, 5, 0.15) 0%, rgba(251, 146, 60, 0.15) 100%)'
                            : 'linear-gradient(135deg, rgba(250, 176, 5, 0.08) 0%, rgba(251, 146, 60, 0.08) 100%)',
                        border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(250, 176, 5, 0.2)',
                        boxShadow: '0 20px 60px -15px rgba(250, 176, 5, 0.3)'
                    }}
                    className="glass-panel"
                >
                    <Group justify="space-between" align="center">
                        <Group>
                            <ThemeIcon size={60} radius="xl" variant="gradient" gradient={{ from: 'yellow', to: 'orange' }}>
                                <IconTrophy size={32} />
                            </ThemeIcon>
                            <div>
                                <Title order={2} fw={900} c={isDark ? 'white' : 'orange.9'}>
                                    Your Achievements
                                </Title>
                                <Text c={isDark ? 'white' : 'black'} size="sm" fw={600}>
                                    Track your wellness journey milestones
                                </Text>
                            </div>
                        </Group>
                        <Badge size="xl" variant="gradient" gradient={{ from: 'yellow', to: 'orange' }} style={{ fontWeight: 800 }}>
                            {unlockedCount}/{achievements.length} Unlocked
                        </Badge>
                    </Group>
                </Card>
            </motion.div>

            {/* Achievements Grid */}
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xl">
                {achievements.map((achievement, index) => (
                    <motion.div
                        key={achievement.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1, duration: 0.4 }}
                        whileHover={{ scale: 1.05, y: -5 }}
                    >
                        <Card
                            radius="24px"
                            p="xl"
                            h="100%"
                            className="glass-panel"
                            style={{
                                border: achievement.unlocked
                                    ? `2px solid ${isDark ? 'rgba(250, 176, 5, 0.3)' : 'rgba(250, 176, 5, 0.4)'}`
                                    : `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                                opacity: achievement.unlocked ? 1 : 0.7,
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            {achievement.unlocked && (
                                <Box
                                    style={{
                                        position: 'absolute',
                                        top: -20,
                                        right: -20,
                                        width: 100,
                                        height: 100,
                                        background: 'radial-gradient(circle, rgba(250, 176, 5, 0.2) 0%, transparent 70%)',
                                        pointerEvents: 'none'
                                    }}
                                />
                            )}

                            <Stack align="center" gap="md">
                                <motion.div
                                    animate={achievement.unlocked ? {
                                        rotate: [0, -10, 10, -10, 0],
                                        scale: [1, 1.1, 1]
                                    } : {}}
                                    transition={{ duration: 0.5, delay: index * 0.1 + 0.5 }}
                                >
                                    <ThemeIcon
                                        size={80}
                                        radius="xl"
                                        variant={achievement.unlocked ? 'gradient' : 'light'}
                                        gradient={{ from: achievement.color, to: 'orange' }}
                                        color={achievement.color}
                                        style={{
                                            boxShadow: achievement.unlocked
                                                ? `0 10px 30px rgba(250, 176, 5, 0.4)`
                                                : 'none'
                                        }}
                                    >
                                        <achievement.icon size={40} />
                                    </ThemeIcon>
                                </motion.div>

                                <Stack gap={4} align="center">
                                    <Text fw={900} size="lg" ta="center">
                                        {achievement.title}
                                    </Text>
                                    <Text size="xs" c="dimmed" ta="center" fw={600}>
                                        {achievement.desc}
                                    </Text>
                                </Stack>

                                {!achievement.unlocked && (
                                    <Box w="100%">
                                        <Group justify="space-between" mb={4}>
                                            <Text size="xs" fw={700} c="dimmed">Progress</Text>
                                            <Text size="xs" fw={900} c={achievement.color}>{achievement.progress}%</Text>
                                        </Group>
                                        <Progress
                                            value={achievement.progress}
                                            color={achievement.color}
                                            size="md"
                                            radius="xl"
                                            striped
                                            animated
                                        />
                                    </Box>
                                )}

                                {achievement.unlocked && (
                                    <Badge
                                        variant="gradient"
                                        gradient={{ from: 'yellow', to: 'orange' }}
                                        size="lg"
                                        leftSection={<IconDiamond size={14} />}
                                        style={{ fontWeight: 800 }}
                                    >
                                        UNLOCKED
                                    </Badge>
                                )}
                            </Stack>
                        </Card>
                    </motion.div>
                ))}
            </SimpleGrid>

        </Stack>
    );
}
