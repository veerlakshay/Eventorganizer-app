// screens/FavoriteEventsScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Button, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

const FavoriteEventsScreen = () => {
    const navigation = useNavigation();
    const [favoriteEvents, setFavoriteEvents] = useState([]);

    useEffect(() => {
        const fetchFavoriteEvents = async () => {
            const auth = getAuth();
            const userId = auth.currentUser?.uid;
            if (!userId) return;

            try {
                const favoriteEventsRef = collection(db, 'favoriteEvents');
                const q = query(favoriteEventsRef, where('userId', '==', userId));
                const querySnapshot = await getDocs(q);
                const favoriteEventIds = querySnapshot.docs.map(doc => doc.data().eventId);

                // Fetch the actual event details from the 'events' collection
                const eventsRef = collection(db, 'events');
                const eventsQuery = query(eventsRef, where('__name__', 'in', favoriteEventIds)); // Use __name__ to query by document ID
                const eventsSnapshot = await getDocs(eventsQuery);

                const eventsData = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setFavoriteEvents(eventsData);

            } catch (error) {
                console.error('Error fetching favorite events:', error);
            }
        };

        fetchFavoriteEvents();
    }, []);

    const handleRemoveFavorite = async (eventId) => {
        const auth = getAuth();
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        try {
            // Find the favoriteEvent document to delete
            const favoriteEventsRef = collection(db, 'favoriteEvents');
            const q = query(favoriteEventsRef, where('userId', '==', userId), where('eventId', '==', eventId));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const favoriteEventDocId = querySnapshot.docs[0].id; // Get the ID of the favoriteEvent doc
                await deleteDoc(doc(db, 'favoriteEvents', favoriteEventDocId));
                // Update state to remove the event
                setFavoriteEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
                console.log(`Event ${eventId} removed from favorites.`);
            } else {
                console.log(`Favorite event entry not found for event ${eventId}.`);
            }

        } catch (error) {
            console.error('Error removing favorite:', error);
            // Optionally display an error message
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Your Favorite Events</Text>
            {favoriteEvents.length === 0 ? (
                <Text>No favorite events yet.</Text>
            ) : (
                <FlatList
                    data={favoriteEvents}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.eventItem}>
                            <Text style={styles.eventName}>{item.eventName}</Text>
                            <Text>{item.description}</Text>
                            <Text>Location: {item.location}</Text>
                            <Text>Date: {item.date}</Text>
                            <Text>Time: {item.time}</Text>
                            <Button
                                title="Remove Favorite"
                                onPress={() => handleRemoveFavorite(item.id)}
                            />
                        </View>
                    )}
                />
            )}
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

export default FavoriteEventsScreen;