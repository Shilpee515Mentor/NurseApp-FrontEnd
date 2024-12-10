import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { Surface, IconButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { RootStackParamList } from '../../types/navigation';

export default function PatientDashboard() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user, logout } = useAuth();
  const { width } = useWindowDimensions();

  const menuItems = [
    {
      title: 'Medical Assistant',
      description: 'Chat with our AI medical assistant',
      icon: 'robot',
      screen: 'Chat',
      gradient: ['#6DD5FA', '#2980B9'] as const,
    },
    {
      title: 'My Appointments',
      description: 'View and manage your appointments',
      icon: 'calendar-clock',
      screen: 'Appointments',
      gradient: ['#FF6B6B', '#FF8E8E'] as const,
    },
    {
      title: 'My Profile',
      description: 'View and update your profile',
      icon: 'account-circle',
      screen: 'PatientProfile',
      gradient: ['#4ECDC4', '#45B7AF'] as const,
    },
    {
      title: 'Medical Records',
      description: 'Access your medical history',
      icon: 'file-document',
      screen: 'MedicalRecords',
      gradient: ['#6C63FF', '#5A52E5'] as const,
    },
    {
      title: 'Medications',
      description: 'View your prescribed medications',
      icon: 'pill',
      screen: 'Medications',
      gradient: ['#FFD93D', '#F4C430'] as const,
    },
    {
      title: 'Emergency',
      description: 'Quick access to emergency services',
      icon: 'alert',
      screen: 'Emergency',
      gradient: ['#FF416C', '#FF4B2B'] as const,
    },
  ] as const;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#00796B', '#004D40'] as const}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <BlurView intensity={20} style={styles.headerBlur}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.headerTitle}>{user?.firstName}</Text>
            </View>
            <IconButton
              icon="logout"
              iconColor="#fff"
              size={24}
              onPress={logout}
              style={styles.logoutButton}
            />
          </View>
        </BlurView>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.gridContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.gridItem, { width: width / 2 - 24 }]}
              onPress={() => navigation.navigate(item.screen)}
            >
              <Surface style={styles.surface}>
                <LinearGradient
                  colors={item.gradient}
                  style={styles.cardGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.iconContainer}>
                    <Icon name={item.icon} size={32} color="#fff" />
                  </View>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardDescription} numberOfLines={2}>
                    {item.description}
                  </Text>
                </LinearGradient>
              </Surface>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 48,
    paddingBottom: 16,
  },
  headerBlur: {
    padding: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  logoutButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  gridItem: {
    marginBottom: 16,
  },
  surface: {
    borderRadius: 16,
    elevation: 4,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  cardGradient: {
    padding: 16,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.9,
    textAlign: 'center',
    marginTop: 4,
  },
});
