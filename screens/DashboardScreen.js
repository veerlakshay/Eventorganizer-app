import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    Alert,
    SafeAreaView,
    RefreshControl,
    Animated
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAuth, signOut } from 'firebase/auth';
import { collection, query, where, onSnapshot, deleteDoc, doc, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';

const DashboardScreen = () => {
    const navigation = useNavigation();
    const auth = getAuth();
    const [events, setEvents] = useState([]);
    const [favoriteEventIds, setFavoriteEventIds] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const fadeAnim = useState(new Animated.Value(0))[0];

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();

        fetchEvents();
        fetchInitialFavoriteIds();
    }, []);

    const fetchEvents = () => {
        const eventsCollectionRef = collection(db, 'events');
        const q = query(eventsCollectionRef, where('userId', '==', auth.currentUser?.uid));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const eventsArray = [];
            querySnapshot.forEach((doc) => {
                eventsArray.push({ id: doc.id, ...doc.data() });
            });
            setEvents(eventsArray);
            setRefreshing(false);
        });

        return unsubscribe;
    };

    const fetchInitialFavoriteIds = async () => {
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

    const handleLogout = async () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await signOut(auth);
                            navigation.replace('SignIn');
                        } catch (error) {
                            console.error('Logout error:', error);
                        }
                    }
                },
            ]
        );
    };

    const handleDeleteEvent = async (eventId) => {
        Alert.alert(
            'Delete Event',
            'Are you sure you want to delete this event?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteDoc(doc(db, 'events', eventId));
                        } catch (error) {
                            console.error('Error deleting event:', error);
                        }
                    }
                },
            ]
        );
    };

    const handleToggleFavorite = async (eventId) => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        try {
            const favoriteEventsRef = collection(db, 'favoriteEvents');
            const q = query(favoriteEventsRef, where('userId', '==', userId), where('eventId', '==', eventId));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const favoriteEventDocId = querySnapshot.docs[0].id;
                await deleteDoc(doc(db, 'favoriteEvents', favoriteEventDocId));
                setFavoriteEventIds(prevIds => prevIds.filter(id => id !== eventId));
            } else {
                await addDoc(favoriteEventsRef, { userId, eventId });
                setFavoriteEventIds(prevIds => [...prevIds, eventId]);
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchEvents();
        fetchInitialFavoriteIds();
    };

    const renderRightActions = (progress, dragX, item) => {
        const scale = dragX.interpolate({
            inputRange: [-100, 0],
            outputRange: [1, 0],
            extrapolate: 'clamp',
        });

        return (
            <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteEvent(item.id)}
            >
                <Animated.View style={{ transform: [{ scale }] }}>
                    <MaterialIcons name="delete" size={24} color="white" />
                </Animated.View>
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
                    <TouchableOpacity
                        onPress={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(item.id);
                        }}
                    >
                        <Ionicons
                            name={favoriteEventIds.includes(item.id) ? "heart" : "heart-outline"}
                            size={24}
                            color={favoriteEventIds.includes(item.id) ? "#FF3A44" : "#6C63FF"}
                        />
                    </TouchableOpacity>
                </View>

                <Text style={styles.eventDescription} numberOfLines={2}>{item.description}</Text>

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

                <TouchableOpacity
                    style={styles.editButton}
                    onPress={(e) => {
                        e.stopPropagation();
                        navigation.navigate('EditEvent', { event: item });
                    }}
                >
                    <Text style={styles.editButtonText}>Edit Event</Text>
                </TouchableOpacity>
            </TouchableOpacity>
        </Swipeable>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Your Events</Text>
                    <View style={styles.headerActions}>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => navigation.navigate('CreateEvent')}
                        >
                            <Ionicons name="add" size={24} color="#6C63FF" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => navigation.navigate('FavoriteEvents')}
                        >
                            <Ionicons name="heart" size={24} color="#6C63FF" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={handleLogout}
                        >
                            <Ionicons name="log-out-outline" size={24} color="#6C63FF" />
                        </TouchableOpacity>
                    </View>
                </View>

                <FlatList
                    data={events}
                    renderItem={renderEventItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor="#6C63FF"
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <View style={styles.emptyIcon}>
                                <Ionicons name="calendar-outline" size={60} color="#CBD5E0" />
                            </View>
                            <Text style={styles.emptyText}>No events yet</Text>
                            <Text style={styles.emptySubtext}>Get started by creating your first event</Text>
                            <TouchableOpacity
                                style={styles.createEventButton}
                                onPress={() => navigation.navigate('CreateEvent')}
                            >
                                <Text style={styles.createEventButtonText}>Create Event</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            </Animated.View>
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        paddingBottom: 10,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2D3748',
    },
    headerActions: {
        flexDirection: 'row',
        gap: 15,
    },
    actionButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
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
        marginBottom: 15,
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
    editButton: {
        backgroundColor: '#6C63FF',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    editButtonText: {
        color: 'white',
        fontWeight: 'bold',
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
    emptyIcon: {
        backgroundColor: '#EDF2F7',
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
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
        marginBottom: 20,
        textAlign: 'center',
    },
    createEventButton: {
        backgroundColor: '#6C63FF',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 10,
    },
    createEventButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default DashboardScreen;