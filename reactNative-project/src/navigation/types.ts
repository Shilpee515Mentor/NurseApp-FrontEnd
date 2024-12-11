import { NavigatorScreenParams } from '@react-navigation/native';
import { User } from '../services/api';

export type RootStackParamList = {
  ManageNurses: undefined;
  ManageSchedules: { nurse: User };
  Schedule: undefined;
  // Add other screens as needed
};
