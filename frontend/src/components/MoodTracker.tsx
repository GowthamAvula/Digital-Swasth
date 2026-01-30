import { useState, useEffect } from 'react';
import { Card, Text, Group, Stack, ActionIcon, Loader, Alert, useMantineTheme, useMantineColorScheme, Box, Badge, Center, ThemeIcon, Textarea, Button, ScrollArea, Grid, Title } from '@mantine/core';
import { IconMoodHappy, IconMoodSad, IconMoodSmile, IconMoodNeutral, IconMoodEmpty, IconAlertCircle, IconHistory, IconCircleCheck, IconMoodPlus, IconSparkles } from '@tabler/icons-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import { supabase } from '../supabaseClient';
import { MoodHeatmap } from './MoodHeatmap';
import { updateStats } from '../utils/stats';

const MOODS = [
    { label: 'Awesome', icon: IconMoodHappy, color: 'green', value: 5 },
    { label: 'Good', icon: IconMoodSmile, color: 'lime', value: 4 },
    { label: 'Okay', icon: IconMoodNeutral, color: 'yellow', value: 3 },
    { label: 'Bad', icon: IconMoodSad, color: 'orange', value: 2 },
    { label: 'Awful', icon: IconMoodEmpty, color: 'red', value: 1 },
];

interface Entry {
    mood: string;
    note: string;
    timestamp: string;
    value: number;
}

export function MoodTracker() {
    const theme = useMantineTheme();
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const [selectedMood, setSelectedMood] = useState<typeof MOODS[0] | null>(null);
    const [note, setNote] = useState('');
    const [history, setHistory] = useState<Entry[]>([]);
    const [reflection, setReflection] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchReflection = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.access_token) return;
            const res = await api.get(`/moods/reflections?user_id=${session.user.id}`, {
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });
            setReflection(res.data.reflection);
        } catch (err: any) {
            console.error('Reflection Error:', err);
            if (err.message === 'Network Error') {
                setError('Could not connect to AI service. Ensure backend is running.');
            }
        }
    };

    const fetchHistory = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.access_token) return;

            const res = await api.get(`/moods?user_id=${session.user.id}`, {
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });
            if (res.data && Array.isArray(res.data)) {
                const historyData = res.data.map((entry: any) => ({
                    ...entry,
                    name: new Date(entry.timestamp).toLocaleDateString([], { weekday: 'short' }),
                    value: MOODS.find(m => m.label === entry.mood)?.value || 3,
                }));
                setHistory(historyData);
            }
        } catch (err: any) {
            console.error('History Error:', err);
            if (err.message === 'Network Error') {
                setError('Network Error: Please ensure you are running the backend server.');
            }
        }
    };

    useEffect(() => {
        fetchHistory();
        fetchReflection();
    }, []);

    const saveMood = async () => {
        if (!selectedMood) return;
        setSaving(true);
        setError(null);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.access_token) throw new Error("Please log in to save your mood.");

            await api.post('/moods', {
                mood: selectedMood.label,
                note: note,
                timestamp: new Date().toISOString(),
                user_id: session.user.id
            }, {
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });

            updateStats('streak', 1); // Basic streak tracking
            updateStats('zen_points', 20); // Reward for logging mood
            updateStats('features_used', 'mood', 'push');
            updateStats('unique_moods', selectedMood.label, 'push');

            if (new Date().getHours() < 9) {
                updateStats('morning_sessions', 1);
            }

            setSelectedMood(null);
            setNote('');
            fetchHistory();
            fetchReflection();
        } catch (err: any) {
            console.error('Mood Save Error:', err);
            let message = err.message || "Failed to save mood.";

            if (message === 'Network Error') {
                message = 'Network Error: Backend server is unreachable at http://127.0.0.1:8000';
            } else if (message.includes('Failed to fetch')) {
                message = 'Connection failed. Please check your internet or disable AdBlocker.';
            }

            setError(message);
        } finally {
            setSaving(false);
        }
    };

    const chartData = history.slice(-7);

    return (
        <Stack gap="xl">
            {reflection && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                    <Card padding="xl" radius="32px" bg={isDark ? 'rgba(124, 58, 237, 0.1)' : 'violet.1'} style={{ border: `1px solid ${isDark ? 'rgba(124, 58, 237, 0.2)' : 'var(--mantine-color-violet-2)'}` }}>
                        <Stack gap="xs">
                            <Group gap="xs">
                                <ThemeIcon size="sm" radius="xl" color="violet" variant="light">
                                    <IconSparkles size={14} />
                                </ThemeIcon>
                                <Text size="xs" fw={900} c="violet.7" tt="uppercase">AI Reflection</Text>
                            </Group>
                            <Text size="md" fw={700} c={isDark ? 'white' : 'violet.9'} style={{ fontStyle: 'italic' }}>
                                "{reflection}"
                            </Text>
                        </Stack>
                    </Card>
                </motion.div>
            )}

            {error && (
                <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red" variant="light" withCloseButton onClose={() => setError(null)} radius="lg">
                    {error}
                </Alert>
            )}

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Card padding="xl" radius="32px" className="glass-panel" style={{ border: 'none' }}>
                    <Stack gap="xl">
                        <Group justify="space-between">
                            <Stack gap={0}>
                                <Title order={3} fw={900}>Emotional Journal</Title>
                                <Text size="sm" c={isDark ? 'gray.4' : 'gray.7'}>Log your feelings and notes.</Text>
                            </Stack>
                            <ThemeIcon variant="light" color="violet" radius="xl" size="lg">
                                <IconMoodPlus size={20} />
                            </ThemeIcon>
                        </Group>

                        <Group justify="center" gap="xl">
                            {MOODS.map((status) => (
                                <motion.div key={status.label} whileHover={{ scale: 1.1 }}>
                                    <Stack align="center" gap="xs">
                                        <ActionIcon
                                            variant={selectedMood?.label === status.label ? 'filled' : 'light'}
                                            color={status.color}
                                            size={72}
                                            radius="24px"
                                            onClick={() => setSelectedMood(status)}
                                        >
                                            <status.icon size={36} />
                                        </ActionIcon>
                                        <Text size="xs" fw={900} c={selectedMood?.label === status.label ? status.color : (isDark ? 'gray.5' : 'gray.7')}>{status.label}</Text>
                                    </Stack>
                                </motion.div>
                            ))}
                        </Group>

                        <AnimatePresence>
                            {selectedMood && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                                    <Stack mt="md">
                                        <Textarea
                                            placeholder="Write a reflection..."
                                            minRows={3}
                                            radius="xl"
                                            value={note}
                                            onChange={(e) => setNote(e.currentTarget.value)}
                                        />
                                        <Button
                                            size="lg"
                                            radius="xl"
                                            variant="gradient"
                                            gradient={{ from: 'violet', to: 'indigo' }}
                                            onClick={saveMood}
                                            loading={saving}
                                            leftSection={<IconCircleCheck size={20} />}
                                        >
                                            Save Entry
                                        </Button>
                                    </Stack>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Stack>
                </Card>
            </motion.div>

            <Grid gutter="xl">
                <Grid.Col span={12}>
                    <Card padding="xl" radius="32px" className="glass-panel" style={{ border: 'none' }}>
                        <Title order={5} mb="md">Last 28 Days Activity</Title>
                        <MoodHeatmap data={history} />
                    </Card>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 8 }}>
                    <Card padding="xl" radius="32px" className="glass-panel" style={{ border: 'none' }}>
                        <Group justify="space-between" mb="xl">
                            <Group gap="sm">
                                <ThemeIcon variant="light" color="cyan" radius="md"><IconHistory size={20} /></ThemeIcon>
                                <Text fw={900}>Trend</Text>
                            </Group>
                        </Group>
                        <Box h={300}>
                            {history.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.05} vertical={false} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                        <YAxis hide domain={[0, 6]} />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="value" stroke={theme.colors['violet'][6]} strokeWidth={4} dot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <Center h="100%"><Loader variant="dots" /></Center>
                            )}
                        </Box>
                    </Card>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Stack gap="xl">
                        <Card padding="xl" radius="32px" className="glass-panel" style={{ border: 'none' }}>
                            <Title order={5} mb="md">Emotional Insights</Title>
                            <Stack gap="sm">
                                <Group justify="space-between">
                                    <Text size="sm" fw={700}>Primary Mood</Text>
                                    <Badge color={MOODS[0].color} variant="light">Optimistic</Badge>
                                </Group>
                                <Group justify="space-between">
                                    <Text size="sm" fw={700}>Peak Positivity</Text>
                                    <Text size="xs" c={isDark ? 'gray.5' : 'gray.7'}>Wednesday</Text>
                                </Group>
                            </Stack>
                        </Card>

                        <Card padding="xl" radius="32px" className="glass-panel" style={{ border: 'none' }}>
                            <Title order={5} mb="xl">Recent Notes</Title>
                            <ScrollArea h={180} offsetScrollbars>
                                <Stack gap="sm">
                                    {history.slice().reverse().map((entry, i) => (
                                        <Box key={i} p="md" bg={isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'} style={{ borderRadius: '16px' }}>
                                            <Group justify="space-between" mb={4}>
                                                <Badge color={MOODS.find(m => m.label === entry.mood)?.color} size="xs">{entry.mood}</Badge>
                                                <Text size="10px" c={isDark ? 'gray.5' : 'gray.7'}>{new Date(entry.timestamp).toLocaleDateString()}</Text>
                                            </Group>
                                            <Text size="xs" lineClamp={3}>{entry.note || "No note."}</Text>
                                        </Box>
                                    ))}
                                </Stack>
                            </ScrollArea>
                        </Card>
                    </Stack>
                </Grid.Col>
            </Grid>
        </Stack>
    );
}
