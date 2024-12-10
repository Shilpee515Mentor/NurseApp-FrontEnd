import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  StatusBar,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { Surface, IconButton, useTheme } from 'react-native-paper';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

export default function AdminDashboard() {
  const { logout } = useAuth();
  const navigation = useNavigation<NavigationProp<any>>();
  const { width } = useWindowDimensions();
  const theme = useTheme();

  const menuItems = [
    {
      title: 'Nurse Approvals',
      description: 'Review and manage nurse registration requests',
      icon: 'account-check',
      screen: 'NurseApproval',
      gradient: ['#FF6B6B', '#FF8E8E'] as const,
    },
    {
      title: 'Create Request',
      description: 'Create and assign new patient requests',
      icon: 'plus-circle',
      screen: 'CreateRequest',
      gradient: ['#4ECDC4', '#45B7AF'] as const,
    },
    {
      title: 'Manage Requests',
      description: 'View and filter all patient requests',
      icon: 'clipboard-list',
      screen: 'RequestManagement',
      gradient: ['#6C63FF', '#5A52E5'] as const,
    },
    {
      title: 'Manage Nurses',
      description: 'View and manage nurse accounts',
      icon: 'account-group',
      screen: 'ManageNurses',
      gradient: ['#FFD93D', '#F4C430'] as const,
    },
    {
      title: 'Patient Records',
      description: 'Access and manage patient information',
      icon: 'folder-account',
      screen: 'PatientRecords',
      gradient: ['#FF8008', '#FFA34D'] as const,
    },
    {
      title: 'Reports',
      description: 'View and generate system reports',
      icon: 'chart-bar',
      screen: 'Reports',
      gradient: ['#6DD5FA', '#2980B9'] as const,
    },
  ] as const;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#1a237e', '#0d47a1']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <BlurView intensity={20} style={styles.headerBlur}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerTitle}>Admin Dashboard</Text>
              <Text style={styles.headerSubtitle}>Healthcare Management System</Text>
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
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
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
    height: 180,
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
