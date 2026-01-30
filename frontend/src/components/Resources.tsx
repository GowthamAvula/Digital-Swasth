import { Card, Text, Stack, TextInput, Badge, Group, ThemeIcon, Title, useMantineColorScheme, SimpleGrid, Anchor, ActionIcon, Box, Tabs, rem, Center } from '@mantine/core';
import { IconBook, IconSearch, IconBookmark, IconExternalLink, IconClock, IconBrain, IconRocket, IconHeart, IconLifebuoy, IconSparkles, IconTrendingUp, IconBookmarkFilled } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { updateStats } from '../utils/stats';

interface Resource {
    id: number;
    title: string;
    category: string;
    readTime: string;
    color: string;
    desc: string;
    url: string;
}

const RESOURCES: Resource[] = [
    {
        id: 1,
        title: 'Managing Academic Stress',
        category: 'Mental Health',
        readTime: '5 min',
        color: 'violet',
        desc: 'Evidence-based techniques to handle exam pressure and academic anxiety.',
        url: 'https://www.health.harvard.edu/blog/stating-the-obvious-academic-stress-is-taking-a-toll-on-students-202311272995'
    },
    {
        id: 2,
        title: 'Harvard Study Hacks',
        category: 'Productivity',
        readTime: '8 min',
        color: 'blue',
        desc: '8 top-tier strategies used by successful students to master complex subjects.',
        url: 'https://learningcenter.unc.edu/tips-and-tools/studying-101-study-smarter-not-harder/'
    },
    {
        id: 3,
        title: 'Brain Power Nutrition',
        category: 'Wellness',
        readTime: '6 min',
        color: 'green',
        desc: 'The best foods to fuel your brain for long study sessions and mental clarity.',
        url: 'https://www.health.harvard.edu/mind-and-mood/boost-your-memory-with-a-better-diet'
    },
    {
        id: 4,
        title: 'Mastering Sleep Hygiene',
        category: 'Wellness',
        readTime: '10 min',
        color: 'indigo',
        desc: 'How to fix your sleep schedule for better retention and daytime energy.',
        url: 'https://www.sleepfoundation.org/sleep-hygiene'
    },
    {
        id: 5,
        title: 'Overcoming Exam Anxiety',
        category: 'Mental Health',
        readTime: '7 min',
        color: 'red',
        desc: 'Psychological strategies to stay calm and perform your best under pressure.',
        url: 'https://www.mayoclinic.org/diseases-conditions/generalized-anxiety-disorder/expert-answers/test-anxiety/faq-20058195'
    },
    {
        id: 6,
        title: 'Healthy Eating for Students',
        category: 'Wellness',
        readTime: '5 min',
        color: 'yellow',
        desc: 'Quick, nutritious meal ideas for busy college students on a budget.',
        url: 'https://www.hsph.harvard.edu/nutritionsource/healthy-eating-plate/'
    },
    {
        id: 7,
        title: 'Active Learning Techniques',
        category: 'Productivity',
        readTime: '8 min',
        color: 'orange',
        desc: 'Engage deeply with your study material for better long-term retention.',
        url: 'https://cft.vanderbilt.edu/active-learning/'
    },
    {
        id: 8,
        title: 'The Pomodoro Technique',
        category: 'Productivity',
        readTime: '4 min',
        color: 'cyan',
        desc: 'Master your focus with 25-minute intervals and restorative breaks.',
        url: 'https://todoist.com/productivity-methods/pomodoro-technique'
    },
    {
        id: 9,
        title: 'Coping with Loneliness',
        category: 'Mental Health',
        readTime: '6 min',
        color: 'pink',
        desc: 'How to handle feelings of isolation and build meaningful connections.',
        url: 'https://www.mentalhealth.org.uk/explore-mental-health/a-z-topics/loneliness'
    },
    {
        id: 10,
        title: 'The Science of Exercise',
        category: 'Wellness',
        readTime: '7 min',
        color: 'teal',
        desc: 'How physical activity boosts cognitive function and lowers stress.',
        url: 'https://www.apa.org/topics/exercise-fitness/stress'
    },
    {
        id: 11,
        title: 'Building Resilience',
        category: 'Mental Health',
        readTime: '9 min',
        color: 'grape',
        desc: 'Developing the mental toughness to bounce back from academic setbacks.',
        url: 'https://www.apa.org/topics/resilience'
    },
    {
        id: 12,
        title: '24/7 National Helplines',
        category: 'Support',
        readTime: '2 min',
        color: 'red',
        desc: 'Immediate mental health support for students in India (Tele-MANAS).',
        url: 'https://telemanas.mohfw.gov.in/#/home'
    },
    {
        id: 13,
        title: 'Digital Wellbeing',
        category: 'Wellness',
        readTime: '6 min',
        color: 'blue',
        desc: 'How to manage screen time and reduce digital eye strain.',
        url: 'https://wellbeing.google/'
    },
    {
        id: 14,
        title: 'Growth Mindset Study',
        category: 'Productivity',
        readTime: '8 min',
        color: 'lime',
        desc: 'Embracing challenges to unlock your true academic potential.',
        url: 'https://www.mindsetworks.com/science/'
    },
    {
        id: 15,
        title: 'Social Anxiety Guide',
        category: 'Mental Health',
        readTime: '10 min',
        color: 'orange',
        desc: 'Navigating social situations in college with confidence.',
        url: 'https://www.nimh.nih.gov/health/publications/social-anxiety-disorder-more-than-just-shyness'
    },
    {
        id: 16,
        title: 'Art of Mindfulness',
        category: 'Wellness',
        readTime: '5 min',
        color: 'cyan',
        desc: 'Simple mindfulness practices for a calmer, more focused life.',
        url: 'https://www.mindful.org/meditation/mindfulness-getting-started/'
    },
    {
        id: 17,
        title: 'Goal Setting Mastery',
        category: 'Productivity',
        readTime: '7 min',
        color: 'indigo',
        desc: 'How to set and achieve meaningful academic and personal goals.',
        url: 'https://positivapsychology.com/goal-setting/'
    },
    {
        id: 18,
        title: 'Reducing Financial Stress',
        category: 'Support',
        readTime: '6 min',
        color: 'green',
        desc: 'Practical tips for managing student budgets and financial anxiety.',
        url: 'https://www.nerdwallet.com/article/finance/how-to-manage-financial-stress'
    }
];

const CATEGORIES = [
    { value: 'all', label: 'All Resources', icon: IconSparkles, color: 'violet' },
    { value: 'Mental Health', label: 'Mental Health', icon: IconBrain, color: 'pink' },
    { value: 'Productivity', label: 'Productivity', icon: IconRocket, color: 'blue' },
    { value: 'Wellness', label: 'Wellness', icon: IconHeart, color: 'teal' },
    { value: 'Support', label: 'Support', icon: IconLifebuoy, color: 'red' }
];

export function Resources() {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [bookmarked, setBookmarked] = useState<number[]>([]);

    const filteredResources = RESOURCES.filter(resource => {
        const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            resource.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            resource.desc.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === 'all' || resource.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const toggleBookmark = (id: number) => {
        setBookmarked(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    return (
        <Stack gap="xl">
            {/* Hero Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <Card
                    radius="32px"
                    p="xl"
                    style={{
                        background: isDark
                            ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(59, 130, 246, 0.2) 50%, rgba(236, 72, 153, 0.2) 100%)'
                            : 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 50%, rgba(236, 72, 153, 0.1) 100%)',
                        border: 'none',
                        boxShadow: isDark
                            ? '0 20px 60px -15px rgba(139, 92, 246, 0.4)'
                            : '0 20px 60px -15px rgba(139, 92, 246, 0.25)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    {/* Animated Background Elements */}
                    <Box
                        style={{
                            position: 'absolute',
                            top: -50,
                            right: -50,
                            width: 200,
                            height: 200,
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
                            filter: 'blur(40px)',
                            animation: 'pulse 4s ease-in-out infinite'
                        }}
                    />
                    <Box
                        style={{
                            position: 'absolute',
                            bottom: -30,
                            left: -30,
                            width: 150,
                            height: 150,
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, rgba(236, 72, 153, 0.3) 0%, transparent 70%)',
                            filter: 'blur(40px)',
                            animation: 'pulse 4s ease-in-out infinite 2s'
                        }}
                    />

                    <Stack gap="lg" style={{ position: 'relative', zIndex: 1 }}>
                        <Group>
                            <motion.div
                                animate={{
                                    rotate: [0, 5, -5, 0],
                                    scale: [1, 1.05, 1]
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    repeatDelay: 2
                                }}
                            >
                                <ThemeIcon
                                    size={70}
                                    radius="xl"
                                    variant="gradient"
                                    gradient={{ from: 'violet', to: 'pink', deg: 45 }}
                                    style={{
                                        boxShadow: '0 8px 24px rgba(139, 92, 246, 0.4)'
                                    }}
                                >
                                    <IconBook size={36} stroke={2} />
                                </ThemeIcon>
                            </motion.div>
                            <div>
                                <Group gap="xs" mb={4}>
                                    <Title order={1} fw={900}
                                        style={{
                                            background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            backgroundClip: 'text'
                                        }}
                                    >
                                        Expert Library
                                    </Title>
                                    <Badge
                                        variant="light"
                                        color="pink"
                                        size="lg"
                                        leftSection={<IconTrendingUp size={14} />}
                                    >
                                        {RESOURCES.length} Articles
                                    </Badge>
                                </Group>
                                <Text size="md" fw={600} c={isDark ? 'gray.3' : 'gray.7'}>
                                    Evidence-based resources curated by mental health experts
                                </Text>
                            </div>
                        </Group>

                        <TextInput
                            placeholder="Search for articles, topics, or categories..."
                            leftSection={<IconSearch size={20} stroke={2} />}
                            radius="xl"
                            size="lg"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            styles={{
                                input: {
                                    backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'white',
                                    border: `2px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(139, 92, 246, 0.2)'}`,
                                    fontWeight: 600,
                                    fontSize: rem(15),
                                    '&:focus': {
                                        borderColor: isDark ? 'rgba(139, 92, 246, 0.6)' : 'rgba(139, 92, 246, 0.5)',
                                        boxShadow: '0 0 0 3px rgba(139, 92, 246, 0.1)'
                                    }
                                }
                            }}
                        />
                    </Stack>
                </Card>
            </motion.div>

            {/* Category Tabs */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
            >
                <Tabs value={activeCategory} onChange={(val) => setActiveCategory(val || 'all')} variant="pills" radius="xl">
                    <Tabs.List grow>
                        {CATEGORIES.map((cat) => (
                            <Tabs.Tab
                                key={cat.value}
                                value={cat.value}
                                leftSection={<cat.icon size={18} stroke={2.5} />}
                                style={{
                                    fontWeight: 700,
                                    fontSize: rem(14),
                                    padding: '12px 20px'
                                }}
                            >
                                {cat.label}
                            </Tabs.Tab>
                        ))}
                    </Tabs.List>
                </Tabs>
            </motion.div>

            {/* Resources Grid */}
            <AnimatePresence mode="wait">
                <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl">
                    {filteredResources.map((resource, index) => (
                        <motion.div
                            key={resource.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: index * 0.05, duration: 0.3 }}
                            whileHover={{ y: -8, transition: { duration: 0.2 } }}
                        >
                            <Card
                                radius="24px"
                                p="xl"
                                h="100%"
                                style={{
                                    background: isDark
                                        ? `linear-gradient(135deg, rgba(${getColorRGB(resource.color)}, 0.08) 0%, transparent 100%)`
                                        : `linear-gradient(135deg, rgba(${getColorRGB(resource.color)}, 0.05) 0%, transparent 100%)`,
                                    border: isDark
                                        ? `1px solid rgba(${getColorRGB(resource.color)}, 0.2)`
                                        : `1px solid rgba(${getColorRGB(resource.color)}, 0.15)`,
                                    cursor: 'pointer',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                                className="glass-panel"
                            >
                                {/* Hover Glow Effect */}
                                <Box
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        height: '4px',
                                        background: `linear-gradient(90deg, var(--mantine-color-${resource.color}-6), var(--mantine-color-${resource.color}-4))`,
                                        opacity: 0.8
                                    }}
                                />

                                <Stack justify="space-between" h="100%">
                                    <Stack gap="md">
                                        <Group justify="space-between" wrap="nowrap">
                                            <Badge
                                                variant="light"
                                                color={resource.color}
                                                size="lg"
                                                radius="md"
                                                style={{
                                                    fontWeight: 800,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px'
                                                }}
                                            >
                                                {resource.category}
                                            </Badge>
                                            <motion.div whileTap={{ scale: 0.9 }}>
                                                <ActionIcon
                                                    variant={bookmarked.includes(resource.id) ? 'filled' : 'subtle'}
                                                    color={resource.color}
                                                    radius="xl"
                                                    size="lg"
                                                    onClick={() => toggleBookmark(resource.id)}
                                                >
                                                    {bookmarked.includes(resource.id) ? (
                                                        <IconBookmarkFilled size={18} />
                                                    ) : (
                                                        <IconBookmark size={18} />
                                                    )}
                                                </ActionIcon>
                                            </motion.div>
                                        </Group>

                                        <Title order={4} fw={900} lineClamp={2} style={{ lineHeight: 1.3 }}>
                                            {resource.title}
                                        </Title>

                                        <Text size="sm" c="dimmed" fw={500} lineClamp={3} style={{ lineHeight: 1.6 }}>
                                            {resource.desc}
                                        </Text>
                                    </Stack>

                                    <Stack gap="sm">
                                        <Group justify="space-between" align="center">
                                            <Group gap="xs">
                                                <ThemeIcon
                                                    size="md"
                                                    variant="light"
                                                    color={resource.color}
                                                    radius="xl"
                                                >
                                                    <IconClock size={14} stroke={2.5} />
                                                </ThemeIcon>
                                                <Text size="xs" fw={700} c="dimmed">
                                                    {resource.readTime}
                                                </Text>
                                            </Group>
                                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                <Anchor
                                                    href={resource.url}
                                                    target="_blank"
                                                    onClick={() => updateStats('library_access', 1)}
                                                    size="sm"
                                                    fw={800}
                                                    c={resource.color}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 6,
                                                        textDecoration: 'none'
                                                    }}
                                                >
                                                    Read Article <IconExternalLink size={16} stroke={2.5} />
                                                </Anchor>
                                            </motion.div>
                                        </Group>
                                    </Stack>
                                </Stack>
                            </Card>
                        </motion.div>
                    ))}
                </SimpleGrid>
            </AnimatePresence>

            {/* Empty State */}
            {filteredResources.length === 0 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                >
                    <Card radius="32px" p="xl" className="glass-panel">
                        <Center>
                            <Stack align="center" gap="lg" maw={400}>
                                <ThemeIcon size={100} radius="xl" variant="light" color="gray">
                                    <IconSearch size={50} stroke={1.5} />
                                </ThemeIcon>
                                <Stack align="center" gap="xs">
                                    <Text size="xl" fw={900} c="dimmed">
                                        No resources found
                                    </Text>
                                    <Text size="sm" c="dimmed" ta="center" fw={500}>
                                        Try adjusting your search or selecting a different category
                                    </Text>
                                </Stack>
                            </Stack>
                        </Center>
                    </Card>
                </motion.div>
            )}

            <style>
                {`
                    @keyframes pulse {
                        0%, 100% { opacity: 0.3; transform: scale(1); }
                        50% { opacity: 0.5; transform: scale(1.1); }
                    }
                `}
            </style>
        </Stack>
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
        lime: '132, 204, 22'
    };
    return colorMap[color] || '139, 92, 246';
}
