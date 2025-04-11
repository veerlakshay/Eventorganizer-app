import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    Alert,
    SafeAreaView,
    RefreshControl
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import { collection, query, where, getDocs, deleteDoc, doc, documentId } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';

const FavoriteEventsScreen = () => {
    const navigation = useNavigation();
    const [favoriteEvents, setFavoriteEvents] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    // Set navigation options
    useEffect(() => {
        navigation.setOptions({
            title: 'Favorite Events',
            headerLeft: () => (
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={{ marginLeft: 15 }}
                >
                    <Ionicons name="arrow-back" size={24} color="#6C63FF" />
                </TouchableOpacity>
            ),
        });
    }, [navigation]);

    const fetchFavoriteEvents = async () => {
        const auth = getAuth();
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        try {
            setRefreshing(true);

            // 1. Get all favorite event IDs for current user
            const favoriteEventsRef = collection(db, 'favoriteEvents');
            const favoritesQuery = query(favoriteEventsRef, where('userId', '==', userId));
            const favoritesSnapshot = await getDocs(favoritesQuery);
            const favoriteEventIds = favoritesSnapshot.docs.map(doc => doc.data().eventId);

            if (favoriteEventIds.length === 0) {
                setFavoriteEvents([]);
                return;
            }

            // 2. Get the actual event documents for these IDs
            const eventsQuery = query(
                collection(db, 'events'),
                where(documentId(), 'in', favoriteEventIds)
            );
            const eventsSnapshot = await getDocs(eventsQuery);

            // 3. Map to event objects
            const eventsData = eventsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setFavoriteEvents(eventsData);
        } catch (error) {
            console.error('Error fetching favorite events:', error);
            Alert.alert('Error', 'Could not load favorite events');
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchFavoriteEvents();
    }, []);

    const handleRemoveFavorite = async (eventId) => {
        const auth = getAuth();
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        Alert.alert(
            'Remove Favorite',
            'Are you sure you want to remove this event from favorites?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // Find the favorite reference to delete
                            const favoritesRef = collection(db, 'favoriteEvents');
                            const q = query(
                                favoritesRef,
                                where('userId', '==', userId),
                                where('eventId', '==', eventId)
                            );
                            const querySnapshot = await getDocs(q);

                            if (!querySnapshot.empty) {
                                const favoriteDocId = querySnapshot.docs[0].id;
                                await deleteDoc(doc(db, 'favoriteEvents', favoriteDocId));
                                setFavoriteEvents(prev => prev.filter(e => e.id !== eventId));
                            }
                        } catch (error) {
                            console.error('Error removing favorite:', error);
                            Alert.alert('Error', 'Could not remove favorite');
                        }
                    }
                },
            ]
        );
    };

    const renderRightActions = (progress, dragX, item) => {
        return (
            <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleRemoveFavorite(item.id)}
            >
                <Ionicons name="heart-dislike" size={24} color="white" />
            </TouchableOpacity>
        );
    };

    const renderEventItem = ({ item }) => (
        <Swipeable renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item)}>
            <TouchableOpacity
                style={styles.eventCard}
                onPress={() => navigation.navigate('EventDetail', { event: item })}
            >
                <View style={styles.eventHeader}>
                    <Text style={styles.eventName}>{item.eventName}</Text>
                    <Ionicons name="heart" size={24} color="#FF3A44" />
                </View>

                <Text style={styles.eventDescription} numberOfLines={2}>
                    {item.description}
                </Text>

                <View style={styles.eventDetails}>
                    <View style={styles.detailItem}>
                        <Ionicons name="location-outline" size={16} color="#6C63FF" />
                        <Text style={styles.detailText}>{item.location}</Text>
                    </View>

                    <View style={styles.detailItem}>
                        <Ionicons name="calendar-outline" size={16} color="#6C63FF" />
                        <Text style={styles.detailText}>{item.date}</Text>
                    </View>

                    <View style={styles.detailItem}>
                        <Ionicons name="time-outline" size={16} color="#6C63FF" />
                        <Text style={styles.detailText}>{item.time}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        </Swipeable>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <FlatList
                    data={favoriteEvents}
                    renderItem={renderEventItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={fetchFavoriteEvents}
                            tintColor="#6C63FF"
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="heart-outline" size={60} color="#CBD5E0" />
                            <Text style={styles.emptyText}>No favorite events yet</Text>
                            <Text style={styles.emptySubtext}>
                                Tap the heart icon on events to add them here
                            </Text>
                        </View>
                    }
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    eventCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    eventHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    eventName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2D3748',
        flex: 1,
    },
    eventDescription: {
        fontSize: 14,
        color: '#718096',
        marginBottom: 15,
    },
    eventDetails: {
        gap: 10,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    detailText: {
        fontSize: 14,
        color: '#4A5568',
    },
    deleteButton: {
        backgroundColor: '#E53E3E',
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        height: '80%',
        borderRadius: 12,
        marginTop: 10,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        marginTop: 50,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#2D3748',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtext: {
        fontSize: 16,
        color: '#718096',
        textAlign: 'center',
    },
});

export default FavoriteEventsScreen;