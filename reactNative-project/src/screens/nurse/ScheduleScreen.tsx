import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Card, Text, useTheme } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { shiftApi, Shift } from '../../services/api';

export const ScheduleScreen = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  const fetchShifts = async () => {
    try {
      console.log('Current user:', user);
      if (user?.id) {
        console.log('Attempting to fetch shifts for nurse:', user.id);
        const data = await shiftApi.getNurseShifts(user.id);
        console.log('API Response for shifts:', data);
        if (Array.isArray(data)) {
          console.log('Number of shifts received:', data.length);
          setShifts(data);
        } else {
          console.error('Unexpected data format:', data);
        }
      } else {
        console.error('No user ID available');
      }
    } catch (error) {
      console.error('Error fetching shifts:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    console.log('useEffect triggered with user ID:', user?.id);
    fetchShifts();
  }, [user?.id]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchShifts();
  }, [user?.id]);

  const markedDates = shifts.reduce((acc, shift) => {
    acc[shift.date] = { marked: true, dotColor: theme.colors.primary };
    return acc;
  }, {} as { [key: string]: any });

  const selectedDateShifts = shifts.filter(shift => {
    console.log('Filtering shifts for date:', selectedDate);
    console.log('Current shift date:', shift.date);
    return shift.date === selectedDate;
  });

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Calendar
        onDayPress={day => {
          console.log('Day pressed:', day);
          setSelectedDate(day.dateString);
        }}
        markedDates={{
          ...markedDates,
          [selectedDate]: {
            selected: true,
            marked: markedDates[selectedDate]?.marked,
            dotColor: theme.colors.primary,
          },
        }}
        theme={{
          selectedDayBackgroundColor: theme.colors.primary,
          todayTextColor: theme.colors.primary,
          arrowColor: theme.colors.primary,
        }}
      />

      <View style={styles.shiftsContainer}>
        {selectedDate ? (
          selectedDateShifts.length > 0 ? (
            selectedDateShifts.map(shift => (
              <Card key={shift._id} style={styles.shiftCard}>
                <Card.Content>
                  <Text variant="titleMedium">Department: {shift.department}</Text>
                  <Text variant="bodyMedium">
                    Time: {shift.startTime} - {shift.endTime}
                  </Text>
                  {shift.notes && (
                    <Text variant="bodyMedium">Notes: {shift.notes}</Text>
                  )}
                </Card.Content>
              </Card>
            ))
          ) : (
            <Text style={styles.noShifts}>No shifts scheduled for this date</Text>
          )
        ) : (
          <Text style={styles.selectDate}>Select a date to view shifts</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  shiftsContainer: {
    padding: 16,
  },
  shiftCard: {
    marginBottom: 12,
  },
  noShifts: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  selectDate: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
});

export default ScheduleScreen;
