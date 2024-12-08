import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

export default function PatientProfileScreen() {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Patient Profile</Text>
      
      <View style={styles.profileInfo}>
        <Text style={styles.label}>Name:</Text>
        <Text style={styles.value}>{user?.name}</Text>
        
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{user?.email}</Text>
        
        <Text style={styles.label}>Role:</Text>
        <Text style={styles.value}>{user?.role}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  profileInfo: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    color: '#333',
  },
  value: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
});
