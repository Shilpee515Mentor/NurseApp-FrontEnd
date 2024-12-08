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

export default function AdminDashboard() {
  const { logout } = useAuth();
  const navigation = useNavigation<NavigationProp<any>>();

  const handleNavigation = (screen: string) => {
    navigation.navigate(screen);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        <Card style={styles.card} onPress={() => handleNavigation('NurseApproval')}>
          <Card.Content>
            <Text style={styles.cardTitle}>Nurse Approvals</Text>
            <Text style={styles.cardDescription}>
              Review and manage nurse registration requests
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card} onPress={() => navigation.navigate('CreateRequest')}>
          <Card.Content>
            <Title>Create Request</Title>
            <Paragraph>Create and assign new patient requests to nurses</Paragraph>
          </Card.Content>
        </Card>

        <Card style={styles.card} onPress={() => navigation.navigate('RequestManagement')}>
          <Card.Content>
            <Title>Manage Requests</Title>
            <Paragraph>View and filter all patient requests</Paragraph>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Manage Nurses</Text>
            <Text style={styles.cardDescription}>
              View and manage nurse accounts and assignments
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Patient Records</Text>
            <Text style={styles.cardDescription}>
              Access and manage patient information
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Reports</Text>
            <Text style={styles.cardDescription}>
              View and generate system reports
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
    marginBottom: 15,
    elevation: 4,
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
