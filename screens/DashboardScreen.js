// screens/DashboardScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAuth, signOut } from 'firebase/auth';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

const DashboardScreen = () => {
    const navigation = useNavigation();
    const auth = getAuth();
    const [events, setEvents] = useState([]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigation.replace('SignIn');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    useEffect(() => {
        const eventsCollectionRef = collection(db, 'events');
        const q = query(eventsCollectionRef, where('userId', '==', auth.currentUser?.uid));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const eventsArray = [];
            querySnapshot.forEach((doc) => {
                eventsArray.push({ id: doc.id, ...doc.data() });
            });
            setEvents(eventsArray);
        });

        return () => unsubscribe();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome to the Dashboard!</Text>
            <Button
                title="Create New Event"
                onPress={() => navigation.navigate('CreateEvent')}
            />
            <Button title="Logout" onPress={handleLogout} />

            <Text style={styles.subtitle}>Your Events:</Text>
            <FlatList
                data={events}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.eventItem}>
                        <Text style={styles.eventName}>{item.eventName}</Text>
                        <Text>{item.description}</Text>
                        <Text>Location: {item.location}</Text>
                        <Text>Date: {item.date}</Text>
                        <Text>Time: {item.time}</Text>
                        <Button
                            title="Edit"
                            onPress={() => navigation.navigate('EditEvent', { event: item })}
                        />
                        {/* We'll add the delete button here in the next step */}
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 20,
        marginBottom: 20,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        marginTop: 20,
        marginBottom: 10,
    },
    eventItem: {
        padding: 15,
        marginBottom: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
    },
    eventName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
});

export default DashboardScreen;