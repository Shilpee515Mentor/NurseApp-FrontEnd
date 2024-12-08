import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { Card, Title, Paragraph } from 'react-native-paper';
import { NavigationProp, useNavigation } from '@react-navigation/native';

export default function NurseDashboard() {
  const { logout, user } = useAuth();
  const navigation = useNavigation<NavigationProp<any>>();

  const handleNavigation = (screen: string) => {
    navigation.navigate(screen);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nurse Dashboard</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <Card style={styles.card} onPress={() => handleNavigation('PatientRegistration')}>
          <Card.Content>
            <Text style={styles.cardTitle}>Register Patient</Text>
            <Text style={styles.cardDescription}>
              Register a new patient in the system
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card} onPress={() => navigation.navigate('MyPatients')}>
          <Card.Content>
            <Title>My Patients</Title>
            <Paragraph>View and manage your assigned patients and their requests</Paragraph>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Schedule</Text>
            <Text style={styles.cardDescription}>
              Check your work schedule and assignments
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Tasks</Text>
            <Text style={styles.cardDescription}>
              View and update patient care tasks
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Messages</Text>
            <Text style={styles.cardDescription}>
              Communication with team members
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: 8,
  },
  logoutText: {
    color: '#007AFF',
    fontSize: 16,
  },
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cardDescription: {
    color: '#666',
    fontSize: 14,
  },
});
