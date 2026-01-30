import { Group, Box, Tooltip, Text, Stack } from '@mantine/core';
import { motion } from 'framer-motion';

interface MoodHeatmapProps {
    data: { timestamp: string; value: number }[];
    daysToShow?: number;
}

export function MoodHeatmap({ data, daysToShow = 28 }: MoodHeatmapProps) {
    // Generate last N days
    const days = Array.from({ length: daysToShow }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (daysToShow - 1 - i));
        date.setHours(0, 0, 0, 0);
        return date;
    });

    const getMoodColor = (value: number) => {
        if (value >= 4.5) return 'var(--mantine-color-green-6)';
        if (value >= 3.5) return 'var(--mantine-color-lime-5)';
        if (value >= 2.5) return 'var(--mantine-color-yellow-4)';
        if (value >= 1.5) return 'var(--mantine-color-orange-5)';
        if (value >= 0.1) return 'var(--mantine-color-red-6)';
        return 'var(--mantine-color-gray-2)'; // Empty
    };

    const getMoodLabel = (value: number) => {
        if (value >= 4.5) return 'Awesome';
        if (value >= 3.5) return 'Good';
        if (value >= 2.5) return 'Okay';
        if (value >= 1.5) return 'Bad';
        if (value >= 0.1) return 'Awful';
        return 'No entry';
    };

    // Map data to days
    const dayMap = data.reduce((acc, entry) => {
        const d = new Date(entry.timestamp);
        d.setHours(0, 0, 0, 0);
        const dayKey = d.getTime();
        if (!acc[dayKey]) acc[dayKey] = [];
        acc[dayKey].push(entry.value);
        return acc;
    }, {} as Record<number, number[]>);

    return (
        <Stack gap="xs">
            <Group gap={4} wrap="nowrap" justify="center">
                {days.map((day, i) => {
                    const values = dayMap[day.getTime()] || [];
                    const avgValue = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;

                    return (
                        <Tooltip
                            key={i}
                            label={`${day.toLocaleDateString()}: ${getMoodLabel(avgValue)}`}
                            withArrow
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: i * 0.02 }}
                            >
                                <Box
                                    style={{
                                        width: 14,
                                        height: 14,
                                        backgroundColor: getMoodColor(avgValue),
                                        borderRadius: '3px',
                                        cursor: 'pointer',
                                        opacity: avgValue === 0 ? 0.3 : 1
                                    }}
                                />
                            </motion.div>
                        </Tooltip>
                    );
                })}
            </Group>
            <Group justify="center" gap="md">
                <Group gap={4}><Box w={10} h={10} bg="green.6" style={{ borderRadius: 2 }} /><Text size="10px" c="dimmed">High</Text></Group>
                <Group gap={4}><Box w={10} h={10} bg="red.6" style={{ borderRadius: 2 }} /><Text size="10px" c="dimmed">Low</Text></Group>
            </Group>
        </Stack>
    );
}
