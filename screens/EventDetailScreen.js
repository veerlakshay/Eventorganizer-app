import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';

const EventDetailScreen = () => {
    const route = useRoute();
    const { event } = route.params;

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>{event.eventName}</Text>
            <Text style={styles.description}>{event.description}</Text>

            <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Location:</Text>
                <Text style={styles.detailValue}>{event.location}</Text>
            </View>

            <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date:</Text>
                <Text style={styles.detailValue}>{event.date || 'Not specified'}</Text>
            </View>

            <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Time:</Text>
                <Text style={styles.detailValue}>{event.time || 'Not specified'}</Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#F8F9FA',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#2D3748',
    },
    description: {
        fontSize: 16,
        marginBottom: 30,
        color: '#4A5568',
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    detailLabel: {
        fontWeight: 'bold',
        width: 100,
        color: '#4A5568',
    },
    detailValue: {
        flex: 1,
        color: '#718096',
    },
});

export default EventDetailScreen;