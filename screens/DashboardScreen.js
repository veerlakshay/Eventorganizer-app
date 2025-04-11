// screens/DashboardScreen.js
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAuth, signOut } from 'firebase/auth';

const DashboardScreen = () => {
    const navigation = useNavigation();
    const auth = getAuth();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            // After successful logout, navigate back to the SignIn screen
            navigation.replace('SignIn'); // Use replace to avoid going back to Dashboard
        } catch (error) {
            console.error('Logout error:', error);
            // Optionally display an error message to the user
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome to the Dashboard!</Text>
            <Button title="Logout" onPress={handleLogout} />
            {/* We will add the list of events here later */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 20,
        marginBottom: 20,
    },
});

export default DashboardScreen;