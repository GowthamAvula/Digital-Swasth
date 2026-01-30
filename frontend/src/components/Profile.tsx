import { useState, useEffect } from 'react';
import { Card, Text, Stack, TextInput, PasswordInput, Button, Group, Avatar, Divider, Badge, SimpleGrid } from '@mantine/core';
import { IconUser, IconMail, IconLock, IconDeviceFloppy, IconLogout, IconShieldCheck, IconTrophy } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { supabase } from '../supabaseClient';
import { notifications } from '@mantine/notifications';
import type { User } from '@supabase/supabase-js';

interface ProfileProps {
    user?: User | null;
}

export function Profile({ user: propUser }: ProfileProps) {
    const [userEmail, setUserEmail] = useState('');
    const [userName, setUserName] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [badges, setBadges] = useState<string[]>([]);

    useEffect(() => {
        const initializeUserData = async () => {
            let currentUser = propUser;

            if (!currentUser) {
                const { data } = await supabase.auth.getUser();
                currentUser = data.user;
            }

            if (currentUser) {
                setUserEmail(currentUser.email || '');
                setUserName(currentUser.user_metadata?.name || currentUser.email?.split('@')[0] || 'User');
            }
        };

        const loadStats = () => {
            const saved = localStorage.getItem('swasth_stats');
            if (saved) {
                const stats = JSON.parse(saved);
                setBadges(stats.badges || []);
            }
        };

        initializeUserData();
        loadStats();

        window.addEventListener('statsUpdated', loadStats);
        window.addEventListener('storage', loadStats);
        return () => {
            window.removeEventListener('statsUpdated', loadStats);
            window.removeEventListener('storage', loadStats);
        };
    }, [propUser]);

    const handleUpdateProfile = async () => {
        if (!userName.trim()) {
            notifications.show({
                title: 'Error',
                message: 'Display name cannot be empty',
                color: 'red'
            });
            return;
        }

        setLoading(true);
        try {
            // Get current session for the token
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.access_token) throw new Error("No active session");

            // Proxy the request through our backend to bypass browser blocks
            const response = await fetch('http://localhost:8000/profile/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ name: userName })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || 'Backend update failed');
            }

            // Manually refresh the local user data to reflect changes
            await supabase.auth.refreshSession();

            notifications.show({
                title: 'Profile Updated! ✨',
                message: 'Your display name has been updated',
                color: 'teal'
            });
        } catch (error: any) {
            console.error('Profile Update Error:', error);
            let errorMessage = error.message || 'Could not update profile';

            if (errorMessage.includes('Failed to fetch')) {
                errorMessage = 'Connection failed. Please check your internet or disable AdBlocker.';
            }

            notifications.show({
                title: 'Update Failed',
                message: errorMessage,
                color: 'red'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            notifications.show({
                title: 'Missing Fields',
                message: 'Please fill in all password fields',
                color: 'orange'
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            notifications.show({
                title: 'Password Mismatch',
                message: 'New passwords do not match',
                color: 'red'
            });
            return;
        }

        if (newPassword.length < 6) {
            notifications.show({
                title: 'Weak Password',
                message: 'Password must be at least 6 characters',
                color: 'orange'
            });
            return;
        }

        setLoading(true);
        try {
            // Get current session for the token
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.access_token) throw new Error("No active session");

            // Proxy the request through our backend
            const response = await fetch('http://localhost:8000/profile/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ password: newPassword })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || 'Backend password update failed');
            }

            notifications.show({
                title: 'Success! 🎉',
                message: 'Your password has been updated',
                color: 'teal'
            });

            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            console.error('Password Update Error:', error);
            notifications.show({
                title: 'Update Failed',
                message: error.message || 'Could not update password',
                color: 'red'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;

            notifications.show({
                title: 'Signed Out',
                message: 'You have been signed out successfully',
                color: 'blue'
            });
        } catch (error: any) {
            // Force logout on error
            localStorage.removeItem('sb-bnpqocjasnkdwixcsfhu-auth-token');
            window.location.reload();

            notifications.show({
                title: 'Forced Sign Out',
                message: 'Network error detected. You have been locally signed out.',
                color: 'orange'
            });
        }
    };


    return (
        <Stack gap="xl">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Card radius="32px" p="xl" className="glass-panel" style={{ border: 'none' }}>
                    <Stack gap="xl">
                        {/* Profile Header */}
                        <Group justify="space-between">
                            <Group gap="lg">
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ type: "spring", stiffness: 400 }}
                                >
                                    <Avatar
                                        size={80}
                                        radius="xl"
                                        variant="gradient"
                                        gradient={{ from: 'violet', to: 'cyan', deg: 135 }}
                                        style={{ boxShadow: '0 10px 30px -5px rgba(102, 126, 234, 0.4)' }}
                                    >
                                        <Text size="32px" fw={900}>{userName?.[0]?.toUpperCase() || 'U'}</Text>
                                    </Avatar>
                                </motion.div>
                                <div>
                                    <Text size="28px" fw={900} style={{ letterSpacing: '-1px' }}>
                                        {userName}
                                    </Text>
                                    <Group gap="xs" mt={4}>
                                        <Badge variant="light" color="violet" leftSection={<IconShieldCheck size={14} />}>
                                            Verified Account
                                        </Badge>
                                        <Badge variant="light" color="orange" leftSection={<IconTrophy size={14} />}>
                                            {badges.length} Badges Earned
                                        </Badge>
                                    </Group>
                                </div>
                            </Group>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                    variant="light"
                                    color="red"
                                    leftSection={<IconLogout size={18} />}
                                    onClick={handleSignOut}
                                    radius="xl"
                                    size="md"
                                >
                                    Sign Out
                                </Button>
                            </motion.div>
                        </Group>

                        <Divider />

                        {/* Account Information */}
                        <Stack gap="md">
                            <Text size="lg" fw={800} c="dimmed">Account Information</Text>

                            <Group align="flex-end">
                                <TextInput
                                    label={<Text fw={700}>Display Name</Text>}
                                    placeholder="Your name"
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                    leftSection={<IconUser size={18} />}
                                    radius="lg"
                                    size="md"
                                    style={{ flex: 1 }}
                                    styles={{
                                        input: {
                                            backgroundColor: 'rgba(102, 126, 234, 0.05)',
                                            border: '2px solid rgba(102, 126, 234, 0.1)'
                                        }
                                    }}
                                />
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button
                                        radius="lg"
                                        size="md"
                                        color="violet"
                                        onClick={handleUpdateProfile}
                                        loading={loading}
                                    >
                                        Save
                                    </Button>
                                </motion.div>
                            </Group>

                            <TextInput
                                label={<Text fw={700}>Email Address</Text>}
                                placeholder="your@email.com"
                                value={userEmail}
                                leftSection={<IconMail size={18} />}
                                radius="lg"
                                size="md"
                                disabled
                                styles={{
                                    input: {
                                        backgroundColor: 'rgba(102, 126, 234, 0.05)',
                                        border: '2px solid rgba(102, 126, 234, 0.1)'
                                    }
                                }}
                            />
                        </Stack>

                        <Divider />

                        {/* Badges Section */}
                        <Stack gap="md">
                            <Text size="lg" fw={800} c="dimmed">My Badges</Text>
                            {badges.length > 0 ? (
                                <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="md">
                                    {badges.map((badge, index) => (
                                        <motion.div
                                            key={index}
                                            whileHover={{ scale: 1.05, rotate: 2 }}
                                            transition={{ type: "spring", stiffness: 400 }}
                                        >
                                            <Badge
                                                size="xl"
                                                variant="gradient"
                                                gradient={{ from: 'yellow', to: 'orange' }}
                                                leftSection={<IconShieldCheck size={16} />}
                                                fullWidth
                                                style={{ height: '48px', borderRadius: '12px', fontWeight: 800, fontSize: '12px' }}
                                            >
                                                {badge}
                                            </Badge>
                                        </motion.div>
                                    ))}
                                </SimpleGrid>
                            ) : (
                                <Text size="sm" c="dimmed" fs="italic">Complete missions to earn badges!</Text>
                            )}
                        </Stack>

                        <Divider />

                        {/* Password Change Section */}
                        <Stack gap="md">
                            <Text size="lg" fw={800} c="dimmed">Change Password</Text>

                            <PasswordInput
                                label={<Text fw={700}>Current Password</Text>}
                                placeholder="Enter current password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                leftSection={<IconLock size={18} />}
                                radius="lg"
                                size="md"
                                styles={{
                                    input: {
                                        backgroundColor: 'rgba(102, 126, 234, 0.05)',
                                        border: '2px solid rgba(102, 126, 234, 0.1)',
                                        '&:focus': {
                                            borderColor: 'rgba(102, 126, 234, 0.5)',
                                            backgroundColor: 'white'
                                        }
                                    }
                                }}
                            />

                            <PasswordInput
                                label={<Text fw={700}>New Password</Text>}
                                placeholder="Enter new password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                leftSection={<IconLock size={18} />}
                                radius="lg"
                                size="md"
                                styles={{
                                    input: {
                                        backgroundColor: 'rgba(102, 126, 234, 0.05)',
                                        border: '2px solid rgba(102, 126, 234, 0.1)',
                                        '&:focus': {
                                            borderColor: 'rgba(102, 126, 234, 0.5)',
                                            backgroundColor: 'white'
                                        }
                                    }
                                }}
                            />

                            <PasswordInput
                                label={<Text fw={700}>Confirm New Password</Text>}
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                leftSection={<IconLock size={18} />}
                                radius="lg"
                                size="md"
                                styles={{
                                    input: {
                                        backgroundColor: 'rgba(102, 126, 234, 0.05)',
                                        border: '2px solid rgba(102, 126, 234, 0.1)',
                                        '&:focus': {
                                            borderColor: 'rgba(102, 126, 234, 0.5)',
                                            backgroundColor: 'white'
                                        }
                                    }
                                }}
                            />

                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Button
                                    fullWidth
                                    mt="md"
                                    radius="xl"
                                    size="lg"
                                    variant="gradient"
                                    gradient={{ from: 'violet', to: 'grape' }}
                                    onClick={handleUpdatePassword}
                                    loading={loading}
                                    leftSection={<IconDeviceFloppy size={20} />}
                                    style={{
                                        height: '56px',
                                        fontWeight: 800,
                                        boxShadow: '0 10px 25px -5px rgba(102, 126, 234, 0.4)'
                                    }}
                                >
                                    Update Password
                                </Button>
                            </motion.div>
                        </Stack>
                    </Stack>
                </Card>
            </motion.div>
        </Stack>
    );
}
