import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import AdminDashboard from '../screens/admin/AdminDashboard';
import NurseDashboard from '../screens/nurse/NurseDashboard';
import NurseApprovalScreen from '../screens/admin/NurseApprovalScreen';
import PatientRegistrationScreen from '../screens/nurse/PatientRegistrationScreen';
import MyPatientsScreen from '../screens/nurse/MyPatientsScreen';
import CreateRequestScreen from '../screens/admin/CreateRequestScreen';
import RequestManagementScreen from '../screens/admin/RequestManagementScreen';
import PatientDashboard from '../screens/patient/PatientDashboard';
import ChatScreen from '../screens/patient/ChatScreen';
import PatientProfileScreen from '../screens/patient/PatientProfileScreen';
import AppointmentScreen from '../screens/patient/AppointmentScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Stack.Navigator>
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : user?.role === 'admin' ? (
        <Stack.Group>
          <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
          <Stack.Screen 
            name="NurseApproval" 
            component={NurseApprovalScreen}
            options={{ title: 'Nurse Approvals' }}
          />
          <Stack.Screen
            name="CreateRequest"
            component={CreateRequestScreen}
            options={{ title: 'Create Request' }}
          />
          <Stack.Screen
            name="RequestManagement"
            component={RequestManagementScreen}
            options={{ title: 'Manage Requests' }}
          />
        </Stack.Group>
      ) : user?.role === 'nurse' ? (
        <Stack.Group>
          <Stack.Screen name="NurseDashboard" component={NurseDashboard} />
          <Stack.Screen 
            name="PatientRegistration" 
            component={PatientRegistrationScreen}
            options={{ title: 'Register Patient' }}
          />
          <Stack.Screen
            name="MyPatients"
            component={MyPatientsScreen}
            options={{ title: 'My Patients' }}
          />
        </Stack.Group>
      ) : user?.role === 'patient' ? (
        <Stack.Group>
          <Stack.Screen 
            name="PatientDashboard" 
            component={PatientDashboard} 
            options={{ title: 'Dashboard' }}
          />
          <Stack.Screen 
            name="Chat" 
            component={ChatScreen} 
            options={{ title: 'Medical Assistant' }}
          />
          <Stack.Screen 
            name="PatientProfile" 
            component={PatientProfileScreen} 
            options={{ title: 'My Profile' }}
          />
          <Stack.Screen 
            name="Appointments" 
            component={AppointmentScreen} 
            options={{ title: 'My Appointments' }}
          />
        </Stack.Group>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}