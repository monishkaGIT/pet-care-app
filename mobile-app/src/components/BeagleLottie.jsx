import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import LottieView from 'lottie-react-native';
import { COLORS } from '../constants/theme';

const BeagleLottie = ({ type = 'empty', style }) => {
    // We are binding dynamic remote Lottie JSON assets that match the user requirements
    // (A sleeping dog for empty, a running/happy dog for loading)
    let source;
    let message = '';

    switch (type) {
        case 'loading':
            // Represents "chasing its tail / loading"
            source = { uri: 'https://assets3.lottiefiles.com/packages/lf20_syqnfe7c.json' }; 
            break;
        case 'success':
            // Represents "tail wagging / success"
            source = { uri: 'https://assets10.lottiefiles.com/packages/lf20_j1adxtyc.json' };
            break;
        case 'empty':
        default:
            // Represents "sleeping beagle" empty state
            source = { uri: 'https://assets9.lottiefiles.com/packages/lf20_U6OKyK.json' };
            message = '';
            break;
    }

    return (
        <View style={[styles.container, style]}>
            <LottieView
                source={source}
                autoPlay
                loop={type !== 'success'} // Optional: Only loop if not in success state
                style={styles.lottie}
            />
            {type === 'empty' && <Text style={styles.emptyText}>{message}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1
    },
    lottie: {
        width: 250,
        height: 250,
    },
    emptyText: {
        marginTop: -30,
        color: COLORS.secondary,
        fontSize: 16,
        fontWeight: 'bold',
        fontStyle: 'italic'
    }
});

export default BeagleLottie;
