import { useState } from 'react';
import { Paper, TextInput, PasswordInput, Button, Title, Text, Stack, Container, Box, Group, Checkbox, Anchor, Divider } from '@mantine/core';
import { IconHeartHandshake, IconMail, IconLock, IconArrowRight, IconUserPlus, IconBrandGoogle, IconBrandApple, IconArrowLeft } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';
import { notifications } from '@mantine/notifications';

export function AuthPage() {
    const [type, setType] = useState<'login' | 'signup'>('login');
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [resetPassword, setResetPassword] = useState(false);

    const handleSocialLogin = async (provider: 'google' | 'apple') => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: provider,
            });
            if (error) throw error;
        } catch (error: any) {
            notifications.show({
                title: 'Login Error',
                message: error.message,
                color: 'red'
            });
        }
    };

    const handleSubmit = async () => {
        if (!email) {
            notifications.show({ message: 'Please enter your email', color: 'orange' });
            return;
        }

        if (!resetPassword && !password) {
            notifications.show({ message: 'Please enter your password', color: 'orange' });
            return;
        }

        setLoading(true);
        try {
            if (resetPassword) {
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: window.location.origin + '/reset-password',
                });
                if (error) throw error;
                notifications.show({
                    title: 'Check your email 📧',
                    message: 'Password reset link has been sent.',
                    color: 'blue'
                });
                setResetPassword(false);
            } else if (type === 'login') {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                notifications.show({
                    title: 'Welcome Back! 🎉',
                    message: 'Successfully logged in to Swasth AI',
                    color: 'teal'
                });
            } else {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                notifications.show({
                    title: 'Account Created! ✨',
                    message: 'Check your email to verify your account.',
                    color: 'violet'
                });
            }
        } catch (error:
            unknown) {
            console.error('Auth Error:', error);
            let message = error instanceof Error ? error.message : "An unexpected error occurred";

            if (message.includes('Failed to fetch')) {
                message = 'Connection failed. Please check your internet or disable AdBlocker.';
            }

            notifications.show({
                title: 'Authentication Error',
                message: message,
                color: 'red'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            h="100vh"
            w="100vw"
            style={{
                overflow: 'hidden',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                background: '#0f0c29'
            }}
        >
            {/* Meditation Background Image */}
            <Box
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: 'url(/meditation-bg.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    zIndex: 0
                }}
            />

            {/* Subtle Overlay for Contrast */}
            <Box
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.2) 50%, rgba(240, 147, 251, 0.15) 100%)',
                    zIndex: 0
                }}
            />

            {/* Enhanced Floating Particles */}
            {[...Array(25)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{
                        x: Math.random() * window.innerWidth,
                        y: Math.random() * window.innerHeight,
                        scale: Math.random() * 0.5 + 0.5,
                        opacity: Math.random() * 0.5 + 0.3
                    }}
                    animate={{
                        y: [null, Math.random() * window.innerHeight],
                        x: [null, Math.random() * window.innerWidth],
                        scale: [null, Math.random() * 0.8 + 0.4, Math.random() * 0.5 + 0.5],
                        opacity: [null, Math.random() * 0.7 + 0.2, Math.random() * 0.5 + 0.3],
                        rotate: [0, 360]
                    }}
                    transition={{
                        duration: Math.random() * 15 + 10,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut"
                    }}
                    style={{
                        position: 'absolute',
                        width: Math.random() * 8 + 3 + 'px',
                        height: Math.random() * 8 + 3 + 'px',
                        borderRadius: '50%',
                        background: `radial-gradient(circle, rgba(255, 255, 255, ${Math.random() * 0.6 + 0.4}), rgba(255, 255, 255, 0.1))`,
                        boxShadow: `0 0 ${Math.random() * 15 + 5}px rgba(255, 255, 255, 0.6)`,
                        zIndex: 1
                    }}
                />
            ))}

            {/* Decorative Blobs - Left Side */}
            <motion.div
                initial={{ x: -100, opacity: 0, rotate: 0 }}
                animate={{
                    x: 0,
                    opacity: 0.4,
                    rotate: 360,
                    scale: [1, 1.05, 1]
                }}
                transition={{
                    duration: 2,
                    delay: 0.2,
                    rotate: { duration: 30, repeat: Infinity, ease: "linear" },
                    scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                }}
                style={{
                    position: 'absolute',
                    left: '5%',
                    top: '15%',
                    width: '250px',
                    height: '250px',
                    zIndex: 1
                }}
            >
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style={{ stopColor: '#FFB7D5', stopOpacity: 0.8 }} />
                            <stop offset="100%" style={{ stopColor: '#C9F0FF', stopOpacity: 0.8 }} />
                        </linearGradient>
                    </defs>
                    <path fill="url(#grad1)" d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,90,-16.3,88.5,-0.9C87,14.6,81.4,29.2,73.1,42.8C64.8,56.4,53.8,69,40.1,76.8C26.4,84.6,10,87.6,-5.8,87.1C-21.6,86.6,-36.8,82.6,-49.9,74.5C-63,66.4,-74,54.2,-80.8,39.8C-87.6,25.4,-90.2,8.8,-88.5,-7.2C-86.8,-23.2,-80.8,-38.6,-71.5,-51.8C-62.2,-65,-49.6,-76,-35.8,-82.8C-22,-89.6,-7,-92.2,6.8,-91.8C20.6,-91.4,30.6,-83.6,44.7,-76.4Z" transform="translate(100 100)" />
                </svg>
            </motion.div>

            {/* Decorative Blobs - Right Side */}
            <motion.div
                initial={{ x: 100, opacity: 0, rotate: 0 }}
                animate={{
                    x: 0,
                    opacity: 0.4,
                    rotate: -360,
                    scale: [1, 1.08, 1]
                }}
                transition={{
                    duration: 2,
                    delay: 0.3,
                    rotate: { duration: 25, repeat: Infinity, ease: "linear" },
                    scale: { duration: 5, repeat: Infinity, ease: "easeInOut" }
                }}
                style={{
                    position: 'absolute',
                    right: '5%',
                    top: '20%',
                    width: '220px',
                    height: '220px',
                    zIndex: 1
                }}
            >
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style={{ stopColor: '#C9F0FF', stopOpacity: 0.8 }} />
                            <stop offset="100%" style={{ stopColor: '#A8E6CF', stopOpacity: 0.8 }} />
                        </linearGradient>
                    </defs>
                    <path fill="url(#grad2)" d="M39.5,-65.5C51.4,-58.2,61.3,-47.3,68.5,-34.8C75.7,-22.3,80.2,-8.2,79.8,5.7C79.4,19.6,74.1,33.3,65.8,45.2C57.5,57.1,46.2,67.2,33.1,73.4C20,79.6,5.1,81.9,-9.5,80.8C-24.1,79.7,-38.4,75.2,-51.3,67.9C-64.2,60.6,-75.7,50.5,-82.4,37.8C-89.1,25.1,-91,9.8,-88.5,-4.5C-86,-18.8,-79.1,-32.1,-69.8,-43.8C-60.5,-55.5,-48.8,-65.6,-35.8,-72.3C-22.8,-79,-11.4,-82.3,1.3,-84.3C14,-86.3,27.6,-72.8,39.5,-65.5Z" transform="translate(100 100)" />
                </svg>
            </motion.div>

            {/* Bottom Decorative Blob */}
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 0.3 }}
                transition={{ duration: 2, delay: 0.4 }}
                style={{
                    position: 'absolute',
                    bottom: '-50px',
                    left: '30%',
                    width: '300px',
                    height: '300px',
                    zIndex: 1
                }}
            >
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style={{ stopColor: '#FFD700', stopOpacity: 0.6 }} />
                            <stop offset="100%" style={{ stopColor: '#FFA500', stopOpacity: 0.6 }} />
                        </linearGradient>
                    </defs>
                    <path fill="url(#grad3)" d="M47.3,-78.7C61.1,-71.4,71.9,-58.2,78.8,-43.2C85.7,-28.2,88.7,-11.4,87.5,5.1C86.3,21.6,81,37.8,71.8,51.2C62.6,64.6,49.5,75.2,34.8,80.9C20.1,86.6,3.8,87.4,-12.1,85.3C-28,83.2,-43.5,78.2,-57.3,69.8C-71.1,61.4,-83.2,49.6,-88.8,35.2C-94.4,20.8,-93.5,3.8,-89.1,-11.5C-84.7,-26.8,-76.8,-40.4,-65.8,-52.8C-54.8,-65.2,-40.7,-76.4,-25.3,-82.3C-9.9,-88.2,6.8,-88.8,22.4,-84.9C38,-81,52.5,-72.6,47.3,-78.7Z" transform="translate(100 100)" />
                </svg>
            </motion.div>



            {/* Top Heading */}
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                style={{
                    position: 'absolute',
                    top: '5%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    textAlign: 'center',
                    zIndex: 1,
                    width: '90%',
                    maxWidth: '800px'
                }}
            >
                <Text
                    size="32px"
                    fw={700}
                    c="white"
                    style={{
                        textShadow: '0 4px 20px rgba(0,0,0,0.3)',
                        fontStyle: 'italic',
                        lineHeight: 1.2
                    }}
                >
                    Your Next <span style={{ color: '#FFD700', fontWeight: 900 }}>AI-Crafted</span> Wellness Journey
                </Text>
            </motion.div>

            <Container size="xs" style={{ zIndex: 2, position: 'relative', maxWidth: '420px', marginLeft: '8%', marginTop: '80px' }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                >
                    <Paper
                        radius="28px"
                        p={32}
                        shadow="2xl"
                        style={{
                            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.95) 0%, rgba(118, 75, 162, 0.95) 100%)',
                            backdropFilter: 'blur(20px)',
                            border: '2px solid rgba(255, 255, 255, 0.3)',
                            boxShadow: '0 40px 80px -20px rgba(0, 0, 0, 0.4)'
                        }}
                    >
                        <Stack gap="md">
                            {/* Logo/Icon */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
                                style={{ textAlign: 'center' }}
                            >
                                <Box
                                    style={{
                                        width: '70px',
                                        height: '70px',
                                        margin: '0 auto',
                                        background: 'white',
                                        borderRadius: '18px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                                    }}
                                >
                                    <IconHeartHandshake size={40} color="#667eea" stroke={2.5} />
                                </Box>
                            </motion.div>

                            {/* Title */}
                            <Stack gap={2} align="center">
                                <Title
                                    order={2}
                                    fw={700}
                                    c="white"
                                    style={{ fontSize: '20px' }}
                                >
                                    {resetPassword ? 'Reset Password' : (type === 'login' ? 'Login to your account' : 'Create your account')}
                                </Title>
                            </Stack>

                            {/* Form Fields */}
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={type}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Stack gap="md">
                                        <Box>
                                            <Text size="sm" fw={600} c="rgba(255,255,255,0.9)" mb={6}>Email Address</Text>
                                            <motion.div whileHover={{ scale: 1.01 }} whileFocus={{ scale: 1.02 }}>
                                                <TextInput
                                                    placeholder="jane@gmail.com"
                                                    radius="lg"
                                                    size="md"
                                                    leftSection={<IconMail size={18} />}
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    styles={{
                                                        input: {
                                                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                            border: 'none',
                                                            height: '46px',
                                                            fontSize: '14px',
                                                            fontWeight: 500,
                                                            color: '#1a1a1a',
                                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                            '&:focus': {
                                                                boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.3)',
                                                                transform: 'translateY(-1px)'
                                                            },
                                                            '&::placeholder': {
                                                                color: '#999'
                                                            }
                                                        }
                                                    }}
                                                />
                                            </motion.div>
                                        </Box>

                                        {!resetPassword && (
                                            <Box>
                                                <Text size="sm" fw={600} c="rgba(255,255,255,0.9)" mb={6}>Password</Text>
                                                <motion.div whileHover={{ scale: 1.01 }} whileFocus={{ scale: 1.02 }}>
                                                    <PasswordInput
                                                        placeholder="••••••••••"
                                                        radius="lg"
                                                        size="md"
                                                        leftSection={<IconLock size={18} />}
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        styles={{
                                                            input: {
                                                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                                border: 'none',
                                                                height: '46px',
                                                                fontSize: '14px',
                                                                fontWeight: 500,
                                                                color: '#1a1a1a',
                                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                                '&:focus': {
                                                                    boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.3)',
                                                                    transform: 'translateY(-1px)'
                                                                },
                                                                '&::placeholder': {
                                                                    color: '#999'
                                                                }
                                                            }
                                                        }}
                                                    />
                                                </motion.div>
                                            </Box>
                                        )}

                                        {type === 'login' && !resetPassword && (
                                            <Group justify="space-between">
                                                <Checkbox
                                                    label={<Text size="sm" c="white">Keep me logged in</Text>}
                                                    checked={rememberMe}
                                                    onChange={(e) => setRememberMe(e.currentTarget.checked)}
                                                    styles={{
                                                        input: { backgroundColor: 'rgba(255,255,255,0.2)', borderColor: 'white' }
                                                    }}
                                                />
                                                <Anchor size="sm" c="white" fw={600} onClick={() => setResetPassword(true)}>
                                                    Forgot password?
                                                </Anchor>
                                            </Group>
                                        )}

                                        <motion.div
                                            whileHover={{ scale: 1.03, y: -2 }}
                                            whileTap={{ scale: 0.97 }}
                                            transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                        >
                                            <Button
                                                fullWidth
                                                radius="lg"
                                                size="lg"
                                                onClick={handleSubmit}
                                                loading={loading}
                                                rightSection={resetPassword ? <IconArrowRight size={20} /> : (type === 'login' ? <IconArrowRight size={20} /> : <IconUserPlus size={20} />)}
                                                style={{
                                                    height: '50px',
                                                    fontSize: '15px',
                                                    fontWeight: 700,
                                                    background: 'linear-gradient(135deg, #38d9a9 0%, #20c997 100%)',
                                                    border: 'none',
                                                    boxShadow: '0 8px 20px rgba(32, 201, 151, 0.4)',
                                                    color: 'white',
                                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                                }}
                                            >
                                                {resetPassword ? 'Send Reset Link' : (type === 'login' ? 'Login' : 'Sign Up')}
                                            </Button>
                                        </motion.div>

                                        {resetPassword ? (
                                            <Anchor component="button" size="sm" c="white" fw={600} onClick={() => setResetPassword(false)} style={{ margin: '0 auto', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <IconArrowLeft size={16} /> Back to Login
                                            </Anchor>
                                        ) : (
                                            <>
                                                <Divider label={<Text size="sm" c="white" fw={600}>OR</Text>} labelPosition="center" color="rgba(255,255,255,0.3)" />

                                                <Group grow>
                                                    <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                                                        <Button
                                                            variant="white"
                                                            radius="lg"
                                                            leftSection={<IconBrandApple size={20} />}
                                                            style={{ height: '44px', fontWeight: 600, fontSize: '14px', transition: 'all 0.2s ease' }}
                                                            onClick={() => handleSocialLogin('apple')}
                                                        >
                                                            Apple
                                                        </Button>
                                                    </motion.div>
                                                    <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                                                        <Button
                                                            variant="white"
                                                            radius="lg"
                                                            leftSection={<IconBrandGoogle size={20} />}
                                                            style={{ height: '44px', fontWeight: 600, fontSize: '14px', transition: 'all 0.2s ease' }}
                                                            onClick={() => handleSocialLogin('google')}
                                                        >
                                                            Google
                                                        </Button>
                                                    </motion.div>
                                                </Group>
                                            </>
                                        )}
                                    </Stack>
                                </motion.div>
                            </AnimatePresence>

                            {/* Switch Auth Type */}
                            {!resetPassword && (
                                <Text ta="center" size="sm" c="white">
                                    {type === 'login' ? "Don't have an account? " : "Already have an account? "}
                                    <Anchor
                                        fw={700}
                                        c="white"
                                        onClick={() => setType(type === 'login' ? 'signup' : 'login')}
                                        style={{ textDecoration: 'underline', cursor: 'pointer' }}
                                    >
                                        {type === 'login' ? 'Sign Up' : 'Login'}
                                    </Anchor>
                                </Text>
                            )}
                        </Stack>
                    </Paper>

                    {/* Footer */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                    >
                        <Text ta="center" mt="md" size="xs" c="white" fw={600} style={{ textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                            Your daily companion for peace and focus 🌱
                        </Text>
                    </motion.div>
                </motion.div>
            </Container>
        </Box>
    );
}
