import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { AuthProvider } from './src/contexts/AuthContext';
import { LLMProvider } from './src/contexts/LLMContext';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <AuthProvider>
          <LLMProvider>
            <RootNavigator />
          </LLMProvider>
        </AuthProvider>
      </NavigationContainer>
    </PaperProvider>
  );
}