import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Surface,
  IconButton,
  useTheme,
  Searchbar,
  Chip,
  Menu,
  Portal,
  Modal,
  Button,
  ProgressBar,
  List,
  Divider,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { format } from 'date-fns';

interface Request {
  id: string;
  patient: {
    id: string;
    name: string;
    room: string;
  };
  nurse: {
    id: string;
    name: string;
  };
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  department: string;
  createdAt: string;
  updatedAt: string;
  estimatedTime?: number;
  completionTime?: number;
}

export default function RequestManagementScreen() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<Request[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<{
    status: string[];
    priority: string[];
    department: string[];
  }>({
    status: [],
    priority: [],
    department: [],
  });
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    // Mock data - replace with actual API call
    const mockRequests: Request[] = [
      {
        id: '1',
        patient: {
          id: 'p1',
          name: 'John Doe',
          room: '201',
        },
        nurse: {
          id: 'n1',
          name: 'Jane Smith',
        },
        description: 'Patient requires assistance with medication',
        priority: 'high',
        status: 'in_progress',
        department: 'Cardiology',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        estimatedTime: 30,
        completionTime: 15,
      },
      // Add more mock requests...
    ];
    setRequests(mockRequests);
    setFilteredRequests(mockRequests);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    applyFilters(query, selectedFilters);
  };

  const applyFilters = (query: string, filters: typeof selectedFilters) => {
    let filtered = requests.filter(request => {
      const matchesSearch = (
        request.patient.name.toLowerCase() +
        request.nurse.name.toLowerCase() +
        request.description.toLowerCase()
      ).includes(query.toLowerCase());

      const matchesStatus = filters.status.length === 0 || 
        filters.status.includes(request.status);
      
      const matchesPriority = filters.priority.length === 0 ||
        filters.priority.includes(request.priority);
      
      const matchesDepartment = filters.department.length === 0 ||
        filters.department.includes(request.department);

      return matchesSearch && matchesStatus && matchesPriority && matchesDepartment;
    });

    setFilteredRequests(filtered);
  };

  const toggleFilter = (type: keyof typeof selectedFilters, value: string) => {
    const newFilters = { ...selectedFilters };
    if (newFilters[type].includes(value)) {
      newFilters[type] = newFilters[type].filter(v => v !== value);
    } else {
      newFilters[type].push(value);
    }
    setSelectedFilters(newFilters);
    applyFilters(searchQuery, newFilters);
  };

  const getStatusColor = (status: Request['status']) => {
    switch (status) {
      case 'pending':
        return '#757575';
      case 'assigned':
        return '#2196F3';
      case 'in_progress':
        return '#FF9800';
      case 'completed':
        return '#4CAF50';
      case 'cancelled':
        return '#F44336';
      default:
        return '#757575';
    }
  };

  const getPriorityColor = (priority: Request['priority']) => {
    switch (priority) {
      case 'low':
        return '#4CAF50';
      case 'medium':
        return '#FF9800';
      case 'high':
        return '#F44336';
      default:
        return '#757575';
    }
  };

  const renderRequestCard = (request: Request) => (
    <Animated.View
      entering={FadeInDown}
      layout={Layout.springify()}
      key={request.id}
    >
      <Surface style={styles.requestCard}>
        <TouchableOpacity
          onPress={() => {
            setSelectedRequest(request);
            setModalVisible(true);
          }}
        >
          <View style={styles.cardHeader}>
            <View style={styles.headerLeft}>
              <Text style={styles.patientName}>{request.patient.name}</Text>
              <Text style={styles.roomNumber}>Room {request.patient.room}</Text>
            </View>
            <View style={styles.headerRight}>
              <Chip
                mode="outlined"
                style={[
                  styles.statusChip,
                  { borderColor: getStatusColor(request.status) }
                ]}
              >
                {request.status.replace('_', ' ')}
              </Chip>
              <Chip
                mode="outlined"
                style={[
                  styles.priorityChip,
                  { borderColor: getPriorityColor(request.priority) }
                ]}
              >
                {request.priority}
              </Chip>
            </View>
          </View>

          <View style={styles.cardContent}>
            <Text style={styles.description} numberOfLines={2}>
              {request.description}
            </Text>
            <View style={styles.progressContainer}>
              <ProgressBar
                progress={request.completionTime ? request.completionTime / request.estimatedTime! : 0}
                color={theme.colors.primary}
                style={styles.progressBar}
              />
              <Text style={styles.progressText}>
                {request.completionTime || 0} / {request.estimatedTime || 0} min
              </Text>
            </View>
          </View>

          <View style={styles.cardFooter}>
            <View style={styles.footerLeft}>
              <Icon name="account-nurse" size={16} color="#666" />
              <Text style={styles.nurseText}>{request.nurse.name}</Text>
            </View>
            <Text style={styles.timestamp}>
              {format(new Date(request.createdAt), 'MMM dd, HH:mm')}
            </Text>
          </View>
        </TouchableOpacity>
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
            <Text style={styles.headerTitle}>Requests</Text>
            <IconButton
              icon="filter-variant"
              iconColor="#fff"
              size={24}
              onPress={() => setFilterMenuVisible(true)}
              style={styles.headerButton}
            />
          </View>
          <Searchbar
            placeholder="Search requests..."
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
          <RefreshControl refreshing={refreshing} onRefresh={fetchRequests} />
        }
      >
        <View style={styles.filterChips}>
          {selectedFilters.status.map((status) => (
            <Chip
              key={status}
              onClose={() => toggleFilter('status', status)}
              style={styles.activeFilter}
            >
              {status}
            </Chip>
          ))}
          {selectedFilters.priority.map((priority) => (
            <Chip
              key={priority}
              onClose={() => toggleFilter('priority', priority)}
              style={styles.activeFilter}
            >
              {priority}
            </Chip>
          ))}
        </View>

        {filteredRequests.map(renderRequestCard)}
      </ScrollView>

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContent}
        >
          {selectedRequest && (
            <ScrollView>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Request Details</Text>
                <IconButton
                  icon="close"
                  size={24}
                  onPress={() => setModalVisible(false)}
                />
              </View>

              <View style={styles.modalBody}>
                <Surface style={styles.detailsCard}>
                  <List.Section>
                    <List.Item
                      title="Patient"
                      description={selectedRequest.patient.name}
                      left={props => <List.Icon {...props} icon="account" />}
                    />
                    <List.Item
                      title="Room"
                      description={selectedRequest.patient.room}
                      left={props => <List.Icon {...props} icon="door" />}
                    />
                    <List.Item
                      title="Nurse"
                      description={selectedRequest.nurse.name}
                      left={props => <List.Icon {...props} icon="account-nurse" />}
                    />
                    <List.Item
                      title="Department"
                      description={selectedRequest.department}
                      left={props => <List.Icon {...props} icon="hospital-building" />}
                    />
                  </List.Section>

                  <Divider style={styles.divider} />

                  <View style={styles.statusSection}>
                    <Text style={styles.sectionTitle}>Status</Text>
                    <View style={styles.statusButtons}>
                      {['pending', 'assigned', 'in_progress', 'completed', 'cancelled'].map((status) => (
                        <Button
                          key={status}
                          mode={selectedRequest.status === status ? 'contained' : 'outlined'}
                          onPress={() => {/* Handle status update */}}
                          style={styles.statusButton}
                        >
                          {status.replace('_', ' ')}
                        </Button>
                      ))}
                    </View>
                  </View>

                  <Divider style={styles.divider} />

                  <View style={styles.timeSection}>
                    <Text style={styles.sectionTitle}>Time Tracking</Text>
                    <View style={styles.timeGrid}>
                      <View style={styles.timeItem}>
                        <Text style={styles.timeLabel}>Estimated</Text>
                        <Text style={styles.timeValue}>
                          {selectedRequest.estimatedTime} min
                        </Text>
                      </View>
                      <View style={styles.timeItem}>
                        <Text style={styles.timeLabel}>Elapsed</Text>
                        <Text style={styles.timeValue}>
                          {selectedRequest.completionTime} min
                        </Text>
                      </View>
                    </View>
                    <ProgressBar
                      progress={
                        selectedRequest.completionTime
                          ? selectedRequest.completionTime / selectedRequest.estimatedTime!
                          : 0
                      }
                      color={theme.colors.primary}
                      style={styles.modalProgressBar}
                    />
                  </View>
                </Surface>

                <Surface style={[styles.detailsCard, styles.descriptionCard]}>
                  <Text style={styles.sectionTitle}>Description</Text>
                  <Text style={styles.descriptionText}>
                    {selectedRequest.description}
                  </Text>
                </Surface>

                <View style={styles.modalActions}>
                  <Button
                    mode="contained"
                    onPress={() => {/* Handle reassign */}}
                    style={[styles.actionButton, { backgroundColor: '#2196F3' }]}
                    icon="account-switch"
                  >
                    Reassign
                  </Button>
                  <Button
                    mode="contained"
                    onPress={() => {/* Handle cancel */}}
                    style={[styles.actionButton, { backgroundColor: '#F44336' }]}
                    icon="close-circle"
                  >
                    Cancel
                  </Button>
                </View>
              </View>
            </ScrollView>
          )}
        </Modal>

        <Modal
          visible={filterMenuVisible}
          onDismiss={() => setFilterMenuVisible(false)}
          contentContainerStyle={styles.filterModal}
        >
          <View style={styles.filterHeader}>
            <Text style={styles.filterTitle}>Filters</Text>
            <IconButton
              icon="close"
              size={24}
              onPress={() => setFilterMenuVisible(false)}
            />
          </View>

          <ScrollView>
            <List.Section>
              <List.Subheader>Status</List.Subheader>
              <View style={styles.filterChipGroup}>
                {['pending', 'assigned', 'in_progress', 'completed', 'cancelled'].map((status) => (
                  <Chip
                    key={status}
                    selected={selectedFilters.status.includes(status)}
                    onPress={() => toggleFilter('status', status)}
                    style={styles.filterChip}
                  >
                    {status.replace('_', ' ')}
                  </Chip>
                ))}
              </View>

              <List.Subheader>Priority</List.Subheader>
              <View style={styles.filterChipGroup}>
                {['low', 'medium', 'high'].map((priority) => (
                  <Chip
                    key={priority}
                    selected={selectedFilters.priority.includes(priority)}
                    onPress={() => toggleFilter('priority', priority)}
                    style={styles.filterChip}
                  >
                    {priority}
                  </Chip>
                ))}
              </View>

              <List.Subheader>Department</List.Subheader>
              <View style={styles.filterChipGroup}>
                {['Cardiology', 'Neurology', 'Pediatrics', 'Oncology'].map((dept) => (
                  <Chip
                    key={dept}
                    selected={selectedFilters.department.includes(dept)}
                    onPress={() => toggleFilter('department', dept)}
                    style={styles.filterChip}
                  >
                    {dept}
                  </Chip>
                ))}
              </View>
            </List.Section>
          </ScrollView>

          <View style={styles.filterActions}>
            <Button
              mode="outlined"
              onPress={() => {
                setSelectedFilters({ status: [], priority: [], department: [] });
                applyFilters(searchQuery, { status: [], priority: [], department: [] });
              }}
            >
              Clear All
            </Button>
            <Button
              mode="contained"
              onPress={() => setFilterMenuVisible(false)}
            >
              Apply
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
  activeFilter: {
    marginRight: 8,
  },
  requestCard: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  patientName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  roomNumber: {
    fontSize: 14,
    color: '#666',
  },
  statusChip: {
    height: 28,
  },
  priorityChip: {
    height: 28,
  },
  cardContent: {
    padding: 16,
  },
  description: {
    fontSize: 16,
    marginBottom: 16,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'right',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nurseText: {
    fontSize: 14,
    color: '#666',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
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
  detailsCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  divider: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statusSection: {
    marginBottom: 16,
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusButton: {
    flex: 1,
    minWidth: '45%',
  },
  timeSection: {
    marginBottom: 16,
  },
  timeGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  timeItem: {
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 14,
    color: '#666',
  },
  timeValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
  modalProgressBar: {
    height: 8,
    borderRadius: 4,
  },
  descriptionCard: {
    marginBottom: 24,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  actionButton: {
    flex: 1,
  },
  filterModal: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    maxHeight: '80%',
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  filterChipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 8,
  },
  filterChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    gap: 16,
  },
});
