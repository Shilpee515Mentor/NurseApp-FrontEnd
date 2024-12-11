import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Text,
  Surface,
  IconButton,
  useTheme,
  Button,
  Portal,
  Modal,
  ProgressBar,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { 
  FadeInDown, 
  useAnimatedStyle, 
  withSpring,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import { useAuth } from '../../contexts/AuthContext';
import { userApi } from 'src/services/api';

export default function EmergencyScreen() {
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [helpOnWay, setHelpOnWay] = useState(false);
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState(0);
  const theme = useTheme();
  const { user } = useAuth();

  const pulseStyle = useAnimatedStyle(() => {
    if (!emergencyActive) return {};
    return {
      transform: [
        {
          scale: withRepeat(
            withSequence(
              withSpring(1.2),
              withSpring(1)
            ),
            -1,
            true
          ),
        },
      ],
    };
  });

  const handleEmergency = () => {
    setConfirmationVisible(true);
  };

  const confirmEmergency = async () => {
    setConfirmationVisible(false);
    setEmergencyActive(true);
    setEstimatedTime(3); // Mock estimated time in minutes
    
    // Simulate API call
    setTimeout(() => {
      setHelpOnWay(true);
    }, 2000);
    try {

      userApi.getNurseByDepartment('emergency').then(async response => {
        if(!!!response) {
          Alert.alert('Error', 'No Emergency Nurse Available,Contact Admin');
        }
        const requestData = {
          patient: user.id, 
          nurse: response?._id, 
          priority: 'high', 
          description: 'Emergency alert triggered', 
          department: 'Emergency',
        };
  
        await userApi.createRequest(requestData);
      }).catch(error => {
        console.error('Error fetching nurse:', error);
      });

     
    } catch (error) {
      Alert.alert('Error', 'Failed to send emergency alert');
    }
  };

  const cancelEmergency = () => {
    setEmergencyActive(false);
    setHelpOnWay(false);
  };

  const EmergencyButton = () => (
    <Animated.View style={[styles.emergencyButtonContainer, pulseStyle]}>
      <TouchableOpacity
        style={[
          styles.emergencyButton,
          emergencyActive && styles.emergencyButtonActive,
        ]}
        onPress={handleEmergency}
        disabled={emergencyActive}
      >
        <Icon
          name="alert-octagon"
          size={64}
          color={emergencyActive ? '#fff' : '#f44336'}
        />
        <Text style={[
          styles.emergencyButtonText,
          emergencyActive && styles.emergencyButtonTextActive,
        ]}>
          {emergencyActive ? 'EMERGENCY ACTIVE' : 'PRESS FOR EMERGENCY'}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const QuickActions = () => (
    <View style={styles.quickActions}>
      <Surface style={styles.actionCard}>
        <TouchableOpacity style={styles.actionButton}>
          <Icon name="phone" size={32} color={theme.colors.primary} />
          <Text style={styles.actionText}>Call Nurse</Text>
        </TouchableOpacity>
      </Surface>

      <Surface style={styles.actionCard}>
        <TouchableOpacity style={styles.actionButton}>
          <Icon name="medical-bag" size={32} color={theme.colors.primary} />
          <Text style={styles.actionText}>Medical Help</Text>
        </TouchableOpacity>
      </Surface>

      <Surface style={styles.actionCard}>
        <TouchableOpacity style={styles.actionButton}>
          <Icon name="pill" size={32} color={theme.colors.primary} />
          <Text style={styles.actionText}>Medicine</Text>
        </TouchableOpacity>
      </Surface>

      <Surface style={styles.actionCard}>
        <TouchableOpacity style={styles.actionButton}>
          <Icon name="account-nurse" size={32} color={theme.colors.primary} />
          <Text style={styles.actionText}>Assistance</Text>
        </TouchableOpacity>
      </Surface>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={emergencyActive ? ['#f44336', '#d32f2f'] : ['#1E88E5', '#1565C0'] as const}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <BlurView intensity={20} style={styles.headerBlur}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Emergency</Text>
            {emergencyActive && (
              <IconButton
                icon="close"
                iconColor="#fff"
                size={24}
                onPress={cancelEmergency}
                style={styles.headerButton}
              />
            )}
          </View>
        </BlurView>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <Animated.View entering={FadeInDown}>
          {emergencyActive ? (
            <Surface style={styles.statusCard}>
              <View style={styles.statusHeader}>
                <Icon name="alert-circle" size={32} color="#f44336" />
                <Text style={styles.statusTitle}>Emergency Alert Active</Text>
              </View>
              
              {helpOnWay && (
                <React.Fragment>
                  <Text style={styles.statusText}>Help is on the way!</Text>
                  <View style={styles.estimatedTime}>
                    <Text style={styles.estimatedTimeText}>
                      Estimated arrival in {estimatedTime} minutes
                    </Text>
                    <ProgressBar
                      progress={0.3}
                      color={theme.colors.primary}
                      style={styles.progressBar}
                    />
                  </View>
                </React.Fragment>
              )}

              <Button
                mode="contained"
                onPress={cancelEmergency}
                style={styles.cancelButton}
                icon="close-circle"
              >
                Cancel Emergency
              </Button>
            </Surface>
          ) : (
            <React.Fragment>
              <EmergencyButton />
              <Surface style={styles.infoCard}>
                <Text style={styles.infoTitle}>Quick Actions</Text>
                <Text style={styles.infoText}>
                  Select an action below or press the emergency button for immediate assistance
                </Text>
              </Surface>
              <QuickActions />
            </React.Fragment>
          )}
        </Animated.View>
      </ScrollView>

      <Portal>
        <Modal
          visible={confirmationVisible}
          onDismiss={() => setConfirmationVisible(false)}
          contentContainerStyle={styles.modalContent}
        >
          <View style={styles.modalHeader}>
            <Icon name="alert" size={48} color="#f44336" />
            <Text style={styles.modalTitle}>Confirm Emergency</Text>
          </View>
          <Text style={styles.modalText}>
            Are you sure you want to trigger an emergency alert? This will immediately notify medical staff.
          </Text>
          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => setConfirmationVisible(false)}
              style={styles.modalButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={confirmEmergency}
              style={[styles.modalButton, { backgroundColor: '#f44336' }]}
            >
              Confirm Emergency
            </Button>
          </View>
        </Modal>
      </Portal>
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
  headerButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emergencyButtonContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  emergencyButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    borderWidth: 2,
    borderColor: '#f44336',
  },
  emergencyButtonActive: {
    backgroundColor: '#f44336',
    borderColor: '#fff',
  },
  emergencyButtonText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f44336',
    textAlign: 'center',
  },
  emergencyButtonTextActive: {
    color: '#fff',
  },
  statusCard: {
    padding: 20,
    borderRadius: 12,
    marginVertical: 24,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  statusText: {
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 16,
  },
  estimatedTime: {
    marginVertical: 16,
  },
  estimatedTimeText: {
    fontSize: 16,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  cancelButton: {
    marginTop: 24,
    backgroundColor: '#f44336',
  },
  infoCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  actionButton: {
    padding: 20,
    alignItems: 'center',
  },
  actionText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    padding: 20,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 12,
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  modalButton: {
    flex: 1,
  },
});