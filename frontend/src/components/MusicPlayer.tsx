import { useState, useRef, useEffect } from 'react';
import { Paper, Group, ActionIcon, Text, Slider, Stack, ThemeIcon, useMantineTheme } from '@mantine/core';
import { IconPlayerPlay, IconPlayerPause, IconPlayerSkipForward, IconPlayerSkipBack, IconVolume, IconMusic } from '@tabler/icons-react';
import { motion } from 'framer-motion';

// Real royalty free lofi links (from sample archives)
const REAL_LOFI = [
    {
        title: "Lonesome (Calm)",
        artist: "Sakura Hz",
        url: "https://www.chosic.com/wp-content/uploads/2021/05/Sakura-Hz-Lonesome.mp3",
        color: "violet"
    },
    {
        title: "Warm Memories",
        artist: "Keys of Moon",
        url: "https://www.chosic.com/wp-content/uploads/2021/06/Warm-Memories.mp3",
        color: "teal"
    },
    {
        title: "Good Night",
        artist: "FSM Team",
        url: "https://www.chosic.com/wp-content/uploads/2021/05/Good-Night.mp3",
        color: "indigo"
    }
];

export function MusicPlayer() {
    const theme = useMantineTheme();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(40);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const currentTrack = REAL_LOFI[currentIndex];

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume / 100;
        }
    }, [volume]);

    useEffect(() => {
        if (isPlaying && audioRef.current) {
            audioRef.current.play().catch(e => console.error("Audio block", e));
        } else if (audioRef.current) {
            audioRef.current.pause();
        }
    }, [isPlaying, currentIndex]);

    const togglePlay = () => setIsPlaying(!isPlaying);

    const nextTrack = () => {
        setCurrentIndex((prev) => (prev + 1) % REAL_LOFI.length);
        setIsPlaying(true);
    };

    const prevTrack = () => {
        setCurrentIndex((prev) => (prev - 1 + REAL_LOFI.length) % REAL_LOFI.length);
        setIsPlaying(true);
    };

    const getTrackColor = (shade: number) => {
        const color = currentTrack.color;
        // Fallback to primary color if the specific color is missing in theme
        return theme.colors[color]?.[shade] || theme.colors[theme.primaryColor]?.[shade] || '#7c3aed';
    };

    return (
        <Paper
            radius="24px"
            p="md"
            className="glass-panel"
            style={{
                width: 320,
                position: 'fixed',
                bottom: 40,
                right: 40,
                zIndex: 2000,
                border: '1px solid rgba(255,255,255,0.3)'
            }}
        >
            <audio
                ref={audioRef}
                src={currentTrack.url}
                onEnded={nextTrack}
            />

            <Stack gap="md">
                <Group justify="space-between" wrap="nowrap">
                    <Group gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                        <ThemeIcon
                            size={44}
                            radius="16px"
                            variant="light"
                            color={currentTrack.color}
                        >
                            <motion.div
                                animate={isPlaying ? { rotate: 360 } : {}}
                                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            >
                                <IconMusic size={22} />
                            </motion.div>
                        </ThemeIcon>
                        <div style={{ minWidth: 0 }}>
                            <Text fw={800} size="sm" truncate>{currentTrack.title}</Text>
                            <Text size="xs" c="dimmed" fw={600} truncate>{currentTrack.artist}</Text>
                        </div>
                    </Group>

                    <Group gap={4}>
                        <ActionIcon variant="subtle" color="gray" onClick={prevTrack}>
                            <IconPlayerSkipBack size={18} />
                        </ActionIcon>
                        <ActionIcon
                            variant="filled"
                            color={currentTrack.color}
                            size="lg"
                            radius="xl"
                            onClick={togglePlay}
                            style={{ boxShadow: `0 4px 12px ${getTrackColor(3)}` }}
                        >
                            {isPlaying ? <IconPlayerPause size={20} /> : <IconPlayerPlay size={20} />}
                        </ActionIcon>
                        <ActionIcon variant="subtle" color="gray" onClick={nextTrack}>
                            <IconPlayerSkipForward size={18} />
                        </ActionIcon>
                    </Group>
                </Group>

                <Group gap="xs">
                    <IconVolume size={16} color="gray" />
                    <Slider
                        style={{ flex: 1 }}
                        size="xs"
                        color={currentTrack.color}
                        label={null}
                        value={volume}
                        onChange={setVolume}
                    />
                </Group>
            </Stack>

            {/* Visualizer Dots */}
            {isPlaying && (
                <Group gap={2} justify="center" mt="xs">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <motion.div
                            key={i}
                            animate={{
                                height: [4, 12, 4],
                            }}
                            transition={{
                                duration: 0.5 + Math.random() * 0.5,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: i * 0.1
                            }}
                            style={{
                                width: 3,
                                borderRadius: 10,
                                backgroundColor: getTrackColor(6)
                            }}
                        />
                    ))}
                </Group>
            )}
        </Paper>
    );
}
