import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Admin Screens
import AdminDashboard from '../screens/admin/AdminDashboard';
import NurseApprovalScreen from '../screens/admin/NurseApprovalScreen';
import CreateRequestScreen from '../screens/admin/CreateRequestScreen';
import RequestManagementScreen from '../screens/admin/RequestManagementScreen';
import ManageNursesScreen from '../screens/admin/ManageNursesScreen';
import PatientRecordsScreen from '../screens/admin/PatientRecordsScreen';
import ReportsScreen from '../screens/admin/ReportsScreen';
import ManageSchedulesScreen from '../screens/admin/ManageSchedulesScreen';

// Nurse Screens
import NurseDashboard from '../screens/nurse/NurseDashboard';
import PatientRegistrationScreen from '../screens/nurse/PatientRegistrationScreen';
import MyPatientsScreen from '../screens/nurse/MyPatientsScreen';
import ScheduleScreen from '../screens/nurse/ScheduleScreen';
import TasksScreen from 'src/screens/nurse/TasksScreen';
import MessagesScreen from 'src/screens/nurse/MessagesScreen';

// Patient Screens
import PatientDashboard from '../screens/patient/PatientDashboard';
import ChatScreen from '../screens/patient/ChatScreen';
import PatientProfileScreen from '../screens/patient/PatientProfileScreen';
import AppointmentScreen from '../screens/patient/AppointmentScreen';
import EmergencyScreen from '../screens/patient/EmergencyScreen';
import MedicalRecordsScreen from '../screens/patient/MedicalRecordsScreen';
import MedicationsScreen from '../screens/patient/MedicationsScreen';

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
          <Stack.Screen
            name="ManageNurses"
            component={ManageNursesScreen}
            options={{ title: 'Manage Nurses' }}
          />
          <Stack.Screen
            name="PatientRecords"
            component={PatientRecordsScreen}
            options={{ title: 'Patient Records' }}
          />
          <Stack.Screen
            name="Reports"
            component={ReportsScreen}
            options={{ title: 'Reports' }}
          />
          <Stack.Screen
            name="ManageSchedules"
            component={ManageSchedulesScreen}
            initialParams={{ nurse: null }}
            options={{ title: 'Manage Schedules' }}
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
          <Stack.Screen
            name="Schedule"
            component={ScheduleScreen}
            options={{ title: 'My Schedule' }}
          />
          <Stack.Screen
            name="Tasks"
            component={TasksScreen}
            options={{ title: 'My Tasks' }}
          />
          <Stack.Screen
            name="Messages"
            component={MessagesScreen}
            options={{ title: 'My Messages' }}
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
          <Stack.Screen 
            name="Emergency" 
            component={EmergencyScreen} 
            options={{ title: 'Emergency' }}
          />
          <Stack.Screen 
            name="MedicalRecords" 
            component={MedicalRecordsScreen} 
            options={{ title: 'Medical Records' }}
          />
          <Stack.Screen 
            name="Medications" 
            component={MedicationsScreen} 
            options={{ title: 'Medications' }}
          />
        </Stack.Group>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}