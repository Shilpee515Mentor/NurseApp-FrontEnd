import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import {
  Text,
  TextInput,
  Button,
  Surface,
  useTheme,
  SegmentedButtons,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  FadeInDown,
  FadeInUp,
  Layout,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Department, departmentApi } from '../../services/api';
import { Picker } from '@react-native-picker/picker';

const { width } = Dimensions.get('window');

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
    otherwise: () => Yup.string().notRequired(),
  }),
  room: Yup.string().when('role', {
    is: 'patient',
    then: () => Yup.string().required('Room is required'),
    otherwise: () => Yup.string().notRequired(),
  }),
});

export default function RegisterScreen() {
  const { register } = useAuth();
  const navigation = useNavigation<NavigationProp<any>>();
  const theme = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([])

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await departmentApi.getAll();
        setDepartments(response.departments);
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };

    fetchDepartments();
  }, []);

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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#1a237e', '#0d47a1']}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          entering={FadeInDown.delay(200)}
          style={styles.headerContainer}
        >
          <Surface style={styles.logoContainer}>
            <Icon name="account-plus" size={60} color={theme.colors.primary} />
          </Surface>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join our healthcare community</Text>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(400)}
          style={styles.formContainer}
          layout={Layout.springify()}
        >
          <BlurView intensity={80} style={styles.formBlur}>
            <Formik
              initialValues={{
                firstName: '',
                lastName: '',
                email: '',
                password: '',
                confirmPassword: '',
                role: 'patient',
                room: '',
                department: '',
              }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                setFieldValue,
                values,
                errors,
                touched,
              }) => (
                <View style={styles.form}>
                  <SegmentedButtons
                    value={values.role}
                    onValueChange={(value) => {
                      setFieldValue('role', value);
                      setFieldValue('department', '');
                      setFieldValue('room', '');
                    }}
                    buttons={[
                      { value: 'patient', label: 'Patient' },
                      { value: 'nurse', label: 'Nurse' },
                    ]}
                    style={styles.roleSelector}
                  />

                  <View style={styles.row}>
                    <TextInput
                      mode="outlined"
                      label="First Name"
                      value={values.firstName}
                      onChangeText={handleChange('firstName')}
                      onBlur={handleBlur('firstName')}
                      error={touched.firstName && !!errors.firstName}
                      style={[styles.input, styles.halfInput]}
                      left={<TextInput.Icon icon="account" />}
                    />
                    <TextInput
                      mode="outlined"
                      label="Last Name"
                      value={values.lastName}
                      onChangeText={handleChange('lastName')}
                      onBlur={handleBlur('lastName')}
                      error={touched.lastName && !!errors.lastName}
                      style={[styles.input, styles.halfInput]}
                      left={<TextInput.Icon icon="account" />}
                    />
                  </View>

                  <TextInput
                    mode="outlined"
                    label="Email"
                    value={values.email}
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                    error={touched.email && !!errors.email}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.input}
                    left={<TextInput.Icon icon="email" />}
                  />

                  <TextInput
                    mode="outlined"
                    label="Password"
                    value={values.password}
                    onChangeText={handleChange('password')}
                    onBlur={handleBlur('password')}
                    error={touched.password && !!errors.password}
                    secureTextEntry={!showPassword}
                    style={styles.input}
                    left={<TextInput.Icon icon="lock" />}
                    right={
                      <TextInput.Icon
                        icon={showPassword ? 'eye-off' : 'eye'}
                        onPress={() => setShowPassword(!showPassword)}
                      />
                    }
                  />

                  <TextInput
                    mode="outlined"
                    label="Confirm Password"
                    value={values.confirmPassword}
                    onChangeText={handleChange('confirmPassword')}
                    onBlur={handleBlur('confirmPassword')}
                    error={touched.confirmPassword && !!errors.confirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    style={styles.input}
                    left={<TextInput.Icon icon="lock-check" />}
                    right={
                      <TextInput.Icon
                        icon={showConfirmPassword ? 'eye-off' : 'eye'}
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      />
                    }
                  />

                  {values.role === 'nurse' && (
                    <Picker
                      style={styles.picker}
                      selectedValue={values.department}
                      onValueChange={handleChange('department')}
                    >
                      <Picker.Item label="Select Department" value="" />
                      {departments.map(dept => (
                        <Picker.Item key={dept.id} label={dept.name} value={dept.id} />
                      ))}
                      <Picker.Item label="No departments available" value="" />
                    </Picker>
                  )}

                  {values.role === 'patient' && (
                    <TextInput
                      mode="outlined"
                      label="Room Number"
                      value={values.room}
                      onChangeText={handleChange('room')}
                      onBlur={handleBlur('room')}
                      error={touched.room && !!errors.room}
                      style={styles.input}
                      keyboardType="numeric"
                      left={<TextInput.Icon icon="door" />}
                    />
                  )}

                  <Button
                    mode="contained"
                    onPress={() => handleSubmit()}
                    style={styles.button}
                    contentStyle={styles.buttonContent}
                  >
                    Register
                  </Button>

                  <TouchableOpacity
                    style={styles.loginButton}
                    onPress={() => navigation.navigate('Login')}
                  >
                    <Text style={styles.loginText}>
                      Already have an account?{' '}
                      <Text style={styles.loginLink}>Login</Text>
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </Formik>
          </BlurView>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 8,
  },
  formContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    width: width - 40,
  },
  formBlur: {
    padding: 20,
  },
  form: {
    width: '100%',
  },
  roleSelector: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  input: {
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  halfInput: {
    width: '48%',
  },
  picker: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    marginVertical: 10,
  },
  button: {
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  loginButton: {
    alignItems: 'center',
  },
  loginText: {
    color: '#fff',
    fontSize: 14,
  },
  loginLink: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});
