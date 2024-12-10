import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {
  Text,
  Surface,
  IconButton,
  useTheme,
  Searchbar,
  Chip,
  Avatar,
  FAB,
  Portal,
  Modal,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';

interface PatientRecord {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  room: string;
  status: string;
  lastVisit: string;
  diagnosis: string[];
  avatar?: string;
}

export default function PatientRecordsScreen() {
  const [records, setRecords] = useState<PatientRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<PatientRecord | null>(null);
  const theme = useTheme();

  const filters = ['Active', 'Discharged', 'Critical', 'Regular', 'Emergency'];

  const fetchRecords = async () => {
    // Implement your API call here
    // For now, using mock data
    const mockRecords: PatientRecord[] = [
      {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        age: 45,
        gender: 'Male',
        room: '201',
        status: 'Active',
        lastVisit: '2024-03-15',
        diagnosis: ['Hypertension', 'Diabetes'],
      },
      // Add more mock records...
    ];
    setRecords(mockRecords);
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRecords();
    setRefreshing(false);
  };

  const toggleFilter = (filter: string) => {
    setSelectedFilters(prev =>
      prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const filteredRecords = records.filter(record => {
    const matchesSearch = (
      record.firstName.toLowerCase() +
      record.lastName.toLowerCase() +
      record.room
    ).includes(searchQuery.toLowerCase());

    const matchesFilters = selectedFilters.length === 0 ||
      selectedFilters.includes(record.status);

    return matchesSearch && matchesFilters;
  });

  const renderPatientCard = (record: PatientRecord) => (
    <Animated.View
      entering={FadeInDown}
      layout={Layout.springify()}
      key={record.id}
    >
      <Surface style={styles.patientCard}>
        <TouchableOpacity
          onPress={() => {
            setSelectedRecord(record);
            setModalVisible(true);
          }}
        >
          <View style={styles.cardHeader}>
            <View style={styles.patientInfo}>
              <Avatar.Image
                size={50}
                source={
                  record.avatar
                    ? { uri: record.avatar }
                    : require('../../../assets/default-avatar.png')
                }
              />
              <View style={styles.nameContainer}>
                <Text style={styles.patientName}>
                  {record.firstName} {record.lastName}
                </Text>
                <Text style={styles.patientDetails}>
                  {record.age} years • Room {record.room}
                </Text>
              </View>
            </View>
            <Chip
              mode="outlined"
              style={[
                styles.statusChip,
                { borderColor: theme.colors.primary }
              ]}
            >
              {record.status}
            </Chip>
          </View>

          <View style={styles.diagnosisContainer}>
            {record.diagnosis.map((diagnosis, index) => (
              <Chip
                key={index}
                style={styles.diagnosisChip}
                textStyle={styles.diagnosisText}
              >
                {diagnosis}
              </Chip>
            ))}
          </View>

          <View style={styles.cardFooter}>
            <Text style={styles.lastVisit}>
              Last visit: {new Date(record.lastVisit).toLocaleDateString()}
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
            <Text style={styles.headerTitle}>Patient Records</Text>
            <IconButton
              icon="plus"
              iconColor="#fff"
              size={24}
              onPress={() => {/* Handle new patient */}}
              style={styles.headerButton}
            />
          </View>
          <Searchbar
            placeholder="Search patients..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            inputStyle={styles.searchInput}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtersContainer}
          >
            {filters.map((filter) => (
              <Chip
                key={filter}
                selected={selectedFilters.includes(filter)}
                onPress={() => toggleFilter(filter)}
                style={styles.filterChip}
                showSelectedOverlay
              >
                {filter}
              </Chip>
            ))}
          </ScrollView>
        </BlurView>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredRecords.map(renderPatientCard)}
      </ScrollView>

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContent}
        >
          {selectedRecord && (
            <View>
              <Text style={styles.modalTitle}>Patient Details</Text>
              {/* Add detailed patient information here */}
            </View>
          )}
        </Modal>
      </Portal>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {/* Handle new patient */}}
      />
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
  filtersContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  filterChip: {
    marginRight: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  patientCard: {
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
  patientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameContainer: {
    marginLeft: 12,
  },
  patientName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  patientDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  statusChip: {
    height: 28,
  },
  diagnosisContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 8,
  },
  diagnosisChip: {
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
  },
  diagnosisText: {
    fontSize: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  lastVisit: {
    fontSize: 14,
    color: '#666',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});