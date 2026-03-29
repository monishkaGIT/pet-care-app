// PetCare Shared Theme Constants — "The Modern Pastoral" Design System

export const COLORS = {
    // ── Core palette (from DESIGN.md) ──
    primary: '#30628a',
    primaryContainer: '#a2d2ff',
    onPrimary: '#ffffff',
    onPrimaryContainer: '#275b82',

    secondary: '#79573f',
    secondaryContainer: '#ffd1b3',
    onSecondaryContainer: '#7a5840',

    tertiary: '#8e4e14',
    tertiaryContainer: '#ffc092',
    onTertiaryContainer: '#84470b',

    error: '#ba1a1a',
    errorContainer: '#ffdad6',
    onError: '#ffffff',

    // ── Surfaces ──
    background: '#fff9ec',
    surface: '#fff9ec',
    surfaceContainerLowest: '#ffffff',
    surfaceContainerLow: '#faf3e0',
    surfaceContainer: '#f4eedb',
    surfaceContainerHigh: '#efe8d5',
    surfaceContainerHighest: '#e9e2d0',
    surfaceDim: '#e0dac7',

    onSurface: '#1e1c10',
    onSurfaceVariant: '#41474e',
    onBackground: '#1e1c10',

    outline: '#72787f',
    outlineVariant: '#c1c7cf',
    inverseSurface: '#333024',
    inverseOnSurface: '#f7f0dd',
    inversePrimary: '#9bcbf8',
    surfaceTint: '#30628a',

    // ── Legacy aliases (keep existing screens working) ──
    lightGray: '#f3f4f6',
    inputBg: '#f9fafb',
    inputBorder: '#e5e7eb',
    danger: '#ba1a1a',
    success: '#10b981',
    admin: '#8b5cf6',
    adminLight: '#dbeafe',
    adminText: '#1d4ed8',
    textPrimary: '#1e1c10',
    textSecondary: '#41474e',
    textMuted: '#72787f',
    textPlaceholder: '#72787f',
    disabledBg: '#e5e7eb',
    disabledText: '#9ca3af',
};

export const SHADOWS = {
    card: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    header: {
        shadowColor: '#6F4E37',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    button: {
        shadowColor: '#A2D2FF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 3,
    },
    // New "editorial" shadow from the design system
    editorial: {
        shadowColor: '#6F4E37',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.08,
        shadowRadius: 32,
        elevation: 4,
    },
};
