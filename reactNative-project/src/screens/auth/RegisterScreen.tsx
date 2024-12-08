import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { TextInput, HelperText, Button } from 'react-native-paper';

const validationSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
  role: Yup.string()
    .oneOf(['patient', 'nurse'], 'Invalid role')
    .required('Role is required'),
  department: Yup.string().when('role', {
    is: 'nurse',
    then: () => Yup.string().required('Department is required'),
    otherwise: () => Yup.string().notRequired()
  }),
  room: Yup.string().when('role', {
    is: 'patient',
    then: () => Yup.string().required('Room is required'),
    otherwise: () => Yup.string().notRequired()
  })
});

const roles = [
  { label: 'Patient', value: 'patient' },
  { label: 'Nurse', value: 'nurse' },
];

export default function RegisterScreen() {
  const { register } = useAuth();
  const navigation = useNavigation<NavigationProp<any>>();

  const initialValues = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    room: '',
    role: 'patient',
  };

  const handleSubmit = async (values: any) => {
    try {
      const response: any = await register({
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
        role: values.role,
        ...(values.role === 'nurse' ? { department: values.department } : {}),
        ...(values.role === 'patient' ? { room: values.room } : {}),
      });
      
      if (response.error) {
        Alert.alert('Error', response.error);
      } else {
        Alert.alert(
          'Success',
          values.role === 'nurse'
            ? 'Registration successful! Please wait for admin approval.'
            : 'Registration successful! You can now login.',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Registration failed');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
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
          setFieldValue,
        }) => (
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
              label="Password"
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              value={values.password}
              error={touched.password && errors.password ? true : false}
              style={styles.input}
              mode="outlined"
              secureTextEntry
            />
            {touched.password && errors.password && (
              <HelperText type="error">{errors.password}</HelperText>
            )}

            <TextInput
              label="Confirm Password"
              onChangeText={handleChange('confirmPassword')}
              onBlur={handleBlur('confirmPassword')}
              value={values.confirmPassword}
              error={touched.confirmPassword && errors.confirmPassword ? true : false}
              style={styles.input}
              mode="outlined"
              secureTextEntry
            />
            {touched.confirmPassword && errors.confirmPassword && (
              <HelperText type="error">{errors.confirmPassword}</HelperText>
            )}

            <TextInput
              label="Role"
              value={values.role === 'patient' ? 'Patient' : 'Nurse'}
              mode="outlined"
              style={styles.input}
              render={({ style, ...props }) => (
                <TouchableOpacity
                  style={[style, styles.dropdownButton]}
                  onPress={() => {
                    const newRole = values.role === 'patient' ? 'nurse' : 'patient';
                    setFieldValue('role', newRole);
                    setFieldValue('department', '');
                    setFieldValue('room', '');
                  }}
                >
                  <Text>{props.value}</Text>
                </TouchableOpacity>
              )}
            />

            {values.role === 'nurse' && (
              <TextInput
                label="Department"
                onChangeText={handleChange('department')}
                onBlur={handleBlur('department')}
                value={values.department}
                error={touched.department && errors.department ? true : false}
                style={styles.input}
                mode="outlined"
              />
            )}
            {touched.department && errors.department && (
              <HelperText type="error">{errors.department}</HelperText>
            )}

            {values.role === 'patient' && (
              <TextInput
                label="Room"
                onChangeText={handleChange('room')}
                onBlur={handleBlur('room')}
                value={values.room}
                error={touched.room && errors.room ? true : false}
                style={styles.input}
                mode="outlined"
              />
            )}
            {touched.room && errors.room && (
              <HelperText type="error">{errors.room}</HelperText>
            )}

            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.button}
            >
              Register
            </Button>

            <TouchableOpacity
              style={styles.loginLink}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginText}>
                Already have an account? Login here
              </Text>
            </TouchableOpacity>
          </View>
        )}
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
  loginLink: {
    alignItems: 'center',
    marginTop: 15,
  },
  loginText: {
    color: '#007AFF',
  },
  dropdownButton: {
    justifyContent: 'center',
    paddingHorizontal: 14,
    height: 56,
  },
});
