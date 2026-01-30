import { createTheme } from '@mantine/core';
import type { MantineColorsTuple } from '@mantine/core';

const deepViolet: MantineColorsTuple = [
    '#f5f3ff',
    '#ede9fe',
    '#ddd6fe',
    '#c4b5fd',
    '#a78bfa',
    '#8b5cf6',
    '#7c3aed',
    '#6d28d9',
    '#5b21b6',
    '#4c1d95',
];

const brightCyan: MantineColorsTuple = [
    '#ecfeff',
    '#cffafe',
    '#a5f3fc',
    '#67e8f9',
    '#22d3ee',
    '#06b6d4',
    '#0891b2',
    '#0e7490',
    '#155e75',
    '#164e63',
];

export const theme = createTheme({
    colors: {
        'deep-violet': deepViolet,
        'bright-cyan': brightCyan,
    },
    primaryColor: 'deep-violet',
    primaryShade: 6,
    defaultRadius: 'xl',
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    headings: {
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontWeight: '800',
    },
    shadows: {
        md: '0 8px 30px rgba(0, 0, 0, 0.08)',
        xl: '0 20px 40px rgba(0, 0, 0, 0.12)',
    },
    components: {
        Card: {
            defaultProps: {
                radius: '32px',
                shadow: 'md',
                withBorder: true,
            },
            styles: {
                root: {
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 15px 35px rgba(132, 94, 247, 0.15)',
                    }
                }
            }
        },
        Paper: {
            defaultProps: {
                radius: '32px',
            },
        },
        Button: {
            defaultProps: {
                radius: 'xl',
                size: 'md',
                variant: 'filled',
            },
            styles: {
                root: {
                    fontWeight: 700,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        filter: 'brightness(1.1)',
                    }
                }
            }
        },
        ActionIcon: {
            defaultProps: {
                radius: 'xl',
                variant: 'light',
                size: 'lg'
            },
            styles: {
                root: {
                    transition: 'all 0.2s ease',
                    '&:hover': {
                        transform: 'scale(1.1)',
                        backgroundColor: 'rgba(132, 94, 247, 0.1)',
                    }
                }
            }
        },
        Badge: {
            defaultProps: {
                radius: 'md',
                variant: 'light',
            },
            styles: {
                root: {
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    fontSize: '10px',
                    letterSpacing: '0.5px'
                }
            }
        }
    },
});
