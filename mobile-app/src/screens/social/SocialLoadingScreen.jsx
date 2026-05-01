import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';


export default function SocialLoadingScreen({ onDone }) {
    const progress = useRef(new Animated.Value(0)).current;
    const fadeIn = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeIn, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.timing(progress, { toValue: 1, duration: 6000, useNativeDriver: false }),
        ]).start(() => onDone());
    }, []);

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.content, { opacity: fadeIn }]}>
                <LottieView
                    source={{ uri: 'https://assets3.lottiefiles.com/packages/lf20_syqnfe7c.json' }}
                    autoPlay
                    loop
                    style={styles.lottie}
                />
                <Text style={styles.title}>Loading PawFeed...</Text>
                <Text style={styles.caption}>Where every tail wag tells a story</Text>
                <View style={styles.progressTrack}>
                    <Animated.View style={[styles.progressBar, {
                        width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] })
                    }]} />
                </View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff9ec', alignItems: 'center', justifyContent: 'center' },
    content: { alignItems: 'center', gap: 12 },
    lottie: {
        width: 200,
        height: 200,
        marginBottom: -10,
    },
    title: { fontSize: 24, fontWeight: '800', color: '#79573f', marginTop: -4 },
    caption: { fontSize: 14, color: '#b5a99a', textAlign: 'center' },
    progressTrack: { width: 120, height: 3, backgroundColor: 'rgba(162,210,255,0.3)', borderRadius: 4, marginTop: 8, overflow: 'hidden' },
    progressBar: { height: '100%', backgroundColor: '#30628a', borderRadius: 4 },
});
