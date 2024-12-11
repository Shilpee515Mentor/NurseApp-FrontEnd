import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Platform } from 'react-native';
import { Button, Card, TextInput, Text, useTheme, Portal, Modal } from 'react-native-paper';
import { Calendar } from 'react-native-calendars';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { shiftApi, userApi, departmentApi, CreateShiftData, User } from '../../services/api';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ManageSchedules'>;

export const ManageSchedulesScreen = ({ route, navigation }: Props) => {
  const theme = useTheme();
  const selectedNurse = route.params?.nurse;
  const [nurses, setNurses] = useState<User[]>([]);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [existingShift, setExistingShift] = useState<any>(null);
  const [showStartTime, setShowStartTime] = useState(false);
  const [showEndTime, setShowEndTime] = useState(false);
  
  const [shiftForm, setShiftForm] = useState<CreateShiftData>({
    nurse: selectedNurse?._id || '',
    date: '',
    startTime: '',
    endTime: '',
    department: selectedNurse?.department || '',
    notes: '',
  });

  useEffect(() => {
    if (selectedNurse) {
      setModalVisible(true);
    }
  }, [selectedNurse]);

  useEffect(() => {
    fetchNurses();
    fetchDepartments();
  }, []);

  const fetchNurses = async () => {
    try {
      const data = await userApi.getUsersByRole('nurse', 'approved');
      setNurses(data);
    } catch (error) {
      console.error('Error fetching nurses:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const data = await departmentApi.getAll();
      setDepartments(data.departments);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const checkExistingShift = async (date: string, nurseId: string) => {
    try {
      const shifts = await shiftApi.getDepartmentShifts(shiftForm.department, date, date);
      const existingShift = shifts.find(shift => shift.nurse === nurseId && shift.date === date);
      if (existingShift) {
        setExistingShift(existingShift);
        setShiftForm({
          ...shiftForm,
          startTime: existingShift.startTime,
          endTime: existingShift.endTime,
          department: existingShift.department,
          notes: existingShift.notes || '',
        });
      } else {
        setExistingShift(null);
      }
    } catch (error) {
      console.error('Error checking existing shift:', error);
    }
  };

  const handleSaveShift = async () => {
    try {
      if (existingShift) {
        await shiftApi.updateShift(existingShift._id, shiftForm);
      } else {
        await shiftApi.createShift(shiftForm);
      }
      setModalVisible(false);
      // Reset form
      setShiftForm({
        nurse: selectedNurse?._id || '',
        date: '',
        startTime: '',
        endTime: '',
        department: selectedNurse?.department || '',
        notes: '',
      });
      setExistingShift(null);
      // Navigate back if we came from ManageNursesScreen
      if (selectedNurse) {
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error saving shift:', error);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  return (
    <ScrollView style={styles.container}>
      {!selectedNurse && (
        <Button
          mode="contained"
          onPress={() => setModalVisible(true)}
          style={styles.addButton}
        >
          Add New Shift
        </Button>
      )}

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => {
            setModalVisible(false);
            if (selectedNurse) {
              navigation.goBack();
            }
          }}
          contentContainerStyle={styles.modalContainer}
        >
          <ScrollView>
            <Text variant="titleLarge" style={styles.modalTitle}>
              {existingShift ? 'Update Shift' : 'Create New Shift'}
            </Text>

            {!selectedNurse && (
              <Picker
                selectedValue={shiftForm.nurse}
                onValueChange={(value) =>
                  setShiftForm({ ...shiftForm, nurse: value })
                }
              >
                <Picker.Item label="Select Nurse" value="" />
                {nurses.map((nurse) => (
                  <Picker.Item
                    key={nurse._id}
                    label={`${nurse.firstName} ${nurse.lastName}`}
                    value={nurse._id}
                  />
                ))}
              </Picker>
            )}

            <Calendar
              onDayPress={day => {
                setSelectedDate(day.dateString);
                setShiftForm({ ...shiftForm, date: day.dateString });
                checkExistingShift(day.dateString, shiftForm.nurse || selectedNurse?._id);
              }}
              markedDates={{
                [selectedDate]: {
                  selected: true,
                  selectedColor: theme.colors.primary,
                },
              }}
              minDate={new Date().toISOString().split('T')[0]}
            />

            <Button
              mode="outlined"
              onPress={() => setShowStartTime(true)}
              style={styles.input}
            >
              {shiftForm.startTime || 'Select Start Time'}
            </Button>

            <Button
              mode="outlined"
              onPress={() => setShowEndTime(true)}
              style={styles.input}
            >
              {shiftForm.endTime || 'Select End Time'}
            </Button>

            {showStartTime && (
              <DateTimePicker
                value={shiftForm.startTime ? new Date(`2000-01-01T${shiftForm.startTime}`) : new Date()}
                mode="time"
                is24Hour={true}
                onChange={(event, date) => {
                  setShowStartTime(false);
                  if (event.type === 'set' && date) {
                    setShiftForm({ ...shiftForm, startTime: formatTime(date) });
                  }
                }}
              />
            )}

            {showEndTime && (
              <DateTimePicker
                value={shiftForm.endTime ? new Date(`2000-01-01T${shiftForm.endTime}`) : new Date()}
                mode="time"
                is24Hour={true}
                onChange={(event, date) => {
                  setShowEndTime(false);
                  if (event.type === 'set' && date) {
                    setShiftForm({ ...shiftForm, endTime: formatTime(date) });
                  }
                }}
              />
            )}

            <Picker
              selectedValue={shiftForm.department}
              onValueChange={(value) =>
                setShiftForm({ ...shiftForm, department: value })
              }
              enabled={!selectedNurse}
            >
              <Picker.Item label="Select Department" value="" />
              {departments.map((dept) => (
                <Picker.Item
                  key={dept.id}
                  label={dept.name}
                  value={dept.id}
                />
              ))}
            </Picker>

            <TextInput
              label="Notes"
              value={shiftForm.notes}
              onChangeText={(text) =>
                setShiftForm({ ...shiftForm, notes: text })
              }
              multiline
              style={styles.input}
            />

            <Button
              mode="contained"
              onPress={handleSaveShift}
              style={styles.submitButton}
            >
              {existingShift ? 'Update Shift' : 'Create Shift'}
            </Button>
          </ScrollView>
        </Modal>
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  addButton: {
    margin: 16,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    maxHeight: '80%',
    borderRadius: 8,
  },
  modalTitle: {
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 12,
  },
  submitButton: {
    marginTop: 16,
  },
});

export default ManageSchedulesScreen;
