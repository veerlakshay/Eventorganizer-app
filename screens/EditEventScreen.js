// screens/EditEventScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { getAuth } from 'firebase/auth'; // Import getAuth

const EditEventScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { event } = route.params;

    const [eventName, setEventName] = useState(event?.eventName || '');
    const [description, setDescription] = useState(event?.description || '');
    const [location, setLocation] = useState(event?.location || '');
    const [date, setDate] = useState(event?.date || '');
    const [time, setTime] = useState(event?.time || '');
    const [errorMessage, setErrorMessage] = useState(null);

    useEffect(() => {
        if (event) {
            setEventName(event.eventName);
            setDescription(event.description);
            setLocation(event.location);
            setDate(event.date);
            setTime(event.time);
        }
    }, [event]);

    const handleUpdateEvent = async () => {
        try {
            const auth = getAuth(); // Get the auth instance
            const userId = auth.currentUser?.uid; // Get the current user's ID

            if (!event?.id) {
                setErrorMessage('Event ID is missing.');
                return;
            }

            const eventDocRef = doc(db, 'events', event.id);
            await updateDoc(eventDocRef, {
                eventName: eventName,
                description: description,
                location: location,
                date: date,
                time: time,
                userId: userId, // Update the userId as well
            });
            console.log('Event updated successfully!');
            navigation.goBack();
        } catch (error) {
            setErrorMessage('Error updating event: ' + error.message);
            console.error('Error updating event:', error);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Edit Event</Text>
            {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}
            <TextInput
                style={styles.input}
                placeholder="Event Name"
                value={eventName}
                onChangeText={setEventName}
            />
            <TextInput
                style={styles.input}
                placeholder="Description"
                multiline
                value={description}
                onChangeText={setDescription}
            />
            <TextInput
                style={styles.input}
                placeholder="Location"
                value={location}
                onChangeText={setLocation}
            />
            <TextInput
                style={styles.input}
                placeholder="Date (YYYY-MM-DD)"
                value={date}
                onChangeText={setDate}
            />
            <TextInput
                style={styles.input}
                placeholder="Time (HH:MM)"
                value={time}
                onChangeText={setTime}
            />
            <Button title="Update Event" onPress={handleUpdateEvent} />
        </ScrollView>
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
    },
    input: {
        width: '100%',
        padding: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
    },
    error: {
        color: 'red',
        marginBottom: 10,
    },
});

export default EditEventScreen;