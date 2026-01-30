import { useState, useRef, useEffect } from 'react';
import { Paper, TextInput, Stack, Text, Group, ScrollArea, Avatar, ActionIcon, Box, useMantineColorScheme, Loader, Center, Badge, ThemeIcon, rem } from '@mantine/core';
import { IconSend, IconSparkles, IconRefresh, IconMessageCircle, IconRobot } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import { updateStats } from '../utils/stats';

interface Message {
    id: string;
    role: 'user' | 'swasth';
    text: string;
}

export function Chatbot() {
    const [messages, setMessages] = useState<Message[]>(() => {
        const saved = localStorage.getItem('swasth_conversation');
        return saved ? JSON.parse(saved) : [{
            id: 'initial',
            role: 'swasth',
            text: "Hello! I'm Swasth, your AI wellness companion. 🌟 I'm here to support your mental health journey, answer questions, and provide guidance. How can I help you today?"
        }];
    });
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const viewport = useRef<HTMLDivElement>(null);
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const scrollToBottom = () => {
        viewport.current?.scrollTo({ top: viewport.current.scrollHeight, behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
        localStorage.setItem('swasth_conversation', JSON.stringify(messages));
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isTyping) return;

        const userText = input.trim();
        const userMsg: Message = { id: Date.now().toString(), role: 'user', text: userText };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            const history = messages.slice(-10).map(msg => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [msg.text]
            }));

            const { data } = await api.post('/chat', {
                message: userText,
                history: history
            });

            const swasthMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'swasth',
                text: data.response
            };

            updateStats('chat_messages', 1);

            setMessages(prev => [...prev, swasthMsg]);
        } catch (error: any) {
            console.error('❌ Chatbot Connection Error:', {
                message: error.message,
                url: error.config?.url,
                method: error.config?.method,
                baseURL: error.config?.baseURL,
                status: error.response?.status
            });
            setMessages(prev => [...prev, {
                id: 'error',
                role: 'swasth',
                text: "I'm having trouble connecting right now. Please try again in a moment. 🔄"
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <Center h="100%" w="100%">
            <Paper
                p={0}
                radius="32px"
                h="100%"
                w="100%"
                maw="1000px"
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    border: 'none',
                    background: isDark
                        ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)'
                        : 'linear-gradient(135deg, rgba(139, 92, 246, 0.03) 0%, rgba(59, 130, 246, 0.03) 100%)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: isDark
                        ? '0 20px 60px rgba(139, 92, 246, 0.3)'
                        : '0 20px 60px rgba(139, 92, 246, 0.2)',
                    position: 'relative'
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
                        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
                        filter: 'blur(60px)',
                        animation: 'float 8s ease-in-out infinite',
                        pointerEvents: 'none'
                    }}
                />
                <Box
                    style={{
                        position: 'absolute',
                        bottom: -100,
                        left: -100,
                        width: 300,
                        height: 300,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
                        filter: 'blur(60px)',
                        animation: 'float 8s ease-in-out infinite 4s',
                        pointerEvents: 'none'
                    }}
                />

                {/* Enhanced Header */}
                <Box
                    p="xl"
                    style={{
                        borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                        background: isDark
                            ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)'
                            : 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)',
                        backdropFilter: 'blur(10px)',
                        position: 'relative',
                        zIndex: 1
                    }}
                >
                    <Group justify="space-between">
                        <Group gap="md">
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
                                <Avatar
                                    size={56}
                                    radius="xl"
                                    style={{
                                        background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
                                        border: `3px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(139, 92, 246, 0.3)'}`,
                                        boxShadow: '0 8px 24px rgba(139, 92, 246, 0.4)'
                                    }}
                                >
                                    <IconSparkles size={28} color="white" stroke={2.5} />
                                </Avatar>
                            </motion.div>
                            <div>
                                <Group gap="xs" mb={4}>
                                    <Text fw={900} size="xl" style={{
                                        background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text'
                                    }}>
                                        Swasth AI
                                    </Text>
                                    <Badge
                                        variant="dot"
                                        color="green"
                                        size="lg"
                                        style={{ fontWeight: 800 }}
                                    >
                                        Online
                                    </Badge>
                                </Group>
                                <Text size="sm" c="dimmed" fw={600}>
                                    Your AI Wellness Companion
                                </Text>
                            </div>
                        </Group>
                        <motion.div whileTap={{ scale: 0.9 }}>
                            <ActionIcon
                                variant="light"
                                color="violet"
                                size="lg"
                                radius="xl"
                                onClick={() => {
                                    if (confirm("Clear conversation history?")) {
                                        setMessages([{ id: 'initial', role: 'swasth', text: "Hello! I'm Swasth, your AI wellness companion. 🌟 I'm here to support your mental health journey, answer questions, and provide guidance. How can I help you today?" }]);
                                        localStorage.removeItem('swasth_conversation');
                                    }
                                }}
                            >
                                <IconRefresh size={20} stroke={2.5} />
                            </ActionIcon>
                        </motion.div>
                    </Group>
                </Box>

                {/* Enhanced Chat Area */}
                <ScrollArea viewportRef={viewport} style={{ flex: 1 }} p="xl">
                    <Stack gap="lg">
                        <AnimatePresence initial={false}>
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ duration: 0.3, ease: 'easeOut' }}
                                >
                                    <Group
                                        justify={msg.role === 'user' ? 'flex-end' : 'flex-start'}
                                        align="flex-start"
                                        gap="sm"
                                    >
                                        {msg.role === 'swasth' && (
                                            <Avatar
                                                size={36}
                                                radius="xl"
                                                style={{
                                                    background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
                                                    flexShrink: 0,
                                                    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
                                                }}
                                            >
                                                <IconRobot size={20} color="white" stroke={2.5} />
                                            </Avatar>
                                        )}
                                        <motion.div
                                            whileHover={{ scale: 1.01 }}
                                            transition={{ duration: 0.2 }}
                                            style={{ maxWidth: msg.role === 'user' ? '60%' : '70%' }}
                                        >
                                            <Paper
                                                p={msg.role === 'user' ? 'sm' : 'md'}
                                                px={msg.role === 'user' ? 'md' : 'lg'}
                                                radius="18px"
                                                style={{
                                                    background: msg.role === 'user'
                                                        ? 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)'
                                                        : isDark
                                                            ? 'rgba(255,255,255,0.05)'
                                                            : 'white',
                                                    border: msg.role === 'swasth'
                                                        ? `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`
                                                        : 'none',
                                                    boxShadow: msg.role === 'user'
                                                        ? '0 4px 16px rgba(139, 92, 246, 0.35)'
                                                        : isDark
                                                            ? '0 2px 8px rgba(0,0,0,0.3)'
                                                            : '0 2px 8px rgba(0,0,0,0.08)',
                                                    color: msg.role === 'user' ? 'white' : 'inherit',
                                                    display: 'inline-block',
                                                    width: 'fit-content',
                                                    maxWidth: '100%'
                                                }}
                                            >
                                                <Text
                                                    size="sm"
                                                    fw={msg.role === 'user' ? 600 : 500}
                                                    style={{
                                                        lineHeight: 1.6,
                                                        whiteSpace: 'pre-wrap',
                                                        wordBreak: 'break-word'
                                                    }}
                                                >
                                                    {msg.text}
                                                </Text>
                                            </Paper>
                                        </motion.div>
                                        {msg.role === 'user' && (
                                            <ThemeIcon
                                                size={32}
                                                radius="xl"
                                                variant="light"
                                                color="violet"
                                                style={{ flexShrink: 0 }}
                                            >
                                                <IconMessageCircle size={18} stroke={2.5} />
                                            </ThemeIcon>
                                        )}
                                    </Group>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {isTyping && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                            >
                                <Group gap="sm">
                                    <Avatar
                                        size={36}
                                        radius="xl"
                                        style={{
                                            background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
                                            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
                                        }}
                                    >
                                        <IconRobot size={20} color="white" stroke={2.5} />
                                    </Avatar>
                                    <Paper
                                        p="md"
                                        px="lg"
                                        radius="18px"
                                        style={{
                                            background: isDark ? 'rgba(255,255,255,0.05)' : 'white',
                                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                                            boxShadow: isDark
                                                ? '0 2px 8px rgba(0,0,0,0.3)'
                                                : '0 2px 8px rgba(0,0,0,0.08)'
                                        }}
                                    >
                                        <Group gap="sm">
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                            >
                                                <Loader size="sm" color="violet" />
                                            </motion.div>
                                            <Text size="sm" c="dimmed" fw={600}>Swasth is thinking...</Text>
                                        </Group>
                                    </Paper>
                                </Group>
                            </motion.div>
                        )}
                    </Stack>
                </ScrollArea>

                {/* Enhanced Input Area */}
                <Box
                    p="xl"
                    style={{
                        background: isDark
                            ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)'
                            : 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)',
                        borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                        backdropFilter: 'blur(10px)',
                        position: 'relative',
                        zIndex: 1
                    }}
                >
                    <Group gap="md" align="flex-end">
                        <TextInput
                            placeholder="Share your thoughts or ask me anything..."
                            style={{ flex: 1 }}
                            value={input}
                            radius="xl"
                            size="lg"
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            styles={{
                                input: {
                                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'white',
                                    border: `2px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(139, 92, 246, 0.2)'}`,
                                    color: isDark ? 'white' : 'black',
                                    padding: rem(14),
                                    fontSize: rem(15),
                                    fontWeight: 500,
                                    transition: 'all 0.3s ease',
                                    '&:focus': {
                                        borderColor: '#8b5cf6',
                                        boxShadow: '0 0 0 4px rgba(139, 92, 246, 0.15)',
                                        backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'white'
                                    },
                                    '&::placeholder': {
                                        color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'
                                    }
                                }
                            }}
                        />
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <ActionIcon
                                size={54}
                                radius="xl"
                                variant="gradient"
                                gradient={{ from: '#8b5cf6', to: '#3b82f6', deg: 135 }}
                                onClick={handleSend}
                                disabled={isTyping || !input.trim()}
                                style={{
                                    boxShadow: '0 8px 24px rgba(139, 92, 246, 0.4)',
                                    border: '2px solid rgba(255, 255, 255, 0.2)'
                                }}
                            >
                                <IconSend size={22} stroke={2.5} />
                            </ActionIcon>
                        </motion.div>
                    </Group>
                </Box>

                <style>
                    {`
                        @keyframes float {
                            0%, 100% { transform: translate(0, 0) scale(1); }
                            50% { transform: translate(30px, -30px) scale(1.1); }
                        }
                    `}
                </style>
            </Paper>
        </Center>
    );
}
