import { useState, useEffect, useRef } from 'react';
import { Card, Text, Group, Stack, Button, ThemeIcon, Progress, Box, useMantineColorScheme, Title, Badge, SimpleGrid, rem } from '@mantine/core';
import { IconPlayerPlay, IconPlayerPause, IconRefresh, IconClock, IconBrain, IconCoffee, IconCheck } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { updateStats } from '../utils/stats';

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

const TIMER_DURATIONS = {
    focus: 25 * 60, // 25 minutes
    shortBreak: 5 * 60, // 5 minutes
    longBreak: 15 * 60 // 15 minutes
};

export function FocusTimer() {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const [mode, setMode] = useState<TimerMode>('focus');
    const [timeLeft, setTimeLeft] = useState(TIMER_DURATIONS.focus);
    const [isRunning, setIsRunning] = useState(false);
    const [sessionsCompleted, setSessionsCompleted] = useState(0);
    const intervalRef = useRef<number | null>(null);

    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        handleTimerComplete();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isRunning, timeLeft]);

    const handleTimerComplete = () => {
        setIsRunning(false);

        if (mode === 'focus') {
            const newSessions = sessionsCompleted + 1;
            setSessionsCompleted(newSessions);
            updateStats('focus_sessions', 1);
            updateStats('focus_minutes', 25);

            // Play notification sound (optional)
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('Focus Session Complete! 🎉', {
                    body: 'Great work! Time for a break.',
                    icon: '/favicon.ico'
                });
            }

            // Auto-switch to break
            if (newSessions % 4 === 0) {
                switchMode('longBreak');
            } else {
                switchMode('shortBreak');
            }
        } else {
            // Break complete
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('Break Complete! ⏰', {
                    body: 'Ready to focus again?',
                    icon: '/favicon.ico'
                });
            }
            switchMode('focus');
        }
    };

    const switchMode = (newMode: TimerMode) => {
        setMode(newMode);
        setTimeLeft(TIMER_DURATIONS[newMode]);
        setIsRunning(false);
    };

    const toggleTimer = () => {
        if (!isRunning && 'Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
        setIsRunning(!isRunning);
    };

    const resetTimer = () => {
        setIsRunning(false);
        setTimeLeft(TIMER_DURATIONS[mode]);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = ((TIMER_DURATIONS[mode] - timeLeft) / TIMER_DURATIONS[mode]) * 100;

    const getModeConfig = () => {
        switch (mode) {
            case 'focus':
                return {
                    title: 'Focus Time',
                    icon: IconBrain,
                    color: 'violet',
                    gradient: { from: 'violet', to: 'indigo' },
                    rgb: '139, 92, 246'
                };
            case 'shortBreak':
                return {
                    title: 'Short Break',
                    icon: IconCoffee,
                    color: 'teal',
                    gradient: { from: 'teal', to: 'cyan' },
                    rgb: '20, 184, 166'
                };
            case 'longBreak':
                return {
                    title: 'Long Break',
                    icon: IconCoffee,
                    color: 'blue',
                    gradient: { from: 'blue', to: 'cyan' },
                    rgb: '59, 130, 246'
                };
        }
    };

    const config = getModeConfig();

    return (
        <Card
            radius="32px"
            p="xl"
            style={{
                background: isDark
                    ? `linear-gradient(135deg, rgba(${config.rgb}, 0.15) 0%, transparent 100%)`
                    : `linear-gradient(135deg, rgba(${config.rgb}, 0.08) 0%, transparent 100%)`,
                border: isDark
                    ? `1px solid rgba(${config.rgb}, 0.3)`
                    : `1px solid rgba(${config.rgb}, 0.2)`,
                boxShadow: `0 20px 60px -15px rgba(${config.rgb}, 0.3)`,
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Top Accent Bar */}
            <Box
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: `linear-gradient(90deg, var(--mantine-color-${config.color}-6), var(--mantine-color-${config.color}-4))`
                }}
            />

            <Stack gap="xl">
                {/* Header */}
                <Group justify="space-between">
                    <Group gap="md">
                        <ThemeIcon
                            size={50}
                            radius="xl"
                            variant="gradient"
                            gradient={config.gradient}
                            style={{
                                boxShadow: `0 8px 24px rgba(${config.rgb}, 0.4)`
                            }}
                        >
                            <config.icon size={24} stroke={2.5} />
                        </ThemeIcon>
                        <div>
                            <Title order={3} fw={900}>{config.title}</Title>
                            <Text size="sm" c="dimmed" fw={600}>
                                Pomodoro Technique
                            </Text>
                        </div>
                    </Group>
                    <Badge
                        size="lg"
                        variant="light"
                        color={config.color}
                        leftSection={<IconCheck size={14} />}
                    >
                        {sessionsCompleted} Sessions
                    </Badge>
                </Group>

                {/* Mode Selector */}
                <SimpleGrid cols={3} spacing="sm">
                    {[
                        { mode: 'focus' as TimerMode, label: 'Focus', duration: '25m' },
                        { mode: 'shortBreak' as TimerMode, label: 'Short Break', duration: '5m' },
                        { mode: 'longBreak' as TimerMode, label: 'Long Break', duration: '15m' }
                    ].map(({ mode: m, label, duration }) => (
                        <motion.div key={m} whileTap={{ scale: 0.95 }}>
                            <Button
                                variant={mode === m ? 'filled' : 'light'}
                                color={config.color}
                                radius="xl"
                                fullWidth
                                onClick={() => switchMode(m)}
                                disabled={isRunning}
                            >
                                <Stack gap={0} align="center">
                                    <Text size="xs" fw={900}>{label}</Text>
                                    <Text size="xs" opacity={0.7}>{duration}</Text>
                                </Stack>
                            </Button>
                        </motion.div>
                    ))}
                </SimpleGrid>

                {/* Timer Display */}
                <Stack align="center" gap="xl">
                    <motion.div
                        animate={isRunning ? { scale: [1, 1.02, 1] } : {}}
                        transition={{ duration: 1, repeat: Infinity }}
                    >
                        <Title
                            order={1}
                            c={`${config.color}.6`}
                            style={{
                                fontSize: rem(96),
                                fontWeight: 900,
                                letterSpacing: '-4px',
                                filter: `drop-shadow(0 4px 20px rgba(${config.rgb}, 0.3))`
                            }}
                        >
                            {formatTime(timeLeft)}
                        </Title>
                    </motion.div>
                    <Progress
                        value={progress}
                        size="xl"
                        radius="xl"
                        w="100%"
                        maw={500}
                        color={config.color}
                        striped={isRunning}
                        animated={isRunning}
                    />
                </Stack>

                {/* Controls */}
                <Group justify="center" gap="md">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                            size="xl"
                            radius="xl"
                            variant="gradient"
                            gradient={config.gradient}
                            leftSection={isRunning ? <IconPlayerPause size={24} /> : <IconPlayerPlay size={24} />}
                            onClick={toggleTimer}
                            style={{
                                boxShadow: `0 8px 24px rgba(${config.rgb}, 0.4)`,
                                minWidth: 180
                            }}
                        >
                            {isRunning ? 'Pause' : 'Start'}
                        </Button>
                    </motion.div>
                    <motion.div whileTap={{ scale: 0.95 }}>
                        <Button
                            size="xl"
                            radius="xl"
                            variant="light"
                            color={config.color}
                            leftSection={<IconRefresh size={20} />}
                            onClick={resetTimer}
                        >
                            Reset
                        </Button>
                    </motion.div>
                </Group>

                {/* Tips */}
                <Card
                    radius="xl"
                    p="md"
                    style={{
                        background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`
                    }}
                >
                    <Group gap="sm">
                        <ThemeIcon size={32} radius="xl" variant="light" color={config.color}>
                            <IconClock size={18} />
                        </ThemeIcon>
                        <Text size="sm" c="dimmed" fw={600}>
                            {mode === 'focus'
                                ? 'Focus deeply on one task. Eliminate distractions.'
                                : 'Take a break! Stretch, hydrate, or take a short walk.'}
                        </Text>
                    </Group>
                </Card>
            </Stack>
        </Card >
    );
}
