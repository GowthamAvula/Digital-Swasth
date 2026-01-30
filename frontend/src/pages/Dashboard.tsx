import { useState, useEffect } from 'react';
import { Group, Stack, NavLink, Avatar, ActionIcon, useMantineColorScheme, ScrollArea, Box, Text, ThemeIcon, Burger, Drawer, Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconHeartHandshake, IconFlower, IconLogout, IconSun, IconMoon, IconBrain, IconHeartbeat, IconPuzzle, IconHome2, IconMedal, IconLibrary, IconUserCircle } from '@tabler/icons-react';
import { Chatbot } from '../components/Chatbot';
import { MoodTracker } from '../components/MoodTracker';
import { Meditation } from '../components/Meditation';
import { Games } from '../components/Games';
import { Home } from '../components/Home';
import { Profile } from '../components/Profile';
import { Achievements } from '../components/Achievements';
import { Resources } from '../components/Resources';
import { FocusTimer } from '../components/FocusTimer';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';
import { updateStats } from '../utils/stats';

type View = 'home' | 'chat' | 'mood' | 'meditation' | 'games' | 'profile' | 'awards' | 'library' | 'focus';

const NAV_ITEMS = [
    { view: 'home' as View, label: 'Overview', icon: IconHome2, color: 'indigo', badge: null },
    { view: 'chat' as View, label: 'Swasth AI', icon: IconBrain, color: 'violet', badge: null },
    { view: 'library' as View, label: 'Expert Library', icon: IconLibrary, color: 'blue', badge: null },
    { view: 'focus' as View, label: 'Focus Time', icon: IconFlower, color: 'violet', badge: null },
    { view: 'awards' as View, label: 'Achievements', icon: IconMedal, color: 'yellow', badge: null },
    { view: 'mood' as View, label: 'Mood Tracker', icon: IconHeartbeat, color: 'pink', badge: null },
    { view: 'meditation' as View, label: 'Study & Zen', icon: IconFlower, color: 'teal', badge: null },
    { view: 'games' as View, label: 'Relaxing Games', icon: IconPuzzle, color: 'orange', badge: null },
];

export function Dashboard() {
    const [opened, { toggle, close }] = useDisclosure();
    const [activeView, setActiveView] = useState<View>('home');
    const [user, setUser] = useState<any>(null);
    const { colorScheme, toggleColorScheme } = useMantineColorScheme();
    const dark = colorScheme === 'dark';

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            if (user) {
                // Record login event
                await supabase.from('login_history').insert({
                    user_id: user.id,
                    email: user.email
                });
            }
        };

        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleViewChange = (view: View) => {
        setActiveView(view);
        updateStats('features_used', view, 'push');
    };

    const handleSignOut = async () => {
        try {
            await supabase.auth.signOut();
        } catch (error: any) {
            console.error('Error signing out:', error.message);
            // Force logout on error
            localStorage.removeItem('sb-bnpqocjasnkdwixcsfhu-auth-token');
            window.location.reload();
        }
    };

    const renderContent = () => {
        switch (activeView) {
            case 'home': return <Home onStartAI={() => handleViewChange('chat')} />;
            case 'chat': return <Chatbot />;
            case 'mood': return <MoodTracker />;
            case 'meditation': return <Meditation />;
            case 'games': return <Games />;
            case 'focus': return <FocusTimer />;
            case 'profile': return <Profile user={user} />;
            case 'awards': return <Achievements />;
            case 'library': return <Resources />;
            default: return <Home />;
        }
    };

    return (
        <Box w="100%" h="100dvh" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '24px' }}>
            {/* Mobile Header */}
            <Box hiddenFrom="md" p="md" className="glass-panel" style={{ borderRadius: '24px', marginBottom: '10px' }}>
                <Group justify="space-between">
                    <Group gap="xs">
                        <ThemeIcon size={32} radius="xl" variant="gradient" gradient={{ from: 'violet', to: 'cyan', deg: 45 }}>
                            <IconHeartHandshake size={16} />
                        </ThemeIcon>
                        <Text fw={900}>Swasth</Text>
                    </Group>
                    <Burger opened={opened} onClick={toggle} size="sm" color="white" />
                </Group>
            </Box>

            <Box style={{ display: 'flex', flex: 1, overflow: 'hidden', gap: '20px' }}>
                {/* Desktop Sidebar */}
                <Box
                    visibleFrom="md"
                    w={260}
                    h="100%"
                    style={{ display: 'flex', flexShrink: 0 }}
                >
                    <Box
                        className="glass-panel"
                        w="100%"
                        h="100%"
                        p="xl"
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            borderRadius: '32px',
                            border: 'none',
                        }}
                    >
                        <Group mb="xl" px="sm" justify="space-between" wrap="nowrap">
                            <Group gap="xs" wrap="nowrap">
                                <ThemeIcon size={38} radius="xl" variant="gradient" gradient={{ from: 'violet', to: 'cyan', deg: 45 }}>
                                    <IconHeartHandshake size={20} />
                                </ThemeIcon>
                                <Text fw={900} size="xl" style={{ letterSpacing: '-1px' }}>Swasth</Text>
                            </Group>
                            <ActionIcon
                                variant="light"
                                color={dark ? 'yellow' : 'violet'}
                                onClick={() => toggleColorScheme()}
                                radius="md"
                                size="md"
                            >
                                {dark ? <IconSun size={18} /> : <IconMoon size={18} />}
                            </ActionIcon>
                        </Group>

                        <Box style={{ flex: 1, overflow: 'hidden', paddingRight: '8px' }}>
                            <ScrollArea h="100%" scrollbarSize={5} offsetScrollbars>
                                <Stack gap="xs">
                                    {NAV_ITEMS.map((item, index) => (
                                        <motion.div
                                            key={item.view}
                                            initial={{ x: -20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: 0.1 * index + 0.3 }}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <NavLink
                                                label={<Text fw={1200} size="sm" c={activeView === item.view ? 'dark' : 'inherit'}>{item.label}</Text>}
                                                leftSection={
                                                    <motion.div
                                                        animate={activeView === item.view ? {
                                                            scale: [1, 1.1, 1],
                                                            rotate: [0, 5, -5, 0]
                                                        } : {}}
                                                        transition={{
                                                            duration: 0.5,
                                                            repeat: activeView === item.view ? Infinity : 0,
                                                            repeatDelay: 3
                                                        }}
                                                        whileHover={{
                                                            scale: 1.15,
                                                            rotate: [0, -10, 10, -10, 0],
                                                            transition: { duration: 0.5 }
                                                        }}
                                                    >
                                                        <ThemeIcon
                                                            variant={activeView === item.view ? 'filled' : 'light'}
                                                            color={item.color}
                                                            radius="12px"
                                                            size="lg"
                                                            style={{
                                                                boxShadow: activeView === item.view
                                                                    ? `0 4px 12px color-mix(in srgb, var(--mantine-color-${item.color}-6), transparent 60%)`
                                                                    : 'none',
                                                                transition: 'box-shadow 0.3s ease'
                                                            }}
                                                        >
                                                            <item.icon size={20} stroke={2.5} />
                                                        </ThemeIcon>
                                                    </motion.div>
                                                }
                                                active={activeView === item.view}
                                                onClick={() => { handleViewChange(item.view); close(); }}
                                                variant="subtle"
                                                color={item.color}
                                                styles={{
                                                    root: {
                                                        borderRadius: '16px',
                                                        marginBottom: '8px',
                                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                        height: '56px',
                                                        backgroundColor: activeView === item.view
                                                            ? (dark ? `color-mix(in srgb, var(--mantine-color-${item.color}-9), transparent 85%)` : `var(--mantine-color-${item.color}-light)`)
                                                            : 'transparent',
                                                        border: activeView === item.view && dark
                                                            ? `1px solid color-mix(in srgb, var(--mantine-color-${item.color}-6), transparent 80%)`
                                                            : '1px solid transparent',
                                                        boxShadow: activeView === item.view && dark
                                                            ? `0 0 15px color-mix(in srgb, var(--mantine-color-${item.color}-6), transparent 90%)`
                                                            : 'none',
                                                        '&:hover': {
                                                            backgroundColor: dark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.6)',
                                                            transform: 'translateX(6px)'
                                                        }
                                                    },
                                                    label: {
                                                        color: activeView === item.view ? (dark ? '#ffffff' : 'var(--mantine-color-black)') : (dark ? 'var(--mantine-color-gray-3)' : 'var(--mantine-color-gray-8)'),
                                                        fontWeight: activeView === item.view ? 800 : 600,
                                                        fontSize: '15px',
                                                        letterSpacing: '0.3px'
                                                    }
                                                }}
                                            />
                                            {item.badge && (
                                                <Box className="feature-badge">
                                                    {item.badge}
                                                </Box>
                                            )}
                                        </motion.div>
                                    ))}
                                </Stack>
                            </ScrollArea>
                        </Box>

                        <Stack gap="sm" mt="md">
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <NavLink
                                    label={<Text fw={1200} size="sm">My Profile</Text>}
                                    leftSection={
                                        <motion.div
                                            whileHover={{
                                                scale: 1.15,
                                                rotate: [0, -10, 10, -10, 0],
                                                transition: { duration: 0.5 }
                                            }}
                                        >
                                            <ThemeIcon
                                                variant={activeView === 'profile' ? 'filled' : 'light'}
                                                color="violet"
                                                radius="12px"
                                                size="lg"
                                                style={{
                                                    boxShadow: activeView === 'profile'
                                                        ? '0 4px 12px color-mix(in srgb, var(--mantine-color-violet-6), transparent 60%)'
                                                        : 'none',
                                                    transition: 'box-shadow 0.3s ease'
                                                }}
                                            >
                                                <IconUserCircle size={20} stroke={2.5} />
                                            </ThemeIcon>
                                        </motion.div>
                                    }
                                    active={activeView === 'profile'}
                                    onClick={() => setActiveView('profile')}
                                    variant="filled"
                                    color="gray"
                                    style={{
                                        borderRadius: '16px',
                                        height: '56px',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                    }}
                                />
                            </motion.div>

                            <Box
                                p="sm"
                                bg={dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'}
                                style={{ borderRadius: '24px', border: `1px solid ${dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` }}
                            >
                                <Group justify="space-between" wrap="nowrap">
                                    <Group gap="sm" wrap="nowrap" style={{ overflow: 'hidden' }}>
                                        <Avatar radius="xl" variant="filled" color="violet">
                                            {user?.user_metadata?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                                        </Avatar>
                                        <div style={{ minWidth: 0 }}>
                                            <Text size="xs" fw={900} truncate>
                                                {user?.user_metadata?.name || user?.email?.split('@')[0] || 'Explorer'}
                                            </Text>
                                            <Text size="10px" c="dimmed" fw={800} tt="uppercase">Student</Text>
                                        </div>
                                    </Group>
                                    <ActionIcon variant="subtle" color="red" size="sm" onClick={handleSignOut}>
                                        <IconLogout size={16} />
                                    </ActionIcon>
                                </Group>
                            </Box>
                        </Stack>
                    </Box>
                </Box>

                {/* Main Content Area */}
                <Box flex={1} h="100%" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <Box style={{ flex: 1, overflow: 'hidden', paddingRight: '12px' }}>
                        <ScrollArea h="100%" px={{ base: 'xs', md: 'md' }} pt={{ base: 'xs', md: 'md' }} scrollbarSize={5} offsetScrollbars>
                            <Box pb="xl">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeView}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.5, ease: 'easeOut' }}
                                    >
                                        {renderContent()}
                                    </motion.div>
                                </AnimatePresence>
                            </Box>
                        </ScrollArea>
                    </Box>
                </Box>
            </Box>

            {/* Mobile Drawer */}
            <Drawer
                opened={opened}
                onClose={close}
                size="280px"
                padding="xl"
                hiddenFrom="md"
                withCloseButton={false}
                styles={{
                    content: { backgroundColor: 'transparent', boxShadow: 'none' },
                    body: { padding: 0 }
                }}
            >
                <Box className="glass-panel" h="100%" p="xl" style={{ borderRadius: '32px' }}>
                    <Group mb="xl" justify="space-between">
                        <Text fw={900} size="xl">Menu</Text>
                        <Burger opened={opened} onClick={toggle} size="sm" />
                    </Group>
                    <Stack gap="xs" style={{ flex: 1 }}>
                        {NAV_ITEMS.map((item, index) => (
                            <motion.div
                                key={item.view}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.05 * index }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <NavLink
                                    label={<Text fw={1200}>{item.label}</Text>}
                                    leftSection={
                                        <motion.div
                                            whileHover={{
                                                scale: 1.15,
                                                rotate: [0, -10, 10, -10, 0],
                                                transition: { duration: 0.5 }
                                            }}
                                        >
                                            <item.icon size={20} stroke={2.5} />
                                        </motion.div>
                                    }
                                    active={activeView === item.view}
                                    onClick={() => { setActiveView(item.view); close(); }}
                                    variant="filled"
                                    color={item.color}
                                    style={{ borderRadius: '16px', height: '56px' }}
                                />
                            </motion.div>
                        ))}
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <NavLink
                                label={<Text fw={1200}>My Profile</Text>}
                                leftSection={
                                    <motion.div
                                        whileHover={{
                                            scale: 1.15,
                                            rotate: [0, -10, 10, -10, 0],
                                            transition: { duration: 0.5 }
                                        }}
                                    >
                                        <IconUserCircle size={20} stroke={2.5} />
                                    </motion.div>
                                }
                                active={activeView === 'profile'}
                                onClick={() => { setActiveView('profile'); close(); }}
                                variant="filled"
                                color="violet"
                                style={{ borderRadius: '16px', height: '56px' }}
                            />
                        </motion.div>
                    </Stack>
                    <Button
                        mt="xl"
                        fullWidth
                        variant="light"
                        color="red"
                        leftSection={<IconLogout size={16} />}
                        onClick={handleSignOut}
                    >
                        Sign Out
                    </Button>
                </Box>
            </Drawer>
        </Box>
    );
}
