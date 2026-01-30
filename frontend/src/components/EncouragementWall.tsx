import { useState, useEffect } from 'react';
import { Card, Text, Group, Stack, TextInput, ScrollArea, Box, Button, Center, Loader, ThemeIcon, Badge } from '@mantine/core';
import { IconSend, IconMessageHeart, IconSparkles, IconUserHeart } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';

const COLORS = [
    '#FFADAD', '#FFD6A5', '#FDFFB6', '#CAFFBF', '#9BF6FF', '#A0C4FF', '#BDB2FF', '#FFC6FF'
];

interface Note {
    id: string;
    message: string;
    color: string;
    rotation: number;
    created_at: string;
}

export function EncouragementWall() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    const fetchNotes = async () => {
        try {
            const res = await api.get('/encouragement');
            setNotes(res.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotes();
        const interval = setInterval(fetchNotes, 30000);
        return () => clearInterval(interval);
    }, []);

    const postMessage = async () => {
        if (!message.trim()) return;
        setSending(true);
        try {
            const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
            const randomRotation = Math.floor(Math.random() * 8) - 4;

            await api.post('/encouragement', {
                message: message,
                color: randomColor,
                rotation: randomRotation
            });
            setMessage('');
            fetchNotes();
        } catch (err) {
            console.error(err);
        } finally {
            setSending(false);
        }
    };

    return (
        <Stack gap="xl" h="100%">
            <Card radius="32px" p="xl" className="glass-panel" style={{ border: 'none', background: 'rgba(255,255,255,0.05)' }}>
                <Stack gap="md">
                    <Group justify="space-between">
                        <Group gap="md">
                            <ThemeIcon size={52} radius="20px" variant="gradient" gradient={{ from: 'pink', to: 'violet' }}>
                                <IconMessageHeart size={28} />
                            </ThemeIcon>
                            <div>
                                <Text fw={900} size="xl" style={{ letterSpacing: '-0.5px' }}>Support Wall</Text>
                                <Text size="sm" opacity={0.7} fw={600}>Share a bright thought for your fellow students.</Text>
                            </div>
                        </Group>
                        <Badge size="lg" variant="light" color="pink" leftSection={<IconSparkles size={14} />}>ANONYMOUS</Badge>
                    </Group>

                    <Group gap="sm" align="flex-end" mt="sm">
                        <TextInput
                            placeholder="You've got this! Good luck on midterms..."
                            style={{ flex: 1 }}
                            radius="xl"
                            size="lg"
                            value={message}
                            onChange={(e) => setMessage(e.currentTarget.value)}
                            onKeyPress={(e) => e.key === 'Enter' && postMessage()}
                            styles={{ input: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' } }}
                        />
                        <Button
                            radius="xl"
                            size="lg"
                            variant="gradient"
                            gradient={{ from: 'pink', to: 'violet' }}
                            onClick={postMessage}
                            loading={sending}
                            leftSection={<IconSend size={20} />}
                            style={{ boxShadow: '0 8px 20px rgba(232, 62, 140, 0.3)' }}
                        >
                            Spread Joy
                        </Button>
                    </Group>
                </Stack>
            </Card>

            <ScrollArea h="calc(100vh - 380px)" offsetScrollbars>
                {loading ? (
                    <Center h={200}><Loader variant="bars" color="pink" /></Center>
                ) : (
                    <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '40px', padding: '30px' }}>
                        <AnimatePresence>
                            {notes.map((note) => (
                                <motion.div
                                    key={note.id}
                                    initial={{ scale: 0, opacity: 0, rotate: (note.rotation || 0) - 10 }}
                                    animate={{ scale: 1, opacity: 1, rotate: (note.rotation || 0) }}
                                    whileHover={{ scale: 1.08, rotate: 0, zIndex: 10, y: -10 }}
                                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                                >
                                    <Box
                                        p="xl"
                                        style={{
                                            backgroundColor: note.color,
                                            aspectRatio: '1/1',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            textAlign: 'center',
                                            borderRadius: '4px',
                                            boxShadow: '0 15px 30px rgba(0,0,0,0.15), inset 0 0 50px rgba(0,0,0,0.08)',
                                            position: 'relative',
                                            transform: `rotate(${note.rotation || 0}deg)`,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <Box style={{
                                            position: 'absolute',
                                            top: '-12px',
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            width: '80px',
                                            height: '24px',
                                            backgroundColor: 'rgba(255,255,255,0.3)',
                                            backdropFilter: 'blur(4px)',
                                            zIndex: 2,
                                            borderRadius: '2px'
                                        }} />

                                        <Text fw={800} size="md" c="dark.9" style={{ lineHeight: 1.4, fontFamily: 'Permanent Marker, cursive, sans-serif' }}>
                                            {note.message}
                                        </Text>

                                        <Group gap={4} mt="md" style={{ position: 'absolute', bottom: '15px' }}>
                                            <IconUserHeart size={14} color="rgba(0,0,0,0.3)" />
                                            <Text size="10px" fw={800} c="dark.9" opacity={0.4}>STUDENT</Text>
                                        </Group>
                                    </Box>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </Box>
                )}
            </ScrollArea>
        </Stack>
    );
}
