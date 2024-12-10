import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { TextInput, HelperText, Button, Card } from 'react-native-paper';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { nurseApi } from '../../services/api';
import { format } from 'date-fns';

const validationSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  room: Yup.string().required('Room number is required'),
});

export default function PatientRegistrationScreen() {
  const navigation = useNavigation<NavigationProp<any>>();

  const initialValues = {
    firstName: '',
    lastName: '',
    email: '',
    room: '',
  };

  const generatePassword = (firstName: string, lastName: string): string => {
    const today = format(new Date(), 'dd/MM/yy').replace(/\//g, '');
    return `${lastName.toLowerCase()}${firstName.toLowerCase()}${today}`;
  };

  const handleSubmit = async (values: any) => {
    try {
      const password = generatePassword(values.firstName, values.lastName);
      const registrationData = {
        ...values,
        password,
      };
      
      await nurseApi.registerPatient(registrationData);
      
      Alert.alert(
        'Success',
        'Patient registered successfully. The password has been generated using the format: lastNameFirstNameDDMMYY',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to register patient');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Register New Patient</Text>
      <Formik
        initialValues={initialValues}
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
        }) => {
          const generatedPassword = useMemo(
            () => values.firstName && values.lastName 
              ? generatePassword(values.firstName, values.lastName)
              : '',
            [values.firstName, values.lastName]
          );

          return (
            <View>
              <TextInput
                label="First Name"
                onChangeText={handleChange('firstName')}
                onBlur={handleBlur('firstName')}
                value={values.firstName}
                error={touched.firstName && errors.firstName ? true : false}
                style={styles.input}
                mode="outlined"
              />
              {touched.firstName && errors.firstName && (
                <HelperText type="error">{errors.firstName}</HelperText>
              )}

              <TextInput
                label="Last Name"
                onChangeText={handleChange('lastName')}
                onBlur={handleBlur('lastName')}
                value={values.lastName}
                error={touched.lastName && errors.lastName ? true : false}
                style={styles.input}
                mode="outlined"
              />
              {touched.lastName && errors.lastName && (
                <HelperText type="error">{errors.lastName}</HelperText>
              )}

              <TextInput
                label="Email"
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                value={values.email}
                error={touched.email && errors.email ? true : false}
                style={styles.input}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {touched.email && errors.email && (
                <HelperText type="error">{errors.email}</HelperText>
              )}

              <TextInput
                label="Room Number"
                onChangeText={handleChange('room')}
                onBlur={handleBlur('room')}
                value={values.room}
                error={touched.room && errors.room ? true : false}
                style={styles.input}
                mode="outlined"
                keyboardType="numeric"
              />
              {touched.room && errors.room && (
                <HelperText type="error">{errors.room}</HelperText>
              )}

              {values.firstName && values.lastName && (
                <Card style={styles.passwordCard}>
                  <Card.Content>
                    <Text style={styles.passwordTitle}>Generated Password</Text>
                    <Text style={styles.passwordText}>{generatedPassword}</Text>
                    <Text style={styles.passwordNote}>
                      The password is automatically generated using the format:{'\n'}
                      lastnamefirstnameDD/MM/YY
                    </Text>
                  </Card.Content>
                </Card>
              )}

              <Button
                mode="contained"
                onPress={handleSubmit}
                style={styles.button}
              >
                Register Patient
              </Button>
            </View>
          );
        }}
      </Formik>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 5,
  },
  button: {
    marginTop: 20,
    marginBottom: 10,
    paddingVertical: 8,
  },
  passwordCard: {
    marginTop: 20,
    marginBottom: 10,
    backgroundColor: '#f5f5f5',
  },
  passwordTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  passwordText: {
    fontSize: 18,
    color: '#2196F3',
    marginBottom: 8,
  },
  passwordNote: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
});
