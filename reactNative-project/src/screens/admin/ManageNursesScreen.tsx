import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Text,
  Surface,
  IconButton,
  useTheme,
  Searchbar,
  Menu,
  Chip,
  Avatar,
  FAB,
  Portal,
  Modal,
  Button,
  Divider,
  List,
  TextInput,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { format } from 'date-fns';
import { User } from '../../types/api';
import { Department, departmentApi, taskApi, userApi } from '../../services/api';
import axios from 'axios';

interface NurseStats {
  completedRequests: number;
  activeRequests: number;
  averageResponseTime: number;
  rating: number;
}

export default function ManageNursesScreen({ navigation }) {
  const [nurses, setNurses] = useState<User[]>([]);
  const [filteredNurses, setFilteredNurses] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNurse, setSelectedNurse] = useState<User | null>(null);
  const [nurseStats, setNurseStats] = useState<NurseStats | null>(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isTaskModalVisible, setIsTaskModalVisible] = useState(false);
  const [taskDescription, setTaskDescription] = useState('');
  const [isAssigningTask, setIsAssigningTask] = useState(false);
  const theme = useTheme();
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    fetchNurses();
    fetchDepartments();
  }, []);

  const fetchNurses = async () => {
    try {
      const response = await userApi.getUsersByRole('nurse');
      setNurses(response);
      setFilteredNurses(response);
    } catch (err) {
      console.error('Error fetching nurses:', err);
    }
  };

  const fetchNurseStats = async (nurseId: string) => {
    // Mock stats - replace with actual API call
    const mockStats: NurseStats = {
      completedRequests: 156,
      activeRequests: 3,
      averageResponseTime: 12.5,
      rating: 4.8,
    };
    setNurseStats(mockStats);
  };
  const fetchDepartments = async () => {
    try {
      const response = await departmentApi.getAll();
      setDepartments(response.departments);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = nurses.filter(nurse =>
      `${nurse.firstName} ${nurse.lastName} ${nurse.email}`
        .toLowerCase()
        .includes(query.toLowerCase())
    );
    setFilteredNurses(filtered);
  };

  const handleFilter = (filter: string) => {
    setSelectedFilters(prev => {
      const newFilters = prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter];

      // Now use the newFilters to filter nurses
      const filtered = nurses.filter(nurse => 
        newFilters.length === 0 || newFilters.includes(nurse.department!.toLocaleLowerCase())
      );
      setFilteredNurses(filtered);
      
      return newFilters; // Return the updated filters
    });
  };

  const renderNurseCard = (nurse: User) => (
    <Animated.View
      entering={FadeInDown}
      layout={Layout.springify()}
      key={nurse._id}
    >
      <Surface style={styles.nurseCard}>
        <TouchableOpacity
          onPress={() => {
            setSelectedNurse(nurse);
            fetchNurseStats(nurse._id);
            setModalVisible(true);
          }}
        >
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
            <Chip
              mode="outlined"
              style={[
                styles.statusChip,
                { borderColor: getStatusColor(nurse.status) }
              ]}
            >
              {nurse.status}
            </Chip>
          </View>

          <View style={styles.cardContent}>
            <View style={styles.infoRow}>
              <Icon name="hospital-building" size={20} color="#666" />
              <Text style={styles.infoText}>{nurse.department}</Text>
            </View>
            <View style={styles.infoRow}>
              <Icon name="phone" size={20} color="#666" />
              <Text style={styles.infoText}>{nurse.phone}</Text>
            </View>
          </View>

          <View style={styles.cardFooter}>
            <Text style={styles.joinedDate}>
              Joined: {format(new Date(nurse.createdAt), 'MMM dd, yyyy')}
            </Text>
            <IconButton
              icon="chevron-right"
              size={24}
              iconColor={theme.colors.primary}
            />
          </View>
        </TouchableOpacity>
      </Surface>
    </Animated.View>
  );

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Active':
        return '#4CAF50';
      case 'On Leave':
        return '#FF9800';
      case 'Busy':
        return '#F44336';
      default:
        return '#757575';
    }
  };

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
            <Text style={styles.headerTitle}>Manage Nurses</Text>
            <IconButton
              icon="filter-variant"
              iconColor="#fff"
              size={24}
              onPress={() => setShowFilterMenu(true)}
              style={styles.headerButton}
            />
          </View>
          <Searchbar
            placeholder="Search nurses..."
            onChangeText={handleSearch}
            value={searchQuery}
            style={styles.searchBar}
            inputStyle={styles.searchInput}
          />
        </BlurView>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchNurses}
          />
        }
      >
        <View style={styles.filterChips}>
          {departments.map((dept) => (
            <Chip
              key={dept.id}
              selected={selectedFilters.includes(dept.id)}
              onPress={() => handleFilter(dept.id)}
              style={styles.filterChip}
              showSelectedOverlay
            >
              {dept.name}
            </Chip>
          ))}
        </View>

        {filteredNurses.map(renderNurseCard)}
      </ScrollView>

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContent}
        >
          {selectedNurse && nurseStats && (
            <ScrollView>
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
                  style={[styles.modalAvatar, { backgroundColor: theme.colors.primary }]}
                />
                <Text style={styles.modalName}>
                  {selectedNurse.firstName} {selectedNurse.lastName}
                </Text>
                <Chip
                  mode="outlined"
                  style={[
                    styles.modalStatus,
                    { borderColor: getStatusColor(selectedNurse.status) }
                  ]}
                >
                  {selectedNurse.status}
                </Chip>
                <Button
                  mode="contained"
                  onPress={() => setIsTaskModalVisible(true)}
                  style={styles.assignTaskButton}
                  icon="clipboard-text-outline"
                >
                  Assign Task
                </Button>

                {/* <Surface style={styles.statsCard}>
                  <View style={styles.statsGrid}>
                    <View style={styles.statItem}>
                      <Icon name="clipboard-check" size={24} color={theme.colors.primary} />
                      <Text style={styles.statValue}>{nurseStats.completedRequests}</Text>
                      <Text style={styles.statLabel}>Completed</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Icon name="clipboard-clock" size={24} color="#FF9800" />
                      <Text style={styles.statValue}>{nurseStats.activeRequests}</Text>
                      <Text style={styles.statLabel}>Active</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Icon name="clock" size={24} color="#2196F3" />
                      <Text style={styles.statValue}>{nurseStats.averageResponseTime}m</Text>
                      <Text style={styles.statLabel}>Avg Response</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Icon name="star" size={24} color="#FFC107" />
                      <Text style={styles.statValue}>{nurseStats.rating}</Text>
                      <Text style={styles.statLabel}>Rating</Text>
                    </View>
                  </View>
                </Surface> */}

                <List.Section style={styles.detailsList}>
                  <List.Item
                    title="Department"
                    description={selectedNurse.department}
                    left={props => <List.Icon {...props} icon="hospital-building" />}
                  />
                  <List.Item
                    title="Email"
                    description={selectedNurse.email}
                    left={props => <List.Icon {...props} icon="email" />}
                  />
                  <List.Item
                    title="Phone"
                    description={selectedNurse.phone}
                    left={props => <List.Icon {...props} icon="phone" />}
                  />
                  <List.Item
                    title="Joined"
                    description={format(new Date(selectedNurse.createdAt), 'MMMM dd, yyyy')}
                    left={props => <List.Icon {...props} icon="calendar" />}
                  />
                </List.Section>

                <View style={styles.modalActions}>
                  <Button
                    mode="contained"
                    onPress={() => {}}
                    style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
                    icon="message"
                  >
                    Message
                  </Button>
                  <Button
                    mode="contained"
                    onPress={() => navigation.navigate('ManageSchedules', { nurse: selectedNurse })}
                    style={[styles.actionButton, { backgroundColor: '#2196F3' }]}
                    icon="calendar"
                  >
                    Schedule
                  </Button>
                </View>
              </View>
            </ScrollView>
          )}
        </Modal>
      </Portal>
 {/* Task Assignment Modal */}
 <Portal>
                  <Modal
                    visible={isTaskModalVisible}
                    onDismiss={() => {
                      setIsTaskModalVisible(false);
                      setTaskDescription('');
                    }}
                    contentContainerStyle={styles.taskModalContainer}
                  >
                    <Text style={styles.taskModalTitle}>Assign New Task</Text>
                    <TextInput
                      mode="outlined"
                      label="Task Description"
                      value={taskDescription}
                      onChangeText={setTaskDescription}
                      multiline
                      numberOfLines={3}
                      style={styles.taskInput}
                    />
                    <View style={styles.taskModalButtons}>
                      <Button
                        mode="outlined"
                        onPress={() => {
                          setIsTaskModalVisible(false);
                          setTaskDescription('');
                        }}
                        style={styles.taskModalButton}
                      >
                        Cancel
                      </Button>
                      <Button
                        mode="contained"
                        onPress={async () => {
                          if (!taskDescription.trim()) return;
                          setIsAssigningTask(true);
                          try {
                            await taskApi.createTask({
                              description: taskDescription,
                              assignedTo: selectedNurse!._id,
                            });
                            setIsTaskModalVisible(false);
                            setTaskDescription('');
                            Alert.alert('Task assigned successfully');
                          } catch (error) {
                            console.error('Error assigning task:', error);
                            Alert.alert('Failed to assign task');
                          } finally {
                            setIsAssigningTask(false);
                          }
                        }}
                        loading={isAssigningTask}
                        disabled={isAssigningTask || !taskDescription.trim()}
                        style={styles.taskModalButton}
                      >
                        Assign
                      </Button>
                    </View>
                  </Modal>
                </Portal>
      {/* <FAB
        icon="plus"
        style={styles.fab}
        onPress={() =>}
      /> */}

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
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },
  filterChip: {
    marginRight: 8,
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
  statusChip: {
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
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  joinedDate: {
    fontSize: 12,
    color: '#666',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    maxHeight: '80%',
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
  },
  modalAvatar: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalStatus: {
    alignSelf: 'center',
    marginTop: 8,
  },
  statsCard: {
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    elevation: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  detailsList: {
    marginTop: 24,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  assignTaskButton: {
    marginTop: 16,
  },
  taskModalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  taskModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  taskInput: {
    marginBottom: 16,
  },
  taskModalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  taskModalButton: {
    minWidth: 100,
  },
}); 