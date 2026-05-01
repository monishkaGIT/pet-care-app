import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, Modal, TouchableOpacity,
    FlatList, TextInput, KeyboardAvoidingView, Platform,
    Image, Alert, Keyboard
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { postApi } from '../api/axiosConfig';

export default function CommentsModal({ visible, onClose, post, currentUserId, onCommentAdded, onCommentDeleted }) {
    const [comments, setComments] = useState([]);
    const [inputText, setInputText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (visible && post) {
            setComments(post.comments || []);
        }
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
        } catch (error) {
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
                            const updatedComments = comments.filter(c => c._id !== commentId);
                            setComments(updatedComments);
                            if (onCommentDeleted) onCommentDeleted(post._id, updatedComments);
                        } catch (error) {
                            Alert.alert('Error', 'Could not delete comment.');
                        }
                    }
                }
            ]
        );
    };

    const renderComment = ({ item }) => {
        const isMyComment = item.author?._id === currentUserId || item.author === currentUserId;
        const isMyPost = post?.author?._id === currentUserId;
        const canDelete = isMyComment || isMyPost;

        return (
            <View style={styles.commentRow}>
                <View style={styles.avatar}>
                    {item.author?.profileImage ? (
                        <Image source={{ uri: item.author.profileImage }} style={styles.avatarImg} />
                    ) : (
                        <MaterialIcons name="person" size={20} color="#30628a" />
                    )}
                </View>
                <View style={styles.commentContent}>
                    <Text style={styles.commentText}>
                        <Text style={styles.commentAuthor}>{item.author?.name?.replace(/\s+/g, '_').toLowerCase() || 'user'} </Text>
                        {item.text}
                    </Text>
                    {/* Time ago could be added here if needed */}
                </View>
                {canDelete && (
                    <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.deleteBtn}>
                        <MaterialIcons name="delete-outline" size={18} color="#dc2626" />
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                style={styles.modalOverlay}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />
                <View style={styles.modalContent}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={{ width: 24 }} />
                        <Text style={styles.headerTitle}>Comments</Text>
                        <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                            <MaterialIcons name="close" size={24} color="#79573f" />
                        </TouchableOpacity>
                    </View>

                    {/* Comments List */}
                    <FlatList
                        data={comments}
                        keyExtractor={item => item._id}
                        renderItem={renderComment}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyText}>No comments yet. Be the first!</Text>
                            </View>
                        }
                    />

                    {/* Input Area */}
                    <View style={styles.inputArea}>
                        <View style={styles.myAvatar}>
                            <MaterialIcons name="person" size={20} color="#30628a" />
                        </View>
                        <TextInput
                            style={styles.input}
                            placeholder="Add a comment..."
                            placeholderTextColor="#a0a5ab"
                            value={inputText}
                            onChangeText={setInputText}
                            multiline
                            maxLength={500}
                        />
                        <TouchableOpacity
                            style={[styles.sendBtn, (!inputText.trim() || submitting) && styles.sendBtnDisabled]}
                            onPress={handleSend}
                            disabled={!inputText.trim() || submitting}
                        >
                            <Text style={[styles.sendText, (!inputText.trim() || submitting) && styles.sendTextDisabled]}>
                                Post
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    modalContent: {
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: '75%', // covers 75% of screen
        paddingBottom: Platform.OS === 'ios' ? 20 : 0,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 20,
    },
    commentRow: {
        flexDirection: 'row',
        marginBottom: 16,
        alignItems: 'flex-start',
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(162,210,255,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
        overflow: 'hidden',
    },
    avatarImg: { width: '100%', height: '100%' },
    commentContent: {
        flex: 1,
        marginRight: 10,
    },
    commentText: {
        fontSize: 14,
        color: '#1f2937',
        lineHeight: 20,
    },
    commentAuthor: {
        fontWeight: 'bold',
        color: '#111827',
    },
    deleteBtn: {
        padding: 4,
    },
    emptyState: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: '#6b7280',
        fontSize: 14,
    },
    inputArea: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        backgroundColor: '#ffffff',
    },
    myAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(162,210,255,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        marginBottom: 4, // align with single-line input
    },
    input: {
        flex: 1,
        minHeight: 40,
        maxHeight: 100,
        backgroundColor: '#f9fafb',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 10,
        fontSize: 14,
        color: '#111827',
    },
    sendBtn: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginLeft: 8,
    },
    sendBtnDisabled: {
        opacity: 0.5,
    },
    sendText: {
        color: '#3b82f6',
        fontWeight: 'bold',
        fontSize: 14,
    },
    sendTextDisabled: {
        color: '#9ca3af',
    },
});
