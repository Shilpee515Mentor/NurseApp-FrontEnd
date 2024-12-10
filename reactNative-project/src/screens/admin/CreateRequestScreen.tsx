import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import {
  Text,
  Surface,
  IconButton,
  useTheme,
  TextInput,
  Button,
  SegmentedButtons,
  Menu,
  Divider,
  HelperText,
} from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { departmentApi, userApi } from '../../services/api';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeInDown } from 'react-native-reanimated';

const validationSchema = Yup.object().shape({
  patient: Yup.string().required('Patient is required'),
  nurse: Yup.string().required('Nurse is required'),
  priority: Yup.string().oneOf(['low', 'medium', 'high']).required('Priority is required'),
  description: Yup.string().required('Description is required').min(10, 'Description must be at least 10 characters'),
  department: Yup.string().required('Department is required'),
});

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface Department {
  id: string;
  name: string;
}

export default function CreateRequestScreen() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [patients, setPatients] = useState<User[]>([]);
  const [nurses, setNurses] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<NavigationProp<any>>();
  const theme = useTheme();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [deptResponse, patientsResponse, nursesResponse] = await Promise.all([
        departmentApi.getAll(),
        userApi.getUsersByRole('patient'),
        userApi.getUsersByRole('nurse', 'approved'),
      ]);

      setDepartments(deptResponse.departments);
      setPatients(patientsResponse);
      setNurses(nursesResponse);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch required data');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      const requestData = {
        ...values,
        department: departments.find(d => d.id === values.department)?.name
      };
      await userApi.createRequest(requestData);
      Alert.alert('Success', 'Request created successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to create request');
    } finally {
      setLoading(false);
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
            <Text style={styles.headerTitle}>Create Request</Text>
            <IconButton
              icon="close"
              iconColor="#fff"
              size={24}
              onPress={() => navigation.goBack()}
              style={styles.headerButton}
            />
          </View>
        </BlurView>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <Animated.View
          entering={FadeInDown}
          style={styles.formContainer}
        >
          <Surface style={styles.formSurface}>
            <Formik
              initialValues={{
                patient: '',
                nurse: '',
                priority: '',
                description: '',
                department: '',
                showPatientMenu: false,
                showNurseMenu: false,
                showDepartmentMenu: false,
              }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                values,
                errors,
                touched,
                setFieldValue,
              }) => (
                <View>
                  <Text style={styles.sectionTitle}>Request Details</Text>
                  <Divider style={styles.divider} />

                  {/* Patient Selection */}
                  <Menu
                    visible={values.showPatientMenu}
                    onDismiss={() => setFieldValue('showPatientMenu', false)}
                    anchor={
                      <TextInput
                        mode="outlined"
                        label="Select Patient"
                        value={patients.find(p => p._id === values.patient)?.firstName || ''}
                        onFocus={() => setFieldValue('showPatientMenu', true)}
                        error={touched.patient && !!errors.patient}
                        right={<TextInput.Icon icon="chevron-down" />}
                        style={styles.input}
                      />
                    }
                  >
                    {patients.map((patient) => (
                      <Menu.Item
                        key={patient._id}
                        onPress={() => {
                          setFieldValue('patient', patient._id);
                          setFieldValue('showPatientMenu', false);
                        }}
                        title={`${patient.firstName} ${patient.lastName}`}
                      />
                    ))}
                  </Menu>
                  <HelperText type="error" visible={touched.patient && !!errors.patient}>
                    {errors.patient}
                  </HelperText>

                  {/* Nurse Selection */}
                  <Menu
                    visible={values.showNurseMenu}
                    onDismiss={() => setFieldValue('showNurseMenu', false)}
                    anchor={
                      <TextInput
                        mode="outlined"
                        label="Select Nurse"
                        value={nurses.find(n => n._id === values.nurse)?.firstName || ''}
                        onFocus={() => setFieldValue('showNurseMenu', true)}
                        error={touched.nurse && !!errors.nurse}
                        right={<TextInput.Icon icon="chevron-down" />}
                        style={styles.input}
                      />
                    }
                  >
                    {nurses.map((nurse) => (
                      <Menu.Item
                        key={nurse._id}
                        onPress={() => {
                          setFieldValue('nurse', nurse._id);
                          setFieldValue('showNurseMenu', false);
                        }}
                        title={`${nurse.firstName} ${nurse.lastName}`}
                      />
                    ))}
                  </Menu>
                  <HelperText type="error" visible={touched.nurse && !!errors.nurse}>
                    {errors.nurse}
                  </HelperText>

                  {/* Priority Selection */}
                  <Text style={styles.label}>Priority</Text>
                  <SegmentedButtons
                    value={values.priority}
                    onValueChange={value => setFieldValue('priority', value)}
                    buttons={[
                      { value: 'low', label: 'Low' },
                      { value: 'medium', label: 'Medium' },
                      { value: 'high', label: 'High' },
                    ]}
                    style={styles.segmentedButtons}
                  />
                  <HelperText type="error" visible={touched.priority && !!errors.priority}>
                    {errors.priority}
                  </HelperText>

                  {/* Department Selection */}
                  <Menu
                    visible={values.showDepartmentMenu}
                    onDismiss={() => setFieldValue('showDepartmentMenu', false)}
                    anchor={
                      <TextInput
                        mode="outlined"
                        label="Select Department"
                        value={departments.find(d => d.id === values.department)?.name || ''}
                        onFocus={() => setFieldValue('showDepartmentMenu', true)}
                        error={touched.department && !!errors.department}
                        right={<TextInput.Icon icon="chevron-down" />}
                        style={styles.input}
                      />
                    }
                  >
                    {departments.map((department) => (
                      <Menu.Item
                        key={department.id}
                        onPress={() => {
                          setFieldValue('department', department.id);
                          setFieldValue('showDepartmentMenu', false);
                        }}
                        title={department.name}
                      />
                    ))}
                  </Menu>
                  <HelperText type="error" visible={touched.department && !!errors.department}>
                    {errors.department}
                  </HelperText>

                  {/* Description Input */}
                  <TextInput
                    mode="outlined"
                    label="Description"
                    value={values.description}
                    onChangeText={handleChange('description')}
                    onBlur={handleBlur('description')}
                    error={touched.description && !!errors.description}
                    multiline
                    numberOfLines={4}
                    style={styles.input}
                  />
                  <HelperText type="error" visible={touched.description && !!errors.description}>
                    {errors.description}
                  </HelperText>

                  <Button
                    mode="contained"
                    onPress={() => handleSubmit()}
                    loading={loading}
                    style={styles.submitButton}
                    icon="check"
                  >
                    Create Request
                  </Button>
                </View>
              )}
            </Formik>
          </Surface>
        </Animated.View>
      </ScrollView>
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
  },
  formContainer: {
    padding: 16,
  },
  formSurface: {
    padding: 20,
    borderRadius: 12,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  divider: {
    marginVertical: 16,
  },
  input: {
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#666',
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 24,
    paddingVertical: 8,
    borderRadius: 8,
  },
});
