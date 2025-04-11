// screens/DashboardScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, FlatList, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAuth, signOut } from 'firebase/auth';
import { collection, query, where, onSnapshot, deleteDoc, doc, addDoc, getDocs } from 'firebase/firestore'; // Import getDocs
import { db } from '../config/firebaseConfig';

const DashboardScreen = () => {
    const navigation = useNavigation();
    const auth = getAuth();
    const [events, setEvents] = useState([]);
    const [favoriteEventIds, setFavoriteEventIds] = useState([]); // Track favorite event IDs

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigation.replace('SignIn');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const handleDeleteEvent = async (eventId) => {
        try {
            await deleteDoc(doc(db, 'events', eventId));
            console.log('Event deleted successfully!');
        } catch (error) {
            console.error('Error deleting event:', error);
        }
    };

    const handleToggleFavorite = async (eventId) => {
        const auth = getAuth();
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        try {
            // Check if the event is already a favorite
            const favoriteEventsRef = collection(db, 'favoriteEvents');
            const q = query(favoriteEventsRef, where('userId', '==', userId), where('eventId', '==', eventId));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                // Remove from favorites
                const favoriteEventDocId = querySnapshot.docs[0].id;
                await deleteDoc(doc(db, 'favoriteEvents', favoriteEventDocId));
                console.log(`Event ${eventId} removed from favorites.`);
                // Update state
                setFavoriteEventIds(prevIds => prevIds.filter(id => id !== eventId));


            } else {
                // Add to favorites
                await addDoc(collection(db, 'favoriteEvents'), {
                    userId: userId,
                    eventId: eventId,
                });
                console.log(`Event ${eventId} added to favorites.`);
                // Update state
                setFavoriteEventIds(prevIds => [...prevIds, eventId]);

            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
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

    // Fetch initial favorite event IDs
    useEffect(() => {
        const fetchInitialFavoriteIds = async () => {
            const auth = getAuth();
            const userId = auth.currentUser?.uid;
            if (!userId) return;

            try {
                const favoriteEventsRef = collection(db, 'favoriteEvents');
                const q = query(favoriteEventsRef, where('userId', '==', userId));
                const querySnapshot = await getDocs(q);
                const initialFavoriteIds = querySnapshot.docs.map(doc => doc.data().eventId);
                setFavoriteEventIds(initialFavoriteIds);
            } catch (error) {
                console.error('Error fetching initial favorite IDs:', error);
            }
        };

        fetchInitialFavoriteIds();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome to the Dashboard!</Text>
            <Button
                title="Create New Event"
                onPress={() => navigation.navigate('CreateEvent')}
            />
            <Button title="Logout" onPress={handleLogout} />
            <Button
                title="Favorite Events"
                onPress={() => navigation.navigate('FavoriteEvents')}
            />

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
                        <Button
                            title="Delete"
                            onPress={() =>
                                Alert.alert(
                                    'Confirm Delete',
                                    'Are you sure you want to delete this event?',
                                    [
                                        { text: 'Cancel', style: 'cancel' },
                                        { text: 'Delete', style: 'destructive', onPress: () => handleDeleteEvent(item.id) },
                                    ],
                                    { cancelable: true }
                                )
                            }
                        />
                        <Button
                            title={favoriteEventIds.includes(item.id) ? 'Unfavorite' : 'Favorite'}
                            onPress={() => handleToggleFavorite(item.id)}
                        />
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