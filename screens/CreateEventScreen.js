// screens/CreateEventScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../config/firebaseConfig'; // Import the Firestore instance

const CreateEventScreen = () => {
    const navigation = useNavigation();
    const [eventName, setEventName] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [date, setDate] = useState(''); // You might want to use a DatePicker in a real app
    const [time, setTime] = useState(''); // You might want to use a TimePicker
    const [errorMessage, setErrorMessage] = useState(null);

    const handleCreateEvent = async () => {
        try {
            const docRef = await addDoc(collection(db, 'events'), {
                eventName: eventName,
                description: description,
                location: location,
                date: date,
                time: time,
                // Add the current user's ID (you'll need to get this from Firebase Auth)
                userId: auth.currentUser.uid
            });
            console.log('Event created with ID: ', docRef.id);
            // After successful creation, navigate back to the Dashboard
            navigation.goBack();
        } catch (error) {
            setErrorMessage('Error creating event: ' + error.message);
            console.error('Error creating event:', error);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Create New Event</Text>
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
            <Button title="Create Event" onPress={handleCreateEvent} />
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

export default CreateEventScreen;