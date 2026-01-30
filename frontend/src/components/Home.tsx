import { useState, useEffect } from 'react';
import { Grid, Card, Text, Group, Stack, Progress, ThemeIcon, Title, SimpleGrid, Loader, Button, Center, Badge, Box, useMantineColorScheme, ActionIcon, ScrollArea, Modal, rem } from '@mantine/core';
import { IconMoodSmile, IconFlower, IconBolt, IconChartBar, IconQuote, IconBook, IconArrowRight, IconHeart, IconHeartFilled, IconVideo, IconArticle, IconSparkles, IconTrophy, IconFlame, IconBrain, IconTarget, IconRocket } from '@tabler/icons-react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { supabase } from '../supabaseClient';
import { updateStats } from '../utils/stats';

const AFFIRMATIONS = [
    "I am capable of mastering complex subjects with patience. 📚",
    "My worth is not defined by my grades, but by my effort. ✨",
    "I find focus and clarity even when my schedule is busy. 🎯",
    "Rest is just as important as study time. I belong here. ❤️",
    "I am growing more resilient every single day. 💪",
    "I choose to tackle my goals one step at a time. 🌅",
];

const STUDENT_TIPS = [
    { id: 1, title: "Active Recall", desc: "Try explaining a concept without looking at your notes.", color: 'violet', icon: IconBrain },
    { id: 2, title: "Proper Rest", desc: "Even 15 mins of Meditation can reset your brain.", color: 'teal', icon: IconFlower },
    { id: 3, title: "Hydration", desc: "Your brain is 75% water - keep it fueled!", color: 'blue', icon: IconSparkles },
    { id: 4, title: "Spaced Repetition", desc: "Review material at increasing intervals to improve memory.", color: 'orange', icon: IconTarget },
    { id: 5, title: "Pomodoro Technique", desc: "Work for 25 mins, then take a 5 min break to stay fresh.", color: 'pink', icon: IconFlame },
    { id: 6, title: "Mnemonic Devices", desc: "Use acronyms or rhymes to memorize complex lists.", color: 'grape', icon: IconRocket },
    { id: 7, title: "Teach Others", desc: "Teaching a concept is the best way to master it yourself.", color: 'cyan', icon: IconTrophy },
    { id: 8, title: "Single-Tasking", desc: "Focus on one subject at a time to increase deep work efficiency.", color: 'indigo', icon: IconBolt },
];

const MEDITATION_ARTICLES = [
    { title: "The Science of Mindfulness", url: "https://www.mindful.org/the-science-of-mindfulness/" },
    { title: "Breathwork for Focus", url: "https://www.healthline.com/health/breathing-exercises-for-anxiety" },
    { title: "Mindfulness for Stress", url: "https://greatergood.berkeley.edu/article/item/how_mindfulness_helps_students_cope_with_stress" }
];

const MEDITATION_CLASSES = [
    { title: "5m Quick Focus (Lavendaire)", dur: "5m", url: "https://www.youtube.com/watch?v=inpok4MKVLM" },
    { title: "10m Mindful Noting (Headspace)", dur: "10m", url: "https://www.youtube.com/watch?v=U9YKY7fdwyg" },
    { title: "5m UCLA Breathing Tech", dur: "5m", url: "https://www.youtube.com/watch?v=nmFUDkj1Aq0" }
];

export function Home({ onStartAI }: { onStartAI?: () => void }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const [modalOpened, setModalOpened] = useState(false);
    const [likedTips, setLikedTips] = useState<number[]>(() => {
        try {
            const saved = localStorage.getItem('likedTips');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('likedTips', JSON.stringify(likedTips));
    }, [likedTips]);

    const toggleLike = (id: number) => {
        setLikedTips(prev => prev.includes(id) ? prev.filter(tId => tId !== id) : [...prev, id]);
    };

    const [stats, setStats] = useState({
        latestMood: 'No logs',
        meditationMins: 0,
        zenPoints: 0,
        streak: 0,
        moodDistribution: { positive: 0, neutral: 0, negative: 0 }
    });
    const [userEmail, setUserEmail] = useState('');
    const [affirmation, setAffirmation] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setAffirmation(AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)]);

        const loadStats = () => {
            const saved = localStorage.getItem('swasth_stats');
            if (saved) {
                const s = JSON.parse(saved);

                const moods = s.unique_moods || [];
                const total = moods.length || 1;
                const posCount = moods.filter((m: string) => ['Awesome', 'Good'].includes(m)).length;
                const negCount = moods.filter((m: string) => ['Bad', 'Awful'].includes(m)).length;
                const neuCount = total - posCount - negCount;

                setStats({
                    latestMood: moods[moods.length - 1] || 'No logs',
                    meditationMins: s.meditations * 15,
                    zenPoints: s.zen_points || 0,
                    streak: s.streak || 0,
                    moodDistribution: {
                        positive: Math.round((posCount / total) * 100),
                        neutral: Math.round((neuCount / total) * 100),
                        negative: Math.round((negCount / total) * 100)
                    }
                });
            }
        };

        const loadHistory = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: loginData } = await supabase
                .from('login_history')
                .select('login_at')
                .eq('user_id', user.id);

            const { data: moodData } = await supabase
                .from('moods')
                .select('timestamp, mood')
                .eq('user_id', user.id);

            const allDates: string[] = [];
            if (loginData) loginData.forEach(l => allDates.push(l.login_at));
            if (moodData) {
                moodData.forEach(m => allDates.push(m.timestamp));

                if (moodData.length > 0) {
                    const sortedMoods = [...moodData].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                    const latest = sortedMoods[0].mood;

                    const total = moodData.length;
                    const posCount = moodData.filter((m: any) => ['Awesome', 'Good'].includes(m.mood)).length;
                    const negCount = moodData.filter((m: any) => ['Bad', 'Awful'].includes(m.mood)).length;
                    const neuCount = total - posCount - negCount;

                    setStats(prev => ({
                        ...prev,
                        latestMood: latest,
                        moodDistribution: {
                            positive: Math.round((posCount / total) * 100),
                            neutral: Math.round((neuCount / total) * 100),
                            negative: Math.round((negCount / total) * 100)
                        }
                    }));
                }
            }

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

        const fetchUser = async () => {
            const { data } = await supabase.auth.getUser();
            if (data?.user) {
                const displayName = data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Explorer';
                setUserEmail(displayName);
            }
        };

        loadStats();
        loadHistory();
        fetchUser().finally(() => setLoading(false));

        window.addEventListener('statsUpdated', loadStats);
        window.addEventListener('storage', loadStats);

        return () => {
            window.removeEventListener('statsUpdated', loadStats);
            window.removeEventListener('storage', loadStats);
        };
    }, []);

    const greetingName = userEmail || 'Explorer';

    if (loading && !userEmail) return (
        <Center h="100dvh" w="100%">
            <Loader color="violet" size="xl" variant="dots" />
        </Center>
    );

    const cardVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.1,
                duration: 0.5
            }
        })
    };

    return (
        <AnimatePresence mode="popLayout">
            <Stack gap="xl" key="home-stack">
                {/* Hero Section */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={cardVariants}
                    custom={0}
                >
                    <Card
                        radius="32px"
                        p="xl"
                        style={{
                            background: isDark
                                ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(59, 130, 246, 0.15) 50%, rgba(236, 72, 153, 0.2) 100%)'
                                : 'linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(59, 130, 246, 0.08) 50%, rgba(236, 72, 153, 0.12) 100%)',
                            border: 'none',
                            boxShadow: isDark
                                ? '0 20px 60px -15px rgba(139, 92, 246, 0.5)'
                                : '0 20px 60px -15px rgba(139, 92, 246, 0.3)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Animated Background Orbs */}
                        <Box
                            style={{
                                position: 'absolute',
                                top: -100,
                                right: -100,
                                width: 300,
                                height: 300,
                                borderRadius: '50%',
                                background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)',
                                filter: 'blur(60px)',
                                animation: 'float 6s ease-in-out infinite'
                            }}
                        />
                        <Box
                            style={{
                                position: 'absolute',
                                bottom: -80,
                                left: -80,
                                width: 250,
                                height: 250,
                                borderRadius: '50%',
                                background: 'radial-gradient(circle, rgba(236, 72, 153, 0.4) 0%, transparent 70%)',
                                filter: 'blur(60px)',
                                animation: 'float 6s ease-in-out infinite 3s'
                            }}
                        />

                        <Grid align="center" gutter="xl" style={{ position: 'relative', zIndex: 1 }}>
                            <Grid.Col span={{ base: 12, md: 8 }}>
                                <Stack gap="lg">
                                    <Group gap="sm">
                                        <motion.div
                                            animate={{
                                                rotate: [0, 10, -10, 0],
                                                scale: [1, 1.1, 1]
                                            }}
                                            transition={{
                                                duration: 3,
                                                repeat: Infinity,
                                                repeatDelay: 2
                                            }}
                                        >
                                            <ThemeIcon
                                                size={60}
                                                radius="xl"
                                                variant="gradient"
                                                gradient={{ from: 'violet', to: 'pink', deg: 45 }}
                                                style={{
                                                    boxShadow: '0 8px 24px rgba(139, 92, 246, 0.5)'
                                                }}
                                            >
                                                <IconSparkles size={30} stroke={2.5} />
                                            </ThemeIcon>
                                        </motion.div>
                                        <Badge
                                            variant="gradient"
                                            gradient={{ from: 'violet', to: 'pink' }}
                                            size="lg"
                                            radius="md"
                                            style={{ fontWeight: 800, letterSpacing: '1px' }}
                                        >
                                            STUDENT WELLNESS HUB
                                        </Badge>
                                    </Group>

                                    <Title
                                        order={1}
                                        fw={900}
                                        style={{
                                            fontSize: rem(48),
                                            letterSpacing: '-2px',
                                            lineHeight: 1.1,
                                            background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            backgroundClip: 'text'
                                        }}
                                    >
                                        Welcome back, {greetingName}! ✨
                                    </Title>

                                    <Text fw={600} size="lg" c={isDark ? 'gray.3' : 'gray.7'} maw={600}>
                                        Your personalized mental wellness companion for academic success. Track your progress, discover resources, and thrive.
                                    </Text>

                                    <Group mt="md">
                                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                            <Button
                                                size="lg"
                                                radius="xl"
                                                variant="gradient"
                                                gradient={{ from: 'violet', to: 'pink' }}
                                                rightSection={<IconArrowRight size={20} stroke={2.5} />}
                                                onClick={onStartAI}
                                                style={{
                                                    boxShadow: '0 8px 24px rgba(139, 92, 246, 0.4)',
                                                    fontWeight: 800
                                                }}
                                            >
                                                Talk to Swasth AI
                                            </Button>
                                        </motion.div>
                                    </Group>
                                </Stack>
                            </Grid.Col>

                            <Grid.Col span={{ base: 12, md: 4 }}>
                                <Card
                                    radius="24px"
                                    p="xl"
                                    style={{
                                        background: isDark
                                            ? 'rgba(255, 255, 255, 0.05)'
                                            : 'rgba(255, 255, 255, 0.9)',
                                        backdropFilter: 'blur(20px)',
                                        border: isDark
                                            ? '1px solid rgba(255, 255, 255, 0.1)'
                                            : '1px solid rgba(139, 92, 246, 0.2)'
                                    }}
                                >
                                    <Stack gap="md">
                                        <Group gap="sm">
                                            <ThemeIcon variant="light" color="violet" size="md" radius="xl">
                                                <IconQuote size={16} stroke={2.5} />
                                            </ThemeIcon>
                                            <Text size="xs" fw={900} tt="uppercase" c="violet">
                                                Daily Affirmation
                                            </Text>
                                        </Group>
                                        <Text fw={700} size="md" style={{ fontStyle: 'italic', lineHeight: 1.6 }}>
                                            "{affirmation}"
                                        </Text>
                                    </Stack>
                                </Card>
                            </Grid.Col>
                        </Grid>
                    </Card>
                </motion.div>

                {/* Stats Cards */}
                <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="xl">
                    {[
                        { label: 'Latest Mood', value: stats.latestMood, icon: IconMoodSmile, color: 'pink', gradient: { from: 'pink', to: 'rose' } },
                        { label: 'Focus Time', value: `${stats.meditationMins}m`, icon: IconFlower, color: 'teal', gradient: { from: 'teal', to: 'cyan' } },
                        { label: 'Zen Points', value: stats.zenPoints, icon: IconTrophy, color: 'yellow', gradient: { from: 'yellow', to: 'orange' } },
                        { label: 'Streak', value: `${stats.streak}d`, icon: IconFlame, color: 'orange', gradient: { from: 'orange', to: 'red' } }
                    ].map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial="hidden"
                            animate="visible"
                            variants={cardVariants}
                            custom={i + 1}
                            whileHover={{ y: -8, transition: { duration: 0.2 } }}
                        >
                            <Card
                                radius="24px"
                                p="xl"
                                h="100%"
                                style={{
                                    background: isDark
                                        ? `linear-gradient(135deg, rgba(${getColorRGB(stat.color)}, 0.15) 0%, transparent 100%)`
                                        : `linear-gradient(135deg, rgba(${getColorRGB(stat.color)}, 0.08) 0%, transparent 100%)`,
                                    border: isDark
                                        ? `1px solid rgba(${getColorRGB(stat.color)}, 0.3)`
                                        : `1px solid rgba(${getColorRGB(stat.color)}, 0.2)`,
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                <Box
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        height: '4px',
                                        background: `linear-gradient(90deg, var(--mantine-color-${stat.color}-6), var(--mantine-color-${stat.color}-4))`
                                    }}
                                />
                                <Stack align="center" gap="md">
                                    <ThemeIcon
                                        size={70}
                                        radius="xl"
                                        variant="gradient"
                                        gradient={stat.gradient}
                                        style={{
                                            boxShadow: `0 8px 24px rgba(${getColorRGB(stat.color)}, 0.4)`
                                        }}
                                    >
                                        <stat.icon size={32} stroke={2.5} />
                                    </ThemeIcon>
                                    <Stack align="center" gap={4}>
                                        <Text size="xs" fw={900} tt="uppercase" c="dimmed" style={{ letterSpacing: '1px' }}>
                                            {stat.label}
                                        </Text>
                                        <Text size={rem(28)} fw={900} style={{ lineHeight: 1 }}>
                                            {stat.value}
                                        </Text>
                                    </Stack>
                                </Stack>
                            </Card>
                        </motion.div>
                    ))}
                </SimpleGrid>

                {/* Wellness Progress & Study Tips */}
                <Grid gutter="xl">
                    <Grid.Col span={{ base: 12, md: 7 }}>
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={cardVariants}
                            custom={5}
                        >
                            <Card
                                radius="32px"
                                p="xl"
                                h="100%"
                                style={{
                                    background: isDark
                                        ? 'rgba(255, 255, 255, 0.03)'
                                        : 'rgba(255, 255, 255, 0.6)',
                                    backdropFilter: 'blur(10px)',
                                    border: isDark
                                        ? '1px solid rgba(255, 255, 255, 0.05)'
                                        : '1px solid rgba(0, 0, 0, 0.05)'
                                }}
                            >
                                <Group mb="xl">
                                    <ThemeIcon color="violet" variant="light" size="lg" radius="xl">
                                        <IconChartBar size={24} stroke={2.5} />
                                    </ThemeIcon>
                                    <Text fw={900} size="xl">Wellness Metrics</Text>
                                </Group>
                                <Stack gap="xl">
                                    {[
                                        { label: 'Academic Confidence', value: stats.moodDistribution.positive, color: 'teal', icon: IconTarget },
                                        { label: 'Social Balance', value: stats.moodDistribution.neutral, color: 'cyan', icon: IconHeart },
                                        { label: 'Stress Management', value: stats.moodDistribution.negative, color: 'pink', icon: IconBrain }
                                    ].map((bar, i) => (
                                        <div key={i}>
                                            <Group justify="space-between" mb="xs">
                                                <Group gap="xs">
                                                    <bar.icon size={18} color={`var(--mantine-color-${bar.color}-6)`} stroke={2.5} />
                                                    <Text fw={800} size="sm">{bar.label}</Text>
                                                </Group>
                                                <Badge variant="light" color={bar.color} size="lg" style={{ fontWeight: 900 }}>
                                                    {bar.value}%
                                                </Badge>
                                            </Group>
                                            <Progress
                                                value={bar.value}
                                                color={bar.color}
                                                size="xl"
                                                radius="xl"
                                                striped
                                                animated
                                                style={{
                                                    boxShadow: `0 4px 12px rgba(${getColorRGB(bar.color)}, 0.2)`
                                                }}
                                            />
                                        </div>
                                    ))}
                                </Stack>
                            </Card>
                        </motion.div>
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, md: 5 }}>
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={cardVariants}
                            custom={6}
                        >
                            <Card
                                radius="32px"
                                p="xl"
                                h="100%"
                                style={{
                                    background: isDark
                                        ? 'rgba(255, 255, 255, 0.03)'
                                        : 'rgba(255, 255, 255, 0.6)',
                                    backdropFilter: 'blur(10px)',
                                    border: isDark
                                        ? '1px solid rgba(255, 255, 255, 0.05)'
                                        : '1px solid rgba(0, 0, 0, 0.05)'
                                }}
                            >
                                <Group mb="xl" justify="space-between">
                                    <Group gap="sm">
                                        <ThemeIcon color="indigo" variant="light" size="lg" radius="xl">
                                            <IconBook size={24} stroke={2.5} />
                                        </ThemeIcon>
                                        <Text fw={900} size="xl">Study Tips</Text>
                                    </Group>
                                    <motion.div whileTap={{ scale: 0.9 }}>
                                        <ActionIcon
                                            variant="light"
                                            color="violet"
                                            size="lg"
                                            radius="xl"
                                            onClick={() => setModalOpened(true)}
                                        >
                                            <IconArrowRight size={20} stroke={2.5} />
                                        </ActionIcon>
                                    </motion.div>
                                </Group>
                                <Stack gap="sm">
                                    {STUDENT_TIPS.slice(0, 4).map((tip) => (
                                        <motion.div
                                            key={tip.id}
                                            whileHover={{ x: 4 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <Box
                                                p="md"
                                                style={{
                                                    background: isDark
                                                        ? `linear-gradient(135deg, rgba(${getColorRGB(tip.color)}, 0.1) 0%, transparent 100%)`
                                                        : `linear-gradient(135deg, rgba(${getColorRGB(tip.color)}, 0.05) 0%, transparent 100%)`,
                                                    borderRadius: '16px',
                                                    border: isDark
                                                        ? `1px solid rgba(${getColorRGB(tip.color)}, 0.2)`
                                                        : `1px solid rgba(${getColorRGB(tip.color)}, 0.15)`
                                                }}
                                            >
                                                <Group justify="space-between" wrap="nowrap">
                                                    <Group gap="sm">
                                                        <ThemeIcon variant="light" color={tip.color} size="md" radius="xl">
                                                            <tip.icon size={16} stroke={2.5} />
                                                        </ThemeIcon>
                                                        <Text fw={800} size="sm">{tip.title}</Text>
                                                    </Group>
                                                    <motion.div whileTap={{ scale: 0.8 }}>
                                                        <ActionIcon
                                                            variant="subtle"
                                                            size="sm"
                                                            color={likedTips.includes(tip.id) ? 'red' : 'gray'}
                                                            onClick={() => toggleLike(tip.id)}
                                                        >
                                                            {likedTips.includes(tip.id) ? <IconHeartFilled size={16} /> : <IconHeart size={16} />}
                                                        </ActionIcon>
                                                    </motion.div>
                                                </Group>
                                            </Box>
                                        </motion.div>
                                    ))}
                                </Stack>
                            </Card>
                        </motion.div>
                    </Grid.Col>
                </Grid>

                {/* Meditation Corner */}
                <Grid gutter="xl">
                    <Grid.Col span={12}>
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={cardVariants}
                            custom={7}
                        >
                            <Card
                                radius="32px"
                                p="xl"
                                style={{
                                    background: isDark
                                        ? 'linear-gradient(135deg, rgba(20, 184, 166, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)'
                                        : 'linear-gradient(135deg, rgba(20, 184, 166, 0.08) 0%, rgba(6, 182, 212, 0.08) 100%)',
                                    border: isDark
                                        ? '1px solid rgba(20, 184, 166, 0.3)'
                                        : '1px solid rgba(20, 184, 166, 0.2)',
                                    boxShadow: '0 20px 60px -15px rgba(20, 184, 166, 0.3)'
                                }}
                            >
                                <Group mb="md" justify="space-between">
                                    <Group>
                                        <ThemeIcon color="teal" variant="light" size="lg" radius="xl">
                                            <IconFlower size={28} stroke={2.5} />
                                        </ThemeIcon>
                                        <div>
                                            <Text fw={900} size="xl">Meditation Corner</Text>
                                            <Text size="sm" c="dimmed" fw={600}>Center your mind, restore your focus</Text>
                                        </div>
                                    </Group>
                                    <Badge color="teal" variant="dot" size="lg" style={{ fontWeight: 800 }}>
                                        LIVE NOW
                                    </Badge>
                                </Group>

                                <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl" mt="xl">
                                    <Stack gap="md">
                                        <Group gap="xs">
                                            <IconArticle size={18} color="var(--mantine-color-teal-6)" stroke={2.5} />
                                            <Text fw={800} size="sm" tt="uppercase" c="teal.7">Recommended Articles</Text>
                                        </Group>
                                        <Stack gap="xs">
                                            {MEDITATION_ARTICLES.map((art, idx) => (
                                                <motion.div key={idx} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                                    <Button
                                                        component="a"
                                                        href={art.url}
                                                        target="_blank"
                                                        variant="light"
                                                        color="teal"
                                                        fullWidth
                                                        justify="space-between"
                                                        rightSection={<IconArrowRight size={16} stroke={2.5} />}
                                                        radius="xl"
                                                        size="md"
                                                        style={{ fontWeight: 700 }}
                                                    >
                                                        {art.title}
                                                    </Button>
                                                </motion.div>
                                            ))}
                                        </Stack>
                                    </Stack>

                                    <Stack gap="md">
                                        <Group gap="xs">
                                            <IconVideo size={18} color="var(--mantine-color-indigo-6)" stroke={2.5} />
                                            <Text fw={800} size="sm" tt="uppercase" c="indigo.7">Virtual Classes</Text>
                                        </Group>
                                        <Stack gap="xs">
                                            {MEDITATION_CLASSES.map((cls, idx) => (
                                                <motion.div key={idx} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                                    <Button
                                                        component="a"
                                                        href={cls.url}
                                                        target="_blank"
                                                        variant="light"
                                                        color="indigo"
                                                        fullWidth
                                                        justify="space-between"
                                                        rightSection={<Badge size="sm" color="indigo" variant="outline" style={{ fontWeight: 800 }}>{cls.dur}</Badge>}
                                                        radius="xl"
                                                        size="md"
                                                        style={{ fontWeight: 700 }}
                                                    >
                                                        {cls.title}
                                                    </Button>
                                                </motion.div>
                                            ))}
                                        </Stack>
                                    </Stack>
                                </SimpleGrid>
                            </Card>
                        </motion.div>
                    </Grid.Col>
                </Grid>

                {/* Study Tips Modal */}
                <Modal
                    opened={modalOpened}
                    onClose={() => setModalOpened(false)}
                    title={<Text fw={900} size="xl">All Study Tips</Text>}
                    radius="32px"
                    size="lg"
                    padding="xl"
                >
                    <ScrollArea.Autosize mah="70vh" offsetScrollbars>
                        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                            {STUDENT_TIPS.map((tip) => (
                                <Card
                                    key={tip.id}
                                    radius="lg"
                                    p="lg"
                                    style={{
                                        background: isDark
                                            ? `linear-gradient(135deg, rgba(${getColorRGB(tip.color)}, 0.1) 0%, transparent 100%)`
                                            : `linear-gradient(135deg, rgba(${getColorRGB(tip.color)}, 0.05) 0%, transparent 100%)`,
                                        border: isDark
                                            ? `1px solid rgba(${getColorRGB(tip.color)}, 0.2)`
                                            : `1px solid rgba(${getColorRGB(tip.color)}, 0.15)`
                                    }}
                                >
                                    <Group justify="space-between" mb="xs">
                                        <Badge color={tip.color} variant="light" size="lg" style={{ fontWeight: 800 }}>
                                            {tip.title}
                                        </Badge>
                                        <ActionIcon
                                            variant="subtle"
                                            color={likedTips.includes(tip.id) ? 'red' : 'gray'}
                                            onClick={() => toggleLike(tip.id)}
                                        >
                                            {likedTips.includes(tip.id) ? <IconHeartFilled size={18} /> : <IconHeart size={18} />}
                                        </ActionIcon>
                                    </Group>
                                    <Text size="sm" fw={600}>{tip.desc}</Text>
                                </Card>
                            ))}
                        </SimpleGrid>
                    </ScrollArea.Autosize>
                </Modal>

                <style>
                    {`
                        @keyframes float {
                            0%, 100% { transform: translate(0, 0) scale(1); }
                            50% { transform: translate(20px, -20px) scale(1.1); }
                        }
                    `}
                </style>
            </Stack>
        </AnimatePresence>
    );
}

// Helper function to get RGB values for colors
function getColorRGB(color: string): string {
    const colorMap: { [key: string]: string } = {
        violet: '139, 92, 246',
        blue: '59, 130, 246',
        green: '34, 197, 94',
        indigo: '99, 102, 241',
        red: '239, 68, 68',
        yellow: '234, 179, 8',
        orange: '249, 115, 22',
        cyan: '6, 182, 212',
        pink: '236, 72, 153',
        teal: '20, 184, 166',
        grape: '168, 85, 247',
        lime: '132, 204, 22',
        rose: '244, 63, 94'
    };
    return colorMap[color] || '139, 92, 246';
}
