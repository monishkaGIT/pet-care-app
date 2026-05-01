import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, Modal, TouchableOpacity,
    FlatList, TextInput, KeyboardAvoidingView, Platform,
    Image, Alert, Keyboard,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { postApi } from '../api/axiosConfig';

const EMOJI_REACTIONS = ['❤️', '🐶', '✨', '🐾'];

function timeAgo(dateStr) {
    if (!dateStr) return '';
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

export default function CommentsModal({ visible, onClose, post, currentUserId, onCommentAdded, onCommentDeleted }) {
    const [comments, setComments] = useState([]);
    const [inputText, setInputText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        if (visible && post) {
            setComments(post.comments || []);
        }
        if (!visible) setInputText('');
    }, [visible, post]);

    const handleSend = async () => {
        if (!inputText.trim() || submitting || !post) return;
        setSubmitting(true);
        try {
            const { data } = await postApi.post(`/${post._id}/comments`, { text: inputText.trim() });
            setComments(data);
            setInputText('');
            Keyboard.dismiss();
            if (onCommentAdded) onCommentAdded(post._id, data);
        } catch {
            Alert.alert('Error', 'Could not post comment.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = (commentId) => {
        Alert.alert(
            'Delete Comment',
            'Are you sure you want to delete this comment?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await postApi.delete(`/${post._id}/comments/${commentId}`);
                            const updated = comments.filter(c => c._id !== commentId);
                            setComments(updated);
                            if (onCommentDeleted) onCommentDeleted(post._id, updated);
                        } catch {
                            Alert.alert('Error', 'Could not delete comment.');
                        }
                    },
                },
            ]
        );
    };

    const appendEmoji = (emoji) => {
        setInputText(prev => prev + emoji);
        inputRef.current?.focus();
    };

    // ── Original post preview card ─────────────────────────────────────────
    const renderPostPreview = () => {
        if (!post) return null;
        return (
            <View style={styles.postPreviewCard}>
                <View style={styles.previewAvatarWrap}>
                    {post.author?.profileImage ? (
                        <Image source={{ uri: post.author.profileImage }} style={styles.previewAvatar} />
                    ) : (
                        <View style={styles.previewAvatarFallback}>
                            <Text style={styles.previewAvatarInitial}>
                                {(post.author?.name || 'P')[0].toUpperCase()}
                            </Text>
                        </View>
                    )}
                </View>
                <View style={styles.previewBody}>
                    <Text style={styles.previewAuthor}>{post.author?.name || 'Pet Parent'}</Text>
                    {!!post.caption && (
                        <Text style={styles.previewCaption} numberOfLines={3}>{post.caption}</Text>
                    )}
                </View>
            </View>
        );
    };

    // ── Comment row ────────────────────────────────────────────────────────
    const renderComment = ({ item }) => {
        const isMyComment = item.author?._id === currentUserId || item.author === currentUserId;
        const isMyPost = post?.author?._id === currentUserId;
        const canDelete = isMyComment || isMyPost;

        return (
            <TouchableOpacity
                style={styles.commentCard}
                onLongPress={() => canDelete && handleDelete(item._id)}
                activeOpacity={0.85}
            >
                <View style={styles.commentAvatar}>
                    {item.author?.profileImage ? (
                        <Image source={{ uri: item.author.profileImage }} style={styles.commentAvatarImg} />
                    ) : (
                        <Text style={styles.commentAvatarInitial}>
                            {(item.author?.name || 'U')[0].toUpperCase()}
                        </Text>
                    )}
                </View>
                <View style={styles.commentBody}>
                    <View style={styles.commentMeta}>
                        <Text style={styles.commentAuthor}>{item.author?.name || 'User'}</Text>
                        <Text style={styles.commentTime}>{timeAgo(item.createdAt)}</Text>
                    </View>
                    <Text style={styles.commentText}>{item.text}</Text>
                </View>
                {canDelete && (
                    <TouchableOpacity onPress={() => handleDelete(item._id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <MaterialIcons name="delete-outline" size={17} color="#d4b8a8" />
                    </TouchableOpacity>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                style={styles.overlay}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                {/* Backdrop */}
                <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

                <View style={styles.sheet}>
                    {/* Drag handle */}
                    <View style={styles.handle} />

                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                            <MaterialIcons name="close" size={22} color="#b5a99a" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Comments</Text>
                        <View style={{ width: 22 }} />
                    </View>

                    {/* Post preview */}
                    {renderPostPreview()}

                    {/* Comments list */}
                    <FlatList
                        data={comments}
                        keyExtractor={item => item._id}
                        renderItem={renderComment}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyEmoji}>🐾</Text>
                                <Text style={styles.emptyText}>No comments yet. Be the first!</Text>
                            </View>
                        }
                    />

                    {/* Input area */}
                    <View style={styles.inputWrapper}>
                        {/* Emoji quick reactions */}
                        <View style={styles.emojiRow}>
                            {EMOJI_REACTIONS.map(emoji => (
                                <TouchableOpacity
                                    key={emoji}
                                    style={styles.emojiBtn}
                                    onPress={() => appendEmoji(emoji)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.emojiText}>{emoji}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Text input row */}
                        <View style={styles.inputRow}>
                            <TextInput
                                ref={inputRef}
                                style={styles.input}
                                placeholder="Add Comment"
                                placeholderTextColor="#c8bdb5"
                                value={inputText}
                                onChangeText={setInputText}
                                multiline
                                maxLength={500}
                                returnKeyType="default"
                            />
                            <TouchableOpacity
                                style={[styles.postBtn, (!inputText.trim() || submitting) && styles.postBtnDisabled]}
                                onPress={handleSend}
                                disabled={!inputText.trim() || submitting}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.postBtnText}>Post</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(60,40,20,0.35)',
    },

    // ── Bottom sheet ──
    sheet: {
        backgroundColor: '#faf3e0',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        height: '78%',
        paddingBottom: Platform.OS === 'ios' ? 24 : 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
        elevation: 20,
    },
    handle: {
        width: 40, height: 4, borderRadius: 2,
        backgroundColor: '#d9cfc5',
        alignSelf: 'center',
        marginTop: 10, marginBottom: 2,
    },

    // ── Header ──
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 14,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '800',
        color: '#30628a',
        letterSpacing: 0.2,
    },

    // ── Post preview ──
    postPreviewCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#ffffff',
        borderRadius: 18,
        marginHorizontal: 16,
        marginBottom: 10,
        padding: 14,
        shadowColor: '#6f4e37',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    previewAvatarWrap: { marginRight: 12 },
    previewAvatar: { width: 52, height: 52, borderRadius: 26 },
    previewAvatarFallback: {
        width: 52, height: 52, borderRadius: 26,
        backgroundColor: '#e8f4fd',
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 2, borderColor: '#a2d2ff',
    },
    previewAvatarInitial: { fontSize: 20, fontWeight: '800', color: '#30628a' },
    previewBody: { flex: 1 },
    previewAuthor: { fontSize: 15, fontWeight: '800', color: '#5c3d2e', marginBottom: 4 },
    previewCaption: { fontSize: 13, color: '#7a6555', lineHeight: 19 },

    // ── Comments ──
    listContent: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 12 },

    commentCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 12,
        marginBottom: 10,
        shadowColor: '#6f4e37',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 1,
    },
    commentAvatar: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: '#e8f4fd',
        alignItems: 'center', justifyContent: 'center',
        marginRight: 10, overflow: 'hidden',
        borderWidth: 1.5, borderColor: '#a2d2ff',
    },
    commentAvatarImg: { width: '100%', height: '100%' },
    commentAvatarInitial: { fontSize: 15, fontWeight: '800', color: '#30628a' },
    commentBody: { flex: 1 },
    commentMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 },
    commentAuthor: { fontSize: 13, fontWeight: '800', color: '#79573f' },
    commentTime: { fontSize: 11, color: '#b5a99a', fontWeight: '600', letterSpacing: 0.3 },
    commentText: { fontSize: 13, color: '#3d2b1f', lineHeight: 19 },

    // ── Empty ──
    emptyState: { alignItems: 'center', paddingTop: 40, paddingBottom: 20 },
    emptyEmoji: { fontSize: 36, marginBottom: 10 },
    emptyText: { fontSize: 14, color: '#b5a99a', fontWeight: '600' },

    // ── Input area ──
    inputWrapper: {
        borderTopWidth: 1,
        borderTopColor: '#efe8d5',
        paddingTop: 10,
        paddingHorizontal: 16,
        paddingBottom: 4,
        backgroundColor: '#faf3e0',
    },
    emojiRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 10,
    },
    emojiBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: '#ffffff',
        alignItems: 'center', justifyContent: 'center',
        shadowColor: '#6f4e37',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    emojiText: { fontSize: 20 },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 10,
    },
    input: {
        flex: 1,
        minHeight: 44,
        maxHeight: 100,
        backgroundColor: '#f0e8d8',
        borderRadius: 22,
        paddingHorizontal: 18,
        paddingTop: 12,
        paddingBottom: 12,
        fontSize: 14,
        color: '#3d2b1f',
    },
    postBtn: {
        backgroundColor: '#f59e0b',
        borderRadius: 22,
        paddingHorizontal: 22,
        paddingVertical: 12,
        shadowColor: '#f59e0b',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
        elevation: 5,
    },
    postBtnDisabled: {
        backgroundColor: '#e0d5c8',
        shadowOpacity: 0,
        elevation: 0,
    },
    postBtnText: {
        color: '#ffffff',
        fontWeight: '800',
        fontSize: 14,
    },
});
