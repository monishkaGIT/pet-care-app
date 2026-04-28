import React, { useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../../constants/theme';
import { askPawly } from '../../api/petApi';
import { ActivityIndicator } from 'react-native';

export default function AskPawlyScreen() {
    const [messages, setMessages] = useState([
        {
            id: '1',
            from: 'bot',
            text: 'Hi! I am Pawly. Ask me about pet care, food, vaccines, and training tips.',
        },
    ]);
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);

    const canSend = useMemo(() => prompt.trim().length > 0 && !loading, [prompt, loading]);

    const handleSend = async () => {
        const clean = prompt.trim();
        if (!clean || loading) return;

        const userMessage = {
            id: `${Date.now()}`,
            from: 'user',
            text: clean,
        };

        setMessages((prev) => [...prev, userMessage]);
        setPrompt('');
        setLoading(true);

        try {
            const data = await askPawly(clean);
            if (data && data.reply) {
                setMessages((prev) => [
                    ...prev,
                    {
                        id: `${Date.now()}-bot`,
                        from: 'bot',
                        text: data.reply,
                    },
                ]);
            }
        } catch (err) {
            console.error('Failed to ask pawly:', err);
            const fallback = 'Oops, I am having trouble connecting right now. Please try again later!';
            const errorText = err?.response?.data?.message || fallback;
            setMessages((prev) => [
                ...prev,
                {
                    id: `${Date.now()}-bot`,
                    from: 'bot',
                    text: errorText,
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const renderMessage = ({ item }) => {
        const isUser = item.from === 'user';
        return (
            <View style={[styles.messageRow, isUser ? styles.userRow : styles.botRow]}>
                {!isUser && (
                    <View style={styles.avatar}>
                        <MaterialCommunityIcons name="dog" size={18} color="#d9a800" />
                    </View>
                )}
                <View style={[styles.bubble, isUser ? styles.userBubble : styles.botBubble]}>
                    <Text style={[styles.bubbleText, isUser ? styles.userText : styles.botText]}>{item.text}</Text>
                </View>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={styles.header}>
                <View style={styles.headerIconWrap}>
                    <MaterialCommunityIcons name="dog" size={26} color="#d9a800" />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.headerTitle}>Ask Pawly</Text>
                    <Text style={styles.headerSub}>Your pet care assistant</Text>
                </View>
            </View>

            <FlatList
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={renderMessage}
                contentContainerStyle={styles.chatContent}
                showsVerticalScrollIndicator={false}
            />

            <View style={styles.inputBar}>
                <TextInput
                    placeholder="Ask Pawly anything about your pet..."
                    placeholderTextColor={COLORS.textPlaceholder}
                    style={styles.input}
                    value={prompt}
                    onChangeText={setPrompt}
                    multiline
                />
                <TouchableOpacity
                    style={[styles.sendBtn, !canSend && styles.sendBtnDisabled]}
                    onPress={handleSend}
                    disabled={!canSend}
                    activeOpacity={0.85}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Ionicons name="send" size={18} color="#fff" />
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.lightGray,
    },
    header: {
        backgroundColor: COLORS.primary,
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 40) + 10 : 52,
        paddingBottom: 18,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 26,
        borderBottomRightRadius: 26,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        ...SHADOWS.header,
    },
    headerIconWrap: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: '#f9f6e8',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.secondary,
    },
    headerSub: {
        marginTop: 2,
        fontSize: 13,
        color: COLORS.secondary,
        opacity: 0.9,
    },
    chatContent: {
        paddingHorizontal: 16,
        paddingVertical: 18,
        gap: 10,
    },
    messageRow: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    botRow: {
        justifyContent: 'flex-start',
    },
    userRow: {
        justifyContent: 'flex-end',
    },
    avatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#f5f0d9',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
        marginBottom: 2,
    },
    bubble: {
        maxWidth: '80%',
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    botBubble: {
        backgroundColor: '#fff8df',
        borderTopLeftRadius: 6,
        ...SHADOWS.card,
    },
    userBubble: {
        backgroundColor: COLORS.secondary,
        borderTopRightRadius: 6,
    },
    bubbleText: {
        fontSize: 14,
        lineHeight: 20,
    },
    botText: {
        color: COLORS.textPrimary,
    },
    userText: {
        color: '#fff',
    },
    inputBar: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 12,
        paddingTop: 8,
        paddingBottom: Platform.OS === 'android' ? 24 : 12,
        backgroundColor: COLORS.background,
        borderTopWidth: 1,
        borderTopColor: '#e8e2d8',
        gap: 8,
    },
    input: {
        flex: 1,
        minHeight: 46,
        maxHeight: 110,
        backgroundColor: '#fff',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: COLORS.inputBorder,
        paddingHorizontal: 12,
        paddingVertical: 10,
        color: COLORS.textPrimary,
    },
    sendBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.secondary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendBtnDisabled: {
        backgroundColor: COLORS.disabledText,
    },
});