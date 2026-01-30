import { useState, useEffect, useRef } from 'react';
import { Card, Text, Group, Stack, Button, ThemeIcon, Progress, Center, Box, SimpleGrid, Badge, Grid, useMantineColorScheme, rem, Title } from '@mantine/core';
import { IconDeviceGamepad, IconBallBowling, IconTrophy, IconArrowLeft, IconBrain, IconLungs, IconPuzzle, IconRefresh, IconGridDots, IconFlower, IconVolume, IconVolumeOff, IconSparkles, IconRocket } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { updateStats } from '../utils/stats';

// --- Types & Interfaces ---
type GameType = 'menu' | 'zenpop' | '2048' | 'zenflow' | 'memory';

interface Bubble {
    id: number;
    x: number;
    y: number;
    size: number;
    color: string;
}

const MUSIC_CONFIG: Record<string, string> = {
    zenpop: 'https://www.chosic.com/wp-content/uploads/2021/04/Roa-Walk-Around.mp3',
    zenflow: 'https://www.chosic.com/wp-content/uploads/2021/05/Peaceful-Water-Stream-In-Forest.mp3',
    memory: 'https://www.chosic.com/wp-content/uploads/2021/05/Morning-Routine-Lofi-Study-Music.mp3',
    '2048': 'https://www.chosic.com/wp-content/uploads/2021/04/Swing-Machine.mp3',
};

// --- Game Components ---

// 1. ZEN POP (Original)
const ZenPopGame = ({ onExit }: { onExit: () => void }) => {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
    const [stressLevel, setStressLevel] = useState(100);
    const [score, setScore] = useState(0);
    const [bubbles, setBubbles] = useState<Bubble[]>([]);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | undefined;
        if (gameState === 'playing' && stressLevel > 0) {
            interval = setInterval(() => {
                const newBubble: Bubble = {
                    id: Date.now(),
                    x: Math.random() * 80 + 10,
                    y: Math.random() * 80 + 10,
                    size: Math.random() * 40 + 30,
                    color: ['cyan', 'pink', 'violet', 'teal', 'blue'][Math.floor(Math.random() * 5)]
                };
                setBubbles((prev) => [...prev, newBubble]);
                setTimeout(() => setBubbles((prev) => prev.filter(b => b.id !== newBubble.id)), 3000);
            }, 800);
        }
        return () => clearInterval(interval);
    }, [gameState, stressLevel]);

    const popBubble = (id: number) => {
        setBubbles((prev) => prev.filter(b => b.id !== id));
        setScore((prev) => prev + 10);
        updateStats('zen_points', 10);
        setStressLevel((prev) => {
            const next = Math.max(0, prev - 5);
            if (next <= 0 && gameState === 'playing') setGameState('finished');
            return next;
        });
    };

    const startGame = () => {
        setGameState('playing');
        setStressLevel(100);
        setScore(0);
        setBubbles([]);
    };

    return (
        <Stack h="100%" gap="md">
            <Group justify="space-between">
                <motion.div whileTap={{ scale: 0.95 }}>
                    <Button
                        variant="light"
                        color="orange"
                        leftSection={<IconArrowLeft size={18} stroke={2.5} />}
                        onClick={onExit}
                        radius="xl"
                        size="md"
                    >
                        Back to Menu
                    </Button>
                </motion.div>
                {gameState === 'playing' && (
                    <Stack gap={4} align="flex-end">
                        <Text fw={800} size="sm" c="dimmed">Stress Level</Text>
                        <Progress value={stressLevel} color="orange" w={200} size="lg" radius="xl" striped animated />
                    </Stack>
                )}
            </Group>

            <Card
                flex={1}
                radius="32px"
                p="xl"
                style={{
                    position: 'relative',
                    overflow: 'hidden',
                    background: isDark
                        ? 'linear-gradient(135deg, rgba(249, 115, 22, 0.15) 0%, rgba(234, 179, 8, 0.15) 100%)'
                        : 'linear-gradient(135deg, #fff9db 0%, #ffeaa7 100%)',
                    border: isDark ? '1px solid rgba(249, 115, 22, 0.3)' : 'none',
                    boxShadow: '0 20px 60px -15px rgba(249, 115, 22, 0.3)'
                }}
            >
                {gameState === 'idle' && (
                    <Center h="100%">
                        <Stack align="center" gap="xl">
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                                <ThemeIcon size={120} radius="xl" variant="gradient" gradient={{ from: 'orange', to: 'yellow' }}>
                                    <IconBallBowling size={60} stroke={2} />
                                </ThemeIcon>
                            </motion.div>
                            <Title order={2} fw={900} c={isDark ? 'orange.4' : 'orange.9'}>Ready to unwind?</Title>
                            <Text size="lg" c="dimmed" ta="center" maw={400}>
                                Pop the bubbles to release stress and find your calm
                            </Text>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                    size="xl"
                                    radius="xl"
                                    variant="gradient"
                                    gradient={{ from: 'orange', to: 'yellow' }}
                                    onClick={startGame}
                                    style={{ boxShadow: '0 8px 24px rgba(249, 115, 22, 0.4)' }}
                                >
                                    Start Zen Pop 🎯
                                </Button>
                            </motion.div>
                        </Stack>
                    </Center>
                )}
                {gameState === 'playing' && (
                    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                        <AnimatePresence>
                            {bubbles.map((bubble) => (
                                <motion.div
                                    key={bubble.id}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 1.5, opacity: 0 }}
                                    style={{
                                        position: 'absolute',
                                        left: `${bubble.x}%`,
                                        top: `${bubble.y}%`,
                                        width: bubble.size,
                                        height: bubble.size,
                                        borderRadius: '50%',
                                        backgroundColor: `var(--mantine-color-${bubble.color}-2)`,
                                        border: `3px solid var(--mantine-color-${bubble.color}-5)`,
                                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                                        cursor: 'pointer',
                                    }}
                                    onClick={() => popBubble(bubble.id)}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                />
                            ))}
                        </AnimatePresence>
                        <Badge
                            size="xl"
                            variant="filled"
                            color="orange"
                            style={{
                                position: 'absolute',
                                top: 20,
                                left: 20,
                                fontSize: rem(18),
                                fontWeight: 900
                            }}
                        >
                            Score: {score}
                        </Badge>
                    </div>
                )}
                {gameState === 'finished' && (
                    <Center h="100%">
                        <Stack align="center" gap="xl">
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring" }}
                            >
                                <IconTrophy size={120} color="var(--mantine-color-orange-6)" />
                            </motion.div>
                            <Title order={1} fw={900} c={isDark ? 'orange.4' : 'orange.9'}>Peace Achieved!</Title>
                            <Text size="xl" fw={700} c="dimmed">You popped {score / 10} bubbles!</Text>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                    size="xl"
                                    radius="xl"
                                    variant="gradient"
                                    gradient={{ from: 'orange', to: 'yellow' }}
                                    onClick={() => {
                                        updateStats('games_played', 1);
                                        startGame();
                                    }}
                                >
                                    Play Again
                                </Button>
                            </motion.div>
                        </Stack>
                    </Center>
                )}
            </Card>
        </Stack>
    );
};

// 2. ZEN FLOW (Interactive Ripple Game)
const ZenFlow = ({ onExit }: { onExit: () => void }) => {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

    const addRipple = (e: React.MouseEvent | React.TouchEvent) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const x = 'touches' in e
            ? (e as unknown as React.TouchEvent).touches[0].clientX - rect.left
            : (e as React.MouseEvent).clientX - rect.left;
        const y = 'touches' in e
            ? (e as unknown as React.TouchEvent).touches[0].clientY - rect.top
            : (e as React.MouseEvent).clientY - rect.top;

        const newRipple = { id: Date.now(), x, y };
        setRipples((prev) => [...prev, newRipple]);
        updateStats('zen_points', 5);

        setTimeout(() => {
            setRipples((prev) => prev.filter(r => r.id !== newRipple.id));
        }, 2000);
    };

    return (
        <Stack h="100%" gap="md">
            <Group justify="space-between">
                <motion.div whileTap={{ scale: 0.95 }}>
                    <Button
                        variant="light"
                        color="teal"
                        leftSection={<IconArrowLeft size={18} stroke={2.5} />}
                        onClick={onExit}
                        radius="xl"
                        size="md"
                    >
                        Back to Menu
                    </Button>
                </motion.div>
                <Badge size="lg" color="teal" variant="dot">Tap anywhere to create flow</Badge>
            </Group>
            <Card
                flex={1}
                radius="32px"
                p={0}
                style={{
                    background: isDark
                        ? 'linear-gradient(135deg, rgba(20, 184, 166, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)'
                        : 'linear-gradient(135deg, #e6fcf5 0%, #c3fae8 100%)',
                    border: isDark ? '1px solid rgba(20, 184, 166, 0.3)' : 'none',
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'crosshair',
                    boxShadow: '0 20px 60px -15px rgba(20, 184, 166, 0.3)'
                }}
                onMouseDown={addRipple}
                onTouchStart={addRipple}
            >
                <AnimatePresence>
                    {ripples.map((ripple) => (
                        <motion.div
                            key={ripple.id}
                            initial={{ scale: 0, opacity: 0.5 }}
                            animate={{ scale: 4, opacity: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 2, ease: "easeOut" }}
                            style={{
                                position: 'absolute',
                                left: ripple.x,
                                top: ripple.y,
                                width: 100,
                                height: 100,
                                marginLeft: -50,
                                marginTop: -50,
                                borderRadius: '50%',
                                border: '2px solid var(--mantine-color-teal-4)',
                                background: 'radial-gradient(circle, var(--mantine-color-teal-1) 0%, transparent 70%)',
                                pointerEvents: 'none'
                            }}
                        />
                    ))}
                </AnimatePresence>
                <Center h="100%">
                    <Stack align="center" gap="md" style={{ pointerEvents: 'none', userSelect: 'none' }}>
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        >
                            <IconFlower size={100} color="var(--mantine-color-teal-6)" opacity={0.2} />
                        </motion.div>
                        <Title order={2} fw={900} c="teal.6" opacity={0.3}>Zen Flow</Title>
                        <Text size="md" c="teal.7" opacity={0.4} ta="center" maw={300}>
                            Create ripples of calm with each touch
                        </Text>
                    </Stack>
                </Center>
            </Card>
        </Stack>
    );
};

// 3. MEMORY MATCH
const ICONS = [IconBallBowling, IconTrophy, IconBrain, IconLungs, IconPuzzle, IconDeviceGamepad, IconGridDots, IconRefresh];
const MemoryMatch = ({ onExit }: { onExit: () => void }) => {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const [cards, setCards] = useState<{ id: number; icon: any; flipped: boolean; matched: boolean }[]>([]);
    const [flipped, setFlipped] = useState<number[]>([]);
    const [matches, setMatches] = useState(0);

    useEffect(() => {
        const gameIcons = [...ICONS, ...ICONS]
            .sort(() => Math.random() - 0.5)
            .map((icon, i) => ({ id: i, icon, flipped: false, matched: false }));
        setCards(gameIcons);
    }, []);

    const handleFlip = (index: number) => {
        if (flipped.length === 2 || cards[index].flipped || cards[index].matched) return;

        const newCards = [...cards];
        newCards[index].flipped = true;
        setCards(newCards);

        const newFlipped = [...flipped, index];
        setFlipped(newFlipped);

        if (newFlipped.length === 2) {
            const [first, second] = newFlipped;
            if (cards[first].icon === cards[second].icon) {
                setTimeout(() => {
                    const matchedCards = [...cards];
                    matchedCards[first].matched = true;
                    matchedCards[second].matched = true;
                    setCards(matchedCards);
                    setFlipped([]);
                    setMatches(m => m + 1);
                }, 500);
            } else {
                setTimeout(() => {
                    const resetCards = [...cards];
                    resetCards[first].flipped = false;
                    resetCards[second].flipped = false;
                    setCards(resetCards);
                    setFlipped([]);
                }, 1000);
            }
        }
    };

    return (
        <Stack h="100%" gap="md">
            <Group justify="space-between">
                <motion.div whileTap={{ scale: 0.95 }}>
                    <Button
                        variant="light"
                        color="indigo"
                        leftSection={<IconArrowLeft size={18} stroke={2.5} />}
                        onClick={onExit}
                        radius="xl"
                        size="md"
                    >
                        Back to Menu
                    </Button>
                </motion.div>
                <Badge size="lg" variant="light" color="indigo">Pairs Found: {matches} / 8</Badge>
            </Group>

            <Card
                flex={1}
                radius="32px"
                padding="xl"
                style={{
                    background: isDark
                        ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)'
                        : 'linear-gradient(135deg, #f3f0ff 0%, #e0cffc 100%)',
                    border: isDark ? '1px solid rgba(99, 102, 241, 0.3)' : 'none',
                    boxShadow: '0 20px 60px -15px rgba(99, 102, 241, 0.3)'
                }}
            >
                {matches === 8 ? (
                    <Center h="100%">
                        <Stack align="center" gap="xl">
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring" }}
                            >
                                <IconTrophy size={120} color="var(--mantine-color-indigo-6)" />
                            </motion.div>
                            <Title order={1} fw={900} c={isDark ? 'indigo.4' : 'indigo.9'}>Brain Sharp!</Title>
                            <Text size="xl" fw={700} c="dimmed">Perfect memory! 🧠</Text>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                    size="xl"
                                    radius="xl"
                                    variant="gradient"
                                    gradient={{ from: 'violet', to: 'indigo' }}
                                    onClick={() => {
                                        updateStats('games_played', 1);
                                        window.location.reload();
                                    }}
                                >
                                    Play Again
                                </Button>
                            </motion.div>
                        </Stack>
                    </Center>
                ) : (
                    <Center h="100%">
                        <SimpleGrid cols={4} spacing="md">
                            {cards.map((card, i) => (
                                <motion.div
                                    key={card.id}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleFlip(i)}
                                >
                                    <Card
                                        w={100} h={100} radius="xl"
                                        style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            cursor: 'pointer',
                                            background: card.flipped || card.matched
                                                ? isDark ? 'rgba(255,255,255,0.1)' : 'white'
                                                : 'linear-gradient(135deg, var(--mantine-color-indigo-6), var(--mantine-color-violet-6))',
                                            border: `3px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'white'}`,
                                            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                                        }}
                                    >
                                        {(card.flipped || card.matched) ?
                                            <card.icon size={40} color="var(--mantine-color-indigo-6)" stroke={2} /> :
                                            <IconBrain size={30} color="rgba(255,255,255,0.5)" stroke={2} />
                                        }
                                    </Card>
                                </motion.div>
                            ))}
                        </SimpleGrid>
                    </Center>
                )}
            </Card>
        </Stack>
    );
};

// 4. 2048 (TILE SLIDE)
const Game2048 = ({ onExit }: { onExit: () => void }) => {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const [grid, setGrid] = useState<number[][]>(Array(4).fill(0).map(() => Array(4).fill(0)));
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);

    const initializeGame = () => {
        let newGrid = Array(4).fill(0).map(() => Array(4).fill(0));
        addRandomTile(newGrid); addRandomTile(newGrid);
        setGrid(newGrid); setScore(0); setGameOver(false);
    };

    const addRandomTile = (currentGrid: number[][]) => {
        let emptyCells = [];
        for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) if (currentGrid[r][c] === 0) emptyCells.push({ r, c });
        if (emptyCells.length > 0) {
            const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            currentGrid[r][c] = Math.random() < 0.9 ? 2 : 4;
        }
    };

    useEffect(() => { initializeGame(); }, []);

    const move = (direction: 'up' | 'down' | 'left' | 'right') => {
        if (gameOver) return;
        let newGrid = grid.map(row => [...row]);
        let moved = false;
        let addedScore = 0;

        const slide = (row: number[]) => {
            let arr = row.filter(val => val);
            for (let i = 0; i < arr.length - 1; i++) {
                if (arr[i] === arr[i + 1]) { arr[i] *= 2; addedScore += arr[i]; arr.splice(i + 1, 1); }
            }
            while (arr.length < 4) arr.push(0);
            return arr;
        };

        if (direction === 'left' || direction === 'right') {
            for (let r = 0; r < 4; r++) {
                let row = newGrid[r];
                if (direction === 'right') row.reverse();
                let newRow = slide(row);
                if (direction === 'right') newRow.reverse();
                if (JSON.stringify(newGrid[r]) !== JSON.stringify(newRow)) moved = true;
                newGrid[r] = newRow;
            }
        } else {
            for (let c = 0; c < 4; c++) {
                let col = [newGrid[0][c], newGrid[1][c], newGrid[2][c], newGrid[3][c]];
                if (direction === 'down') col.reverse();
                let newCol = slide(col);
                if (direction === 'down') newCol.reverse();
                for (let r = 0; r < 4; r++) {
                    if (newGrid[r][c] !== newCol[r]) moved = true;
                    newGrid[r][c] = newCol[r];
                }
            }
        }

        if (moved) {
            addRandomTile(newGrid);
            setGrid(newGrid);
            setScore(prev => prev + addedScore);
        } else {
            let movesPossible = false;
            if (newGrid.flat().includes(0)) {
                movesPossible = true;
            } else {
                for (let r = 0; r < 4; r++) {
                    for (let c = 0; c < 4; c++) {
                        const current = newGrid[r][c];
                        if (r < 3 && current === newGrid[r + 1][c]) movesPossible = true;
                        if (c < 3 && current === newGrid[r][c + 1]) movesPossible = true;
                    }
                }
            }
            if (!movesPossible) setGameOver(true);
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') move('left');
            else if (e.key === 'ArrowRight') move('right');
            else if (e.key === 'ArrowUp') move('up');
            else if (e.key === 'ArrowDown') move('down');
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [grid, gameOver]);

    const getTileColor = (val: number) => {
        if (val === 0) return isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
        if (val === 2) return '#eee4da';
        if (val === 4) return '#ede0c8';
        if (val === 8) return '#f2b179';
        if (val === 16) return '#f59563';
        if (val === 32) return '#f67c5f';
        if (val >= 64) return '#f65e3b';
        return '#edc22e';
    };

    return (
        <Stack h="100%" gap="md">
            <Group justify="space-between">
                <motion.div whileTap={{ scale: 0.95 }}>
                    <Button
                        variant="light"
                        color="gray"
                        leftSection={<IconArrowLeft size={18} stroke={2.5} />}
                        onClick={onExit}
                        radius="xl"
                        size="md"
                    >
                        Back to Menu
                    </Button>
                </motion.div>
                <Badge size="lg" variant="filled" color="gray">Score: {score}</Badge>
            </Group>
            <Card
                flex={1}
                radius="32px"
                padding="xl"
                style={{
                    background: isDark
                        ? 'linear-gradient(135deg, rgba(73, 80, 87, 0.15) 0%, rgba(52, 58, 64, 0.15) 100%)'
                        : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                    border: isDark ? '1px solid rgba(73, 80, 87, 0.3)' : 'none',
                    boxShadow: '0 20px 60px -15px rgba(73, 80, 87, 0.3)'
                }}
            >
                <Center h="100%">
                    <Stack align="center" gap="xl">
                        <Box style={{ background: '#bbada0', padding: '12px', borderRadius: '12px', position: 'relative' }}>
                            {gameOver && (
                                <Box style={{
                                    position: 'absolute',
                                    inset: 0,
                                    background: 'rgba(238, 228, 218, 0.85)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    zIndex: 10,
                                    borderRadius: '12px'
                                }}>
                                    <Text fw={900} size="xl" c="dark">Game Over!</Text>
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button mt="md" color="dark" radius="xl" onClick={initializeGame}>
                                            Try Again
                                        </Button>
                                    </motion.div>
                                </Box>
                            )}
                            <SimpleGrid cols={4} spacing="xs">
                                {grid.map((row, r) => row.map((val, c) => (
                                    <motion.div key={`${r}-${c}`} layout initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                                        <Box
                                            w={70}
                                            h={70}
                                            style={{
                                                borderRadius: '8px',
                                                background: getTileColor(val),
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: val > 100 ? '24px' : '30px',
                                                fontWeight: 900,
                                                color: val > 4 ? '#f9f6f2' : '#776e65',
                                                boxShadow: val > 0 ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'
                                            }}
                                        >
                                            {val > 0 ? val : ''}
                                        </Box>
                                    </motion.div>
                                )))}
                            </SimpleGrid>
                        </Box>
                        <Text size="sm" c="dimmed" fw={600} ta="center">
                            Use Arrow Keys to combine tiles to reach 2048
                        </Text>
                    </Stack>
                </Center>
            </Card>
        </Stack>
    );
};

// --- Main Menu Component ---
export function Games() {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const [activeGame, setActiveGame] = useState<GameType>('menu');
    const [soundEnabled, setSoundEnabled] = useState(true);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio();
            audioRef.current.loop = true;
        }

        const audio = audioRef.current;
        const track = MUSIC_CONFIG[activeGame];

        if (track && soundEnabled) {
            if (audio.src !== track) {
                audio.src = track;
                audio.load();
            }
            audio.play().catch(e => console.error("Audio play blocked", e));
        } else {
            audio.pause();
        }

        return () => {
            if (activeGame === 'menu') {
                audio.pause();
            }
        };
    }, [activeGame, soundEnabled]);

    const GAMES_LIST = [
        { id: 'zenpop', title: 'Zen Pop', desc: 'Pop bubbles to lower stress', icon: IconBallBowling, color: 'orange', gradient: { from: 'orange', to: 'yellow' } },
        { id: 'zenflow', title: 'Zen Flow', desc: 'Interactive ripple meditation', icon: IconFlower, color: 'teal', gradient: { from: 'teal', to: 'cyan' } },
        { id: 'memory', title: 'Mind Match', desc: 'Sharpen your focus gently', icon: IconBrain, color: 'indigo', gradient: { from: 'violet', to: 'indigo' } },
        { id: '2048', title: 'Tile Slide', desc: 'Can you reach the 2048 tile?', icon: IconGridDots, color: 'gray', gradient: { from: 'gray.6', to: 'gray.8' } },
    ];

    const renderGame = () => {
        if (activeGame === 'zenpop') return <Stack h="calc(100vh - 160px)"><ZenPopGame onExit={() => setActiveGame('menu')} /></Stack>;
        if (activeGame === 'zenflow') return <Stack h="calc(100vh - 160px)"><ZenFlow onExit={() => setActiveGame('menu')} /></Stack>;
        if (activeGame === 'memory') return <Stack h="calc(100vh - 160px)"><MemoryMatch onExit={() => setActiveGame('menu')} /></Stack>;
        if (activeGame === '2048') return <Stack h="calc(100vh - 160px)"><Game2048 onExit={() => setActiveGame('menu')} /></Stack>;

        return (
            <Stack gap="xl">
                {/* Hero Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Card
                        radius="32px"
                        p="xl"
                        style={{
                            background: isDark
                                ? 'linear-gradient(135deg, rgba(236, 72, 153, 0.2) 0%, rgba(249, 115, 22, 0.2) 100%)'
                                : 'linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(249, 115, 22, 0.1) 100%)',
                            border: 'none',
                            boxShadow: isDark
                                ? '0 20px 60px -15px rgba(236, 72, 153, 0.4)'
                                : '0 20px 60px -15px rgba(236, 72, 153, 0.25)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Animated Background Orbs */}
                        <Box
                            style={{
                                position: 'absolute',
                                top: -50,
                                right: -50,
                                width: 200,
                                height: 200,
                                borderRadius: '50%',
                                background: 'radial-gradient(circle, rgba(236, 72, 153, 0.3) 0%, transparent 70%)',
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
                                background: 'radial-gradient(circle, rgba(249, 115, 22, 0.3) 0%, transparent 70%)',
                                filter: 'blur(40px)',
                                animation: 'pulse 4s ease-in-out infinite 2s'
                            }}
                        />

                        <Group style={{ position: 'relative', zIndex: 1 }}>
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
                                    gradient={{ from: 'pink', to: 'orange' }}
                                    style={{
                                        boxShadow: '0 8px 24px rgba(236, 72, 153, 0.4)'
                                    }}
                                >
                                    <IconRocket size={36} stroke={2} />
                                </ThemeIcon>
                            </motion.div>
                            <div>
                                <Group gap="xs" mb={4}>
                                    <Title
                                        order={1}
                                        fw={900}
                                        style={{
                                            background: 'linear-gradient(135deg, #ec4899 0%, #f97316 100%)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            backgroundClip: 'text'
                                        }}
                                    >
                                        Relax & Games
                                    </Title>
                                    <Badge
                                        variant="light"
                                        color="pink"
                                        size="lg"
                                        leftSection={<IconSparkles size={14} />}
                                    >
                                        4 Games
                                    </Badge>
                                </Group>
                                <Text size="md" fw={600} c={isDark ? 'gray.3' : 'gray.7'}>
                                    Stress-relief games designed for focus & calm
                                </Text>
                            </div>
                        </Group>
                    </Card>
                </motion.div>

                {/* Games Grid */}
                <Grid gutter="xl">
                    {GAMES_LIST.map((game, i) => (
                        <Grid.Col span={{ base: 12, sm: 6 }} key={game.id}>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                whileHover={{ y: -8, scale: 1.02 }}
                            >
                                <Card
                                    radius="24px"
                                    p="xl"
                                    h="100%"
                                    style={{
                                        background: isDark
                                            ? `linear-gradient(135deg, rgba(${getColorRGB(game.color)}, 0.08) 0%, transparent 100%)`
                                            : `linear-gradient(135deg, rgba(${getColorRGB(game.color)}, 0.05) 0%, transparent 100%)`,
                                        border: isDark
                                            ? `1px solid rgba(${getColorRGB(game.color)}, 0.2)`
                                            : `1px solid rgba(${getColorRGB(game.color)}, 0.15)`,
                                        cursor: 'pointer',
                                        minHeight: '220px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                    onClick={() => setActiveGame(game.id as GameType)}
                                >
                                    <Box
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            height: '4px',
                                            background: `linear-gradient(90deg, var(--mantine-color-${game.color}-6), var(--mantine-color-${game.color}-4))`
                                        }}
                                    />
                                    <Group justify="space-between" align="start">
                                        <ThemeIcon
                                            size={80}
                                            radius="20px"
                                            variant="gradient"
                                            gradient={game.gradient}
                                            style={{
                                                boxShadow: `0 8px 24px rgba(${getColorRGB(game.color)}, 0.4)`
                                            }}
                                        >
                                            <game.icon size={40} stroke={2} />
                                        </ThemeIcon>
                                        <Badge
                                            size="lg"
                                            variant="light"
                                            color={game.color}
                                            style={{ fontWeight: 800 }}
                                        >
                                            PLAY
                                        </Badge>
                                    </Group>
                                    <div>
                                        <Title order={3} fw={900} mb={4}>{game.title}</Title>
                                        <Text size="md" c="dimmed" fw={500}>{game.desc}</Text>
                                    </div>
                                </Card>
                            </motion.div>
                        </Grid.Col>
                    ))}
                </Grid>

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
    };

    return (
        <Stack h="calc(100vh - 120px)">
            <Group justify="flex-end" mb="xs">
                <motion.div whileTap={{ scale: 0.95 }}>
                    <Button
                        variant="light"
                        color={soundEnabled ? "indigo" : "gray"}
                        radius="xl"
                        leftSection={soundEnabled ? <IconVolume size={18} stroke={2.5} /> : <IconVolumeOff size={18} stroke={2.5} />}
                        onClick={() => setSoundEnabled(!soundEnabled)}
                    >
                        {soundEnabled ? "Sound On" : "Sound Off"}
                    </Button>
                </motion.div>
            </Group>
            {renderGame()}
        </Stack>
    );
}

// Helper function to get RGB values for colors
function getColorRGB(color: string): string {
    const colorMap: { [key: string]: string } = {
        orange: '249, 115, 22',
        teal: '20, 184, 166',
        indigo: '99, 102, 241',
        gray: '73, 80, 87',
        pink: '236, 72, 153'
    };
    return colorMap[color] || '236, 72, 153';
}
