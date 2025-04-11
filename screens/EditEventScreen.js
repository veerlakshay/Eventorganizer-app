import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { updateDoc, doc } from 'firebase/firestore';
import { db, getAuth } from '../config/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

const EditEventScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { event } = route.params;

    const [eventName, setEventName] = useState(event?.eventName || '');
    const [description, setDescription] = useState(event?.description || '');
    const [location, setLocation] = useState(event?.location || '');
    const [date, setDate] = useState(event?.date ? new Date(event.date) : new Date());
    const [time, setTime] = useState(new Date());
    const [errorMessage, setErrorMessage] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    useEffect(() => {
        if (event) {
            setEventName(event.eventName);
            setDescription(event.description);
            setLocation(event.location);
            setDate(event.date ? new Date(event.date) : new Date());

            if (event.time) {
                const [hours, minutes] = event.time.split(':');
                const timeDate = new Date();
                timeDate.setHours(parseInt(hours));
                timeDate.setMinutes(parseInt(minutes));
                setTime(timeDate);
            }
        }
    }, [event]);

    const handleUpdateEvent = async () => {
        if (!eventName || !description || !location) {
            setErrorMessage('Please fill in all required fields');
            return;
        }

        try {
            const auth = getAuth();
            const userId = auth.currentUser?.uid;

            if (!event?.id) {
                setErrorMessage('Event ID is missing.');
                return;
            }

            const formattedDate = date.toISOString().split('T')[0];
            const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            const eventDocRef = doc(db, 'events', event.id);
            await updateDoc(eventDocRef, {
                eventName,
                description,
                location,
                date: formattedDate,
                time: formattedTime,
                userId,
                updatedAt: new Date().toISOString()
            });

            Alert.alert(
                'Success',
                'Event updated successfully!',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (error) {
            setErrorMessage('Error updating event: ' + error.message);
            console.error('Error updating event:', error);
        }
    };

    const onDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setDate(selectedDate);
        }
    };

    const onTimeChange = (event, selectedTime) => {
        setShowTimePicker(false);
        if (selectedTime) {
            setTime(selectedTime);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color="#6C63FF" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Edit Event</Text>
                    <View style={{ width: 24 }} /> {/* Spacer for alignment */}
                </View>

                {errorMessage && (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{errorMessage}</Text>
                    </View>
                )}

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Event Name *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter event name"
                        placeholderTextColor="#A0AEC0"
                        value={eventName}
                        onChangeText={setEventName}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Description *</Text>
                    <TextInput
                        style={[styles.input, styles.multilineInput]}
                        placeholder="Enter event description"
                        placeholderTextColor="#A0AEC0"
                        multiline
                        numberOfLines={4}
                        value={description}
                        onChangeText={setDescription}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Location *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter location"
                        placeholderTextColor="#A0AEC0"
                        value={location}
                        onChangeText={setLocation}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Date *</Text>
                    <TouchableOpacity
                        style={styles.input}
                        onPress={() => setShowDatePicker(true)}
                    >
                        <Text style={styles.dateText}>
                            {date.toLocaleDateString()}
                        </Text>
                    </TouchableOpacity>
                    {showDatePicker && (
                        <DateTimePicker
                            value={date}
                            mode="date"
                            display="default"
                            onChange={onDateChange}
                        />
                    )}
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Time *</Text>
                    <TouchableOpacity
                        style={styles.input}
                        onPress={() => setShowTimePicker(true)}
                    >
                        <Text style={styles.dateText}>
                            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </TouchableOpacity>
                    {showTimePicker && (
                        <DateTimePicker
                            value={time}
                            mode="time"
                            display="default"
                            onChange={onTimeChange}
                        />
                    )}
                </View>

                <TouchableOpacity
                    style={styles.updateButton}
                    onPress={handleUpdateEvent}
                >
                    <Text style={styles.buttonText}>Update Event</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => {
                        Alert.alert(
                            'Delete Event',
                            'Are you sure you want to delete this event?',
                            [
                                { text: 'Cancel', style: 'cancel' },
                                {
                                    text: 'Delete',
                                    style: 'destructive',
                                    onPress: () => {
                                        // Add your delete logic here
                                        navigation.goBack();
                                    }
                                },
                            ]
                        );
                    }}
                >
                    <Text style={styles.deleteButtonText}>Delete Event</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    scrollContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2D3748',
    },
    errorContainer: {
        backgroundColor: '#FFF5F5',
        padding: 12,
        borderRadius: 8,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#FED7D7',
    },
    errorText: {
        color: '#E53E3E',
        textAlign: 'center',
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4A5568',
        marginBottom: 8,
    },
    input: {
        width: '100%',
        padding: 15,
        backgroundColor: 'white',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        fontSize: 16,
        color: '#1A202C',
    },
    multilineInput: {
        height: 100,
        textAlignVertical: 'top',
    },
    dateText: {
        fontSize: 16,
        color: '#1A202C',
        paddingVertical: 2,
    },
    updateButton: {
        backgroundColor: '#6C63FF',
        padding: 18,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
    },
    deleteButton: {
        backgroundColor: 'white',
        padding: 18,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 15,
        borderWidth: 1,
        borderColor: '#E53E3E',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    deleteButtonText: {
        color: '#E53E3E',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default EditEventScreen;