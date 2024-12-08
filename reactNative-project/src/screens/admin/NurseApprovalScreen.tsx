import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import { userApi, User } from '../../services/api';
import { format } from 'date-fns';

export default function NurseApprovalScreen() {
  const [pendingNurses, setPendingNurses] = useState<User[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

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
        `Nurse registration ${status.toLowerCase()}`,
        [{ text: 'OK', onPress: fetchPendingNurses }]
      );
    } catch (error) {
      Alert.alert('Error', `Failed to ${status.toLowerCase()} nurse registration`);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: User }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Title>{`${item.firstName} ${item.lastName}`}</Title>
        <Paragraph>Email: {item.email}</Paragraph>
        <Paragraph>Department: {item.department}</Paragraph>
        <Paragraph>
          Registered: {format(new Date(item.createdAt), 'MMM dd, yyyy')}
        </Paragraph>
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={() => handleApproval(item._id, 'approved')}
            style={[styles.button, styles.approveButton]}
            disabled={loading}
          >
            Approve
          </Button>
          <Button
            mode="contained"
            onPress={() => handleApproval(item._id, 'rejected')}
            style={[styles.button, styles.rejectButton]}
            disabled={loading}
          >
            Reject
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pending Nurse Approvals</Text>
      <FlatList
        data={pendingNurses}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No pending nurse registrations</Text>
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    margin: 20,
    textAlign: 'center',
  },
  card: {
    margin: 10,
    elevation: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#f44336',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
  listContent: {
    flexGrow: 1,
  },
});
