import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { appointmentApi } from '../../services/api';

interface Appointment {
  id: string;
  date: string;
  time: string;
  department: string;
  status: string;
}

export default function AppointmentScreen() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function loadAppointments() {
      try {
        const fetchedAppointments = await appointmentApi.fetchAppointments(user?.id);
        setAppointments(fetchedAppointments);
      } catch (error) {
        console.error('Failed to fetch appointments:', error);
      } finally {
        setLoading(false);
      }
    }

    loadAppointments();
  }, [user?.id]);

  const renderAppointment = ({ item }: { item: Appointment }) => (
    <View style={styles.appointmentCard}>
      <Text style={styles.appointmentDate}>{item.date} at {item.time}</Text>
      <Text style={styles.appointmentDepartment}>{item.department}</Text>
      <Text style={[
        styles.appointmentStatus, 
        item.status === 'confirmed' ? styles.confirmedStatus : styles.pendingStatus
      ]}>
        {item.status.toUpperCase()}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Appointments</Text>
      
      {appointments.length === 0 ? (
        <Text style={styles.noAppointmentsText}>No upcoming appointments</Text>
      ) : (
        <FlatList
          data={appointments}
          renderItem={renderAppointment}
          keyExtractor={item => item.id}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  noAppointmentsText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#666',
    marginTop: 50,
  },
  appointmentCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appointmentDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  appointmentDepartment: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  appointmentStatus: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 10,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  confirmedStatus: {
    backgroundColor: 'rgba(40, 167, 69, 0.2)',
    color: '#28a745',
  },
  pendingStatus: {
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
    color: '#ffc107',
  },
});
