import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  List,
  Card,
  Text,
  Badge,
  useTheme,
  Button,
  ActivityIndicator,
} from 'react-native-paper';
import { nurseApi, Request, User } from '../../services/api';
import { format } from 'date-fns';

interface PatientWithRequests {
  patient: User;
  requests: Request[];
}

const priorityColors = {
  low: '#4CAF50',
  medium: '#FF9800',
  high: '#f44336',
};

const statusColors = {
  pending: '#757575',
  assigned: '#2196F3',
  in_progress: '#FF9800',
  completed: '#4CAF50',
  cancelled: '#f44336',
};

export default function MyPatientsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [patientsData, setPatientsData] = useState<PatientWithRequests[]>([]);
  const theme = useTheme();

  const fetchPatients = async () => {
    try {
      const data = await nurseApi.getMyPatients();
      setPatientsData(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch patients data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPatients();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleStatusUpdate = async (requestId: string, newStatus: string) => {
    try {
      await nurseApi.updateRequestStatus(requestId, newStatus);
      await fetchPatients(); // Refresh the data
      Alert.alert('Success', 'Request status updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update request status');
    }
  };

  const renderRequestItem = (request: Request) => (
    <Card style={styles.requestCard} key={request._id}>
      <Card.Content>
        <View style={styles.requestHeader}>
          <Badge
            style={[
              styles.priorityBadge,
              { backgroundColor: priorityColors[request.priority] },
            ]}
          >
            {request.priority}
          </Badge>
          <Badge
            style={[
              styles.statusBadge,
              { backgroundColor: statusColors[request.status] },
            ]}
          >
            {request.status}
          </Badge>
        </View>

        <Text style={styles.description}>{request.description}</Text>
        <Text style={styles.timestamp}>
          Created: {format(new Date(request.createdAt), 'MMM dd, yyyy HH:mm')}
        </Text>

        <View style={styles.actionButtons}>
          {request.status === 'assigned' && (
            <Button
              mode="contained"
              onPress={() => handleStatusUpdate(request._id, 'in_progress')}
              style={styles.actionButton}
            >
              Start
            </Button>
          )}
          {request.status === 'in_progress' && (
            <Button
              mode="contained"
              onPress={() => handleStatusUpdate(request._id, 'completed')}
              style={styles.actionButton}
            >
              Complete
            </Button>
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
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {patientsData.length === 0 ? (
        <Text style={styles.emptyText}>No patients assigned yet</Text>
      ) : (
        patientsData.map((patientData) => (
          <List.Accordion
            key={patientData.patient._id}
            title={`${patientData.patient.firstName} ${patientData.patient.lastName}`}
            description={`Room: ${patientData.patient.room}`}
            style={styles.accordion}
          >
            {patientData.requests.length === 0 ? (
              <Text style={styles.noRequests}>No requests from this patient</Text>
            ) : (
              patientData.requests.map((request) => renderRequestItem(request))
            )}
          </List.Accordion>
        ))
      )}
    </ScrollView>
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
  accordion: {
    backgroundColor: '#fff',
    marginBottom: 1,
  },
  requestCard: {
    margin: 8,
    elevation: 2,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priorityBadge: {
    alignSelf: 'flex-start',
  },
  statusBadge: {
    alignSelf: 'flex-start',
  },
  description: {
    fontSize: 16,
    marginVertical: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  actionButton: {
    marginLeft: 8,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
  noRequests: {
    textAlign: 'center',
    padding: 16,
    color: '#666',
    fontStyle: 'italic',
  },
});
