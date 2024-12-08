import { Platform } from 'react-native';

// Development environment configuration
const DEV_CONFIG = {
  // Use localhost for iOS simulator, your computer's IP for physical devices
  HOST: Platform.select({
    ios: 'localhost',
    android: '192.168.1.8', // Replace this with your computer's IP when needed
  }),
  PORT: '3000',
};

// Production environment configuration
const PROD_CONFIG = {
  HOST: 'your-production-host.com',
  PORT: '443',
};

// Select configuration based on environment
const ENV = __DEV__ ? DEV_CONFIG : PROD_CONFIG;

// Export configuration
export const CONFIG = {
  API_URL: `http://${ENV.HOST}:${ENV.PORT}/api`,
  SOCKET_URL: `http://${ENV.HOST}:${ENV.PORT}`,
};
