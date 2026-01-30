import { useState, useEffect } from 'react';
import { Card, Text, Group, Stack, Button, ThemeIcon, SimpleGrid, Badge, Modal, Center, RingProgress, Title, useMantineTheme, useMantineColorScheme } from '@mantine/core';
import { IconFlower, IconX, IconCheck, IconClock, IconPlayerPlay } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { updateStats } from '../utils/stats';

interface Session {
    id: number;
    title: string;
    duration: number;
    category: string;
    color: string;
    desc: string;
}

const SESSIONS: Session[] = [
    { id: 5, title: 'Pomodoro Focus', duration: 1500, category: 'Study', color: 'indigo', desc: '25 min of deep focus. For students and high-achievers.' },
    { id: 1, title: 'Exam Clarity', duration: 300, category: 'Academic', color: 'teal', desc: 'Settle your nerves before a big test or presentation.' },
    { id: 2, title: 'Stress Release', duration: 600, category: 'Calm', color: 'violet', desc: 'Loosen the tension in your body and mind.' },
    { id: 6, title: 'Quick Reset', duration: 300, category: 'Break', color: 'orange', desc: 'A perfect 5-min recharge between study sessions.' },
];



export function Meditation() {
    const theme = useMantineTheme();
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const [activeSession, setActiveSession] = useState<Session | null>(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [breatheState, setBreatheState] = useState<'In' | 'Out' | 'Hold'>('In');

    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | undefined;
        if (isRunning && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        setIsRunning(false);
                        updateStats('meditations', 1);
                        updateStats('zen_points', 30); // Reward for completing meditation
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRunning, timeLeft]);

    useEffect(() => {
        if (timeLeft === 0 && isRunning) {
            // Updated stats handled in another useEffect
        }
    }, [timeLeft, isRunning]);

    useEffect(() => {
        let breatheInterval: ReturnType<typeof setInterval> | undefined;
        if (isRunning) {
            breatheInterval = setInterval(() => {
                setBreatheState((prev) => {
                    if (prev === 'In') return 'Hold';
                    if (prev === 'Hold') return 'Out';
                    return 'In';
                });
            }, 4000);
        }
        return () => clearInterval(breatheInterval);
    }, [isRunning]);



    const startSession = (session: Session) => {
        setActiveSession(session);
        setTimeLeft(session.duration);
        setIsRunning(true);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = activeSession ? ((activeSession.duration - timeLeft) / activeSession.duration) * 100 : 0;

    return (
        <Stack gap="xl">


            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <Card radius="32px" bg={isDark ? 'rgba(76, 110, 245, 0.1)' : 'indigo.0'} mb="md" className="glass-panel" style={{ border: 'none' }}>
                    <Group justify="space-between" p="sm">
                        <Group gap="xl">
                            <ThemeIcon size={64} radius="24px" color="indigo" variant="filled" style={{ boxShadow: '0 8px 20px rgba(76, 110, 245, 0.3)' }}>
                                <IconFlower size={34} />
                            </ThemeIcon>
                            <div>
                                <Text size="22px" fw={900} c={isDark ? 'white' : 'indigo.9'} style={{ letterSpacing: '-0.5px' }}>Study & Focus Hub</Text>
                                <Text size="sm" c={isDark ? 'indigo.2' : 'indigo.8'} fw={600}>Boost your productivity and inner peace.</Text>
                            </div>
                        </Group>

                    </Group>
                </Card>
            </motion.div>

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xl">
                {SESSIONS.map((session, index) => (
                    <motion.div
                        key={session.id}
                        initial={{ opacity: 0, y: 30, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        whileHover={{ y: -8 }}
                    >
                        <Card shadow="xl" radius="32px" className="glass-panel" style={{ cursor: 'pointer', height: '100%', border: 'none' }} onClick={() => startSession(session)}>
                            <Group justify="space-between" mb="xl">
                                <Badge variant="gradient" gradient={{ from: session.color, to: 'indigo' }} size="lg" radius="md">{session.category}</Badge>
                                <Badge color="gray" variant="light" radius="md">{Math.floor(session.duration / 60)} MIN</Badge>
                            </Group>

                            <Group gap="xl" align="flex-start">
                                <ThemeIcon variant="light" size={72} radius="24px" color={session.color} style={{ boxShadow: `0 8px 16px ${isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)'}` }}>
                                    {session.category === 'Study' ? <IconClock size={36} /> : <IconFlower size={36} />}
                                </ThemeIcon>
                                <div style={{ flex: 1 }}>
                                    <Text fw={900} size="xl" mb={4} c={isDark ? 'white' : 'gray.9'}>{session.title}</Text>
                                    <Text size="sm" c={isDark ? 'gray.4' : 'dark.9'} fw={600} lineClamp={2} style={{ lineHeight: 1.5 }}>{session.desc}</Text>
                                </div>
                            </Group>

                            <Button
                                fullWidth
                                variant="light"
                                color={session.color}
                                mt="xl"
                                radius="xl"
                                size="lg"
                                rightSection={<IconPlayerPlay size={18} />}
                            >
                                Begin Journey
                            </Button>
                        </Card>
                    </motion.div>
                ))}
            </SimpleGrid>

            <Modal
                opened={!!activeSession}
                onClose={() => { setActiveSession(null); setIsRunning(false); }}
                fullScreen
                transitionProps={{ transition: 'fade', duration: 600 }}
                withCloseButton={false}
                styles={{ content: { backgroundColor: 'transparent' } }}
            >
                <Center h="100vh" style={{ background: isDark ? 'radial-gradient(circle at center, #1A1B1E 0%, #000 100%)' : 'radial-gradient(circle at center, #f8f9fa 0%, #e9ecef 100%)' }}>
                    <Stack align="center" gap="xl" w="100%" maw={500} p="xl">
                        <Stack align="center" gap="xs">
                            <Badge size="xl" radius="md" variant="filled" color={activeSession?.color}>{activeSession?.category}</Badge>
                            <Title order={1} fw={900} c={isDark ? 'white' : 'gray.9'} style={{ fontSize: '42px', letterSpacing: '-1.5px' }}>{activeSession?.title}</Title>
                        </Stack>

                        <div style={{ position: 'relative' }}>
                            <RingProgress
                                size={360}
                                thickness={12}
                                roundCaps
                                sections={[{ value: progress, color: activeSession?.color ? theme.colors[activeSession.color][6] : theme.colors.indigo[6] }]}
                                label={
                                    <Center>
                                        <Text fw={900} style={{ fontSize: '72px', letterSpacing: '-3px' }} c={isDark ? 'white' : 'gray.9'}>
                                            {formatTime(timeLeft)}
                                        </Text>
                                    </Center>
                                }
                            />

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={breatheState}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: [0.1, 0.4, 0.1], scale: [1, 1.4, 1] }}
                                    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                                    style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        width: 280,
                                        height: 280,
                                        margin: -140,
                                        backgroundColor: activeSession?.color ? theme.colors[activeSession.color][4] : theme.colors.indigo[4],
                                        borderRadius: '50%',
                                        zIndex: -1,
                                        filter: 'blur(40px)'
                                    }}
                                />
                            </AnimatePresence>
                        </div>

                        <Stack align="center" gap={4}>
                            <motion.div
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ repeat: Infinity, duration: 4 }}
                            >
                                <Text fw={900} size="48px" c={activeSession ? theme.colors[activeSession.color][6] : 'indigo.6'} style={{ letterSpacing: '6px' }}>
                                    {timeLeft > 0 ? breatheState.toUpperCase() : "DONE"}
                                </Text>
                            </motion.div>
                            <Text size="lg" fw={700} c={isDark ? 'gray.4' : 'dark.9'}>
                                {timeLeft > 0 ? "Focus on your deep breath" : "Mindfulness session complete."}
                            </Text>
                        </Stack>

                        <Group mt="xl" grow w="100%" maw={300}>
                            {timeLeft > 0 ? (
                                <Button
                                    size="lg"
                                    radius="xl"
                                    variant="subtle"
                                    color="gray"
                                    leftSection={<IconX size={20} />}
                                    onClick={() => { setIsRunning(false); setActiveSession(null); }}
                                >
                                    End Session
                                </Button>
                            ) : (
                                <Button
                                    size="lg"
                                    radius="xl"
                                    variant="gradient"
                                    gradient={{ from: 'indigo', to: 'violet' }}
                                    leftSection={<IconCheck size={20} />}
                                    onClick={() => { setActiveSession(null); }}
                                >
                                    Finish
                                </Button>
                            )}
                        </Group>
                    </Stack>
                </Center>
            </Modal>
        </Stack>
    );
}
