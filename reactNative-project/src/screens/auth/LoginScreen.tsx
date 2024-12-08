import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { TextInput } from 'react-native-paper';

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

export default function LoginScreen() {
  const { login } = useAuth();
  const navigation = useNavigation<NavigationProp<any>>();

  const initialValues = {
    email: '',
    password: '',
  };

  const handleSubmit = async (values: any) => {
    try {
      await login(values.email, values.password);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Invalid credentials');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
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
          isValid,
          dirty,
        }) => (
          <View>
            <TextInput
              style={styles.input}
              label="Email"
              value={values.email}
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              error={touched.email && errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              mode="outlined"
            />
            {touched.email && errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}

            <TextInput
              style={styles.input}
              label="Password"
              value={values.password}
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              error={touched.password && errors.password}
              secureTextEntry
              mode="outlined"
            />
            {touched.password && errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}

            <TouchableOpacity
              style={[
                styles.button,
                (!isValid || !dirty) && styles.buttonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!isValid || !dirty}
            >
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
          </View>
        )}
      </Formik>

      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => navigation.navigate('Register')}
      >
        <Text style={styles.linkText}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
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
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginVertical: 20,
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    padding: 10,
  },
  linkText: {
    color: '#007AFF',
    textAlign: 'center',
    fontSize: 14,
  },
  errorText: {
    color: '#ff0000',
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 5,
  },
});
