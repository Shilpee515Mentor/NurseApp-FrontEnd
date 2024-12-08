import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Chip,
  Searchbar,
  Menu,
  Divider,
  List,
  Badge,
  Button,
  ActivityIndicator,
} from 'react-native-paper';
import { format } from 'date-fns';
import { Request, userApi } from '../../services/api';

interface FilterState {
  status: string | null;
  priority: string | null;
  department: string | null;
}

const statusColors = {
  pending: '#757575',
  assigned: '#2196F3',
  in_progress: '#FF9800',
  completed: '#4CAF50',
  cancelled: '#f44336',
};

const priorityColors = {
  low: '#4CAF50',
  medium: '#FF9800',
  high: '#f44336',
};

export default function RequestManagementScreen() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    status: null,
    priority: null,
    department: null,
  });
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const [showDepartmentMenu, setShowDepartmentMenu] = useState(false);

  const fetchRequests = async () => {
    try {
      const response = await userApi.getAllRequests(filters);
      setRequests(response.requests);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filters]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRequests();
    setRefreshing(false);
  }, []);

  const filteredRequests = requests.filter((request) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      request.patient.firstName.toLowerCase().includes(searchLower) ||
      request.patient.lastName.toLowerCase().includes(searchLower) ||
      request.description.toLowerCase().includes(searchLower) ||
      request.department.toLowerCase().includes(searchLower);

    return matchesSearch;
  });

  const clearFilters = () => {
    setFilters({
      status: null,
      priority: null,
      department: null,
    });
  };

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <Chip
        mode="outlined"
        onPress={() => setShowStatusMenu(true)}
        style={styles.filterChip}
      >
        Status: {filters.status || 'All'}
      </Chip>
      <Menu
        visible={showStatusMenu}
        onDismiss={() => setShowStatusMenu(false)}
        anchor={<View />}
      >
        <Menu.Item
          onPress={() => {
            setFilters({ ...filters, status: null });
            setShowStatusMenu(false);
          }}
          title="All"
        />
        {Object.keys(statusColors).map((status) => (
          <Menu.Item
            key={status}
            onPress={() => {
              setFilters({ ...filters, status });
              setShowStatusMenu(false);
            }}
            title={status.charAt(0).toUpperCase() + status.slice(1)}
          />
        ))}
      </Menu>

      <Chip
        mode="outlined"
        onPress={() => setShowPriorityMenu(true)}
        style={styles.filterChip}
      >
        Priority: {filters.priority || 'All'}
      </Chip>
      <Menu
        visible={showPriorityMenu}
        onDismiss={() => setShowPriorityMenu(false)}
        anchor={<View />}
      >
        <Menu.Item
          onPress={() => {
            setFilters({ ...filters, priority: null });
            setShowPriorityMenu(false);
          }}
          title="All"
        />
        {Object.keys(priorityColors).map((priority) => (
          <Menu.Item
            key={priority}
            onPress={() => {
              setFilters({ ...filters, priority });
              setShowPriorityMenu(false);
            }}
            title={priority.charAt(0).toUpperCase() + priority.slice(1)}
          />
        ))}
      </Menu>

      {Object.values(filters).some((value) => value !== null) && (
        <Chip icon="close" onPress={clearFilters}>
          Clear Filters
        </Chip>
      )}
    </View>
  );

  const renderRequest = (request: Request) => (
    <Card key={request._id} style={styles.requestCard}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Title>
            {request.patient.firstName} {request.patient.lastName}
          </Title>
          <Badge
            style={[
              styles.statusBadge,
              { backgroundColor: statusColors[request.status] },
            ]}
          >
            {request.status}
          </Badge>
        </View>

        <View style={styles.cardSubHeader}>
          <Badge
            style={[
              styles.priorityBadge,
              { backgroundColor: priorityColors[request.priority] },
            ]}
          >
            {request.priority}
          </Badge>
          <Paragraph>{request.department}</Paragraph>
        </View>

        <Divider style={styles.divider} />

        <Paragraph>{request.description}</Paragraph>

        <View style={styles.cardFooter}>
          <Paragraph style={styles.timestamp}>
            Created: {format(new Date(request.createdAt), 'MMM dd, yyyy HH:mm')}
          </Paragraph>
          {request.nurse && (
            <Paragraph>
              Nurse: {request.nurse.firstName} {request.nurse.lastName}
            </Paragraph>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search requests..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      {renderFilters()}

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredRequests.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Paragraph style={styles.emptyText}>No requests found</Paragraph>
            </Card.Content>
          </Card>
        ) : (
          filteredRequests.map(renderRequest)
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    margin: 8,
    elevation: 4,
  },
  filtersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    gap: 8,
  },
  filterChip: {
    marginRight: 8,
  },
  requestCard: {
    margin: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardSubHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
  },
  priorityBadge: {
    alignSelf: 'flex-start',
  },
  divider: {
    marginVertical: 12,
  },
  cardFooter: {
    marginTop: 12,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  emptyCard: {
    margin: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
  },
});
