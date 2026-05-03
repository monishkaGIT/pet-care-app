import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// ─── State configs ───────────────────────────────────────────────────────────

const STATE_CONFIG = {
  success: {
    icon: 'check-circle',
    iconColor: '#22c55e',
    accentBg: 'rgba(34,197,94,0.10)',
    accentBorder: 'rgba(34,197,94,0.25)',
    badge: '#22c55e',
  },
  error: {
    icon: 'error',
    iconColor: '#ef4444',
    accentBg: 'rgba(239,68,68,0.10)',
    accentBorder: 'rgba(239,68,68,0.25)',
    badge: '#ef4444',
  },
  warning: {
    icon: 'warning',
    iconColor: '#f59e0b',
    accentBg: 'rgba(245,158,11,0.10)',
    accentBorder: 'rgba(245,158,11,0.25)',
    badge: '#f59e0b',
  },
  info: {
    icon: 'info',
    iconColor: '#30628a',
    accentBg: 'rgba(48,98,138,0.10)',
    accentBorder: 'rgba(48,98,138,0.20)',
    badge: '#30628a',
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function PetCareModal({
  visible = false,
  type = 'info',
  title = '',
  message = '',
  buttons = [],
  onClose,
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.88)).current;

  const config = STATE_CONFIG[type] || STATE_CONFIG.info;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          damping: 18,
          stiffness: 260,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.88);
    }
  }, [visible]);

  // Default button if none provided
  const resolvedButtons =
    buttons.length > 0
      ? buttons
      : [{ text: 'OK', style: 'primary' }];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Animated.View
          style={[
            styles.card,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          {/* ── Paw brand header ─────────────────────────────────── */}
          <View style={styles.brandRow}>
            <MaterialIcons name="pets" size={16} color="#30628a" />
            <Text style={styles.brandText}>PetCare</Text>
          </View>

          {/* ── State icon circle ─────────────────────────────────── */}
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: config.accentBg,
                borderColor: config.accentBorder,
              },
            ]}
          >
            <MaterialIcons
              name={config.icon}
              size={38}
              color={config.iconColor}
            />
          </View>

          {/* ── Title ─────────────────────────────────────────────── */}
          {!!title && <Text style={styles.title}>{title}</Text>}

          {/* ── Message ───────────────────────────────────────────── */}
          {!!message && <Text style={styles.message}>{message}</Text>}

          {/* ── Buttons ───────────────────────────────────────────── */}
          <View
            style={[
              styles.buttonsContainer,
              resolvedButtons.length === 1 && styles.buttonsContainerSingle,
            ]}
          >
            {resolvedButtons.map((btn, index) => {
              const isDestructive = btn.style === 'destructive';
              const isCancel = btn.style === 'cancel';
              const isPrimary = !isDestructive && !isCancel;

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.button,
                    resolvedButtons.length === 1 && styles.buttonFull,
                    isPrimary && styles.buttonPrimary,
                    isDestructive && styles.buttonDestructive,
                    isCancel && styles.buttonCancel,
                  ]}
                  activeOpacity={0.82}
                  onPress={() => {
                    if (btn.onPress) btn.onPress();
                    if (onClose) onClose();
                  }}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      isPrimary && styles.buttonTextPrimary,
                      isDestructive && styles.buttonTextDestructive,
                      isCancel && styles.buttonTextCancel,
                    ]}
                  >
                    {btn.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(20,20,30,0.48)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: Math.min(width - 48, 360),
    backgroundColor: '#fff9ec',
    borderRadius: 24,
    paddingTop: 28,
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: 'center',
    // Soft shadow
    shadowColor: 'rgba(79, 55, 30, 0.18)',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 28,
    elevation: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },

  // Brand row
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 18,
    alignSelf: 'flex-start',
  },
  brandText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#30628a',
    letterSpacing: 0.4,
  },

  // Icon
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  // Text
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2d2d2d',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 26,
  },
  message: {
    fontSize: 14.5,
    color: '#4a4a4a',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 24,
    fontWeight: '500',
  },

  // Button container
  buttonsContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
  },
  buttonsContainerSingle: {
    flexDirection: 'column',
  },

  // Buttons
  button: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonFull: {
    flex: undefined,
    width: '100%',
  },
  buttonPrimary: {
    backgroundColor: '#30628a',
  },
  buttonDestructive: {
    backgroundColor: '#ef4444',
  },
  buttonCancel: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#d0c8b8',
  },

  // Button text
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  buttonTextPrimary: {
    color: '#ffffff',
  },
  buttonTextDestructive: {
    color: '#ffffff',
  },
  buttonTextCancel: {
    color: '#79573f',
  },
});
