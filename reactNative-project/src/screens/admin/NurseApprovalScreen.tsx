import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  StatusBar,
} from 'react-native';
import {
  Text,
  Surface,
  IconButton,
  useTheme,
  Avatar,
  Button,
  Chip,
  Searchbar,
  Portal,
  Modal,
} from 'react-native-paper';
import { userApi, User } from '../../services/api';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { format } from 'date-fns';

export default function NurseApprovalScreen() {
  const [pendingNurses, setPendingNurses] = useState<User[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNurse, setSelectedNurse] = useState<User | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const theme = useTheme();

  const fetchPendingNurses = async () => {
    try {
      const response = await userApi.getPendingNurses();
      setPendingNurses(response);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch pending nurse registrations');
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPendingNurses();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchPendingNurses();
  }, []);

  const handleApproval = async (userId: string, status: 'approved' | 'rejected') => {
    try {
      setLoading(true);
      await userApi.approveNurse(userId, status);
      Alert.alert(
        'Success',
        `Nurse registration ${status}`,
        [{ text: 'OK', onPress: fetchPendingNurses }]
      );
    } catch (error) {
      Alert.alert('Error', `Failed to ${status} nurse registration`);
    } finally {
      setLoading(false);
      setModalVisible(false);
    }
  };

  const filteredNurses = pendingNurses.filter(nurse => 
    (nurse.firstName + ' ' + nurse.lastName + nurse.email)
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const renderNurseCard = (nurse: User) => (
    <Animated.View
      entering={FadeInDown}
      layout={Layout.springify()}
      key={nurse._id}
    >
      <Surface style={styles.nurseCard}>
        <View style={styles.cardHeader}>
          <View style={styles.nurseInfo}>
            <Avatar.Text
              size={50}
              label={`${nurse.firstName[0]}${nurse.lastName[0]}`}
              style={{ backgroundColor: theme.colors.primary }}
            />
            <View style={styles.nameContainer}>
              <Text style={styles.nurseName}>
                {nurse.firstName} {nurse.lastName}
              </Text>
              <Text style={styles.nurseEmail}>{nurse.email}</Text>
            </View>
          </View>
          <Chip mode="outlined" style={styles.departmentChip}>
            {nurse.department}
          </Chip>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.infoRow}>
            <Icon name="calendar" size={20} color="#666" />
            <Text style={styles.infoText}>
              Applied: {format(new Date(nurse.createdAt), 'MMM dd, yyyy')}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="phone" size={20} color="#666" />
            <Text style={styles.infoText}>{nurse.phone || 'No phone provided'}</Text>
          </View>
        </View>

        <View style={styles.cardActions}>
          <Button
            mode="contained"
            onPress={() => {
              setSelectedNurse(nurse);
              setModalVisible(true);
            }}
            icon="account-details"
            style={styles.viewButton}
          >
            View Details
          </Button>
        </View>
      </Surface>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#1E88E5', '#1565C0'] as const}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <BlurView intensity={20} style={styles.headerBlur}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Nurse Approvals</Text>
            <IconButton
              icon="refresh"
              iconColor="#fff"
              size={24}
              onPress={onRefresh}
              style={styles.headerButton}
            />
          </View>
          <Searchbar
            placeholder="Search nurses..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            inputStyle={styles.searchInput}
          />
        </BlurView>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredNurses.length === 0 ? (
          <Surface style={styles.emptyContainer}>
            <Icon name="account-check" size={48} color={theme.colors.primary} />
            <Text style={styles.emptyText}>No pending approvals</Text>
            <Text style={styles.emptySubtext}>
              All nurse registrations have been processed
            </Text>
          </Surface>
        ) : (
          filteredNurses.map(renderNurseCard)
        )}
      </ScrollView>

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContent}
        >
          {selectedNurse && (
            <View>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Nurse Details</Text>
                <IconButton
                  icon="close"
                  size={24}
                  onPress={() => setModalVisible(false)}
                />
              </View>

              <View style={styles.modalBody}>
                <Avatar.Text
                  size={80}
                  label={`${selectedNurse.firstName[0]}${selectedNurse.lastName[0]}`}
                  style={styles.modalAvatar}
                />
                <Text style={styles.modalName}>
                  {selectedNurse.firstName} {selectedNurse.lastName}
                </Text>
                <Text style={styles.modalEmail}>{selectedNurse.email}</Text>

                <Surface style={styles.detailsCard}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Department</Text>
                    <Text style={styles.detailValue}>{selectedNurse.department}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Phone</Text>
                    <Text style={styles.detailValue}>
                      {selectedNurse.phone || 'Not provided'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Applied Date</Text>
                    <Text style={styles.detailValue}>
                      {format(new Date(selectedNurse.createdAt), 'MMMM dd, yyyy')}
                    </Text>
                  </View>
                </Surface>

                <View style={styles.modalActions}>
                  <Button
                    mode="contained"
                    onPress={() => handleApproval(selectedNurse._id, 'approved')}
                    style={[styles.actionButton, styles.approveButton]}
                    loading={loading}
                    icon="check"
                  >
                    Approve
                  </Button>
                  <Button
                    mode="contained"
                    onPress={() => handleApproval(selectedNurse._id, 'rejected')}
                    style={[styles.actionButton, styles.rejectButton]}
                    loading={loading}
                    icon="close"
                  >
                    Reject
                  </Button>
                </View>
              </View>
            </View>
          )}
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
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  searchBar: {
    marginBottom: 12,
    elevation: 0,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  searchInput: {
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  nurseCard: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  nurseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameContainer: {
    marginLeft: 12,
  },
  nurseName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  nurseEmail: {
    fontSize: 14,
    color: '#666',
  },
  departmentChip: {
    height: 28,
  },
  cardContent: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  viewButton: {
    borderRadius: 8,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    borderRadius: 16,
    marginTop: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    color: '#333',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 20,
    alignItems: 'center',
  },
  modalAvatar: {
    marginBottom: 16,
  },
  modalName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalEmail: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  detailsCard: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    elevation: 2,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    width: '100%',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
    borderRadius: 8,
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#f44336',
  },
});
