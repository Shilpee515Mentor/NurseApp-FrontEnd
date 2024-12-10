import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { CONFIG } from '../config/environment';

// If you're using a physical device, use your computer's IP address
const API_URL = CONFIG.API_URL;

console.log('Using API URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add request interceptor for authentication
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Request:', {
      method: config.method,
      url: config.url,
      headers: config.headers,
      data: config.data,
    });
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
api.interceptors.response.use(
  (response) => {
    console.log('Response:', {
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error('Response Error:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network Error:', {
        request: error.request._response,
        config: error.config,
      });
    } else {
      // Error in request setup
      console.error('Setup Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  department?: string;
  room?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface Department {
  id: string;
  name: string;
}

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  department?: string;
  room?: string;
  status: string;
  createdAt: string;
}

export interface PatientRegistrationData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  room: string;
}

export interface Request {
  _id: string;
  patient: User;
  nurse: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  description: string;
  department: string;
  room: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRequestData {
  patient: string;
  nurse: string;
  priority: string;
  description: string;
  department: string;
}

export interface RequestFilters {
  status?: string | null;
  priority?: string | null;
  department?: string | null;
}

export interface Task {
  _id: string;
  description: string;
  assignedTo: string;
  assignedBy: string;
  patient?: string;
  status: 'pending' | 'completed' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  sender: string;
  receiver: string;
  content: string;
  messageType: 'text' | 'image';
  imageUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export const departmentApi = {
  getAll: async () => {
    try {
      const response = await api.get('/departments');
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch departments:', {
        message: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  },
};

export const userApi = {
  getPendingNurses: async () => {
    try {
      const response = await api.get('/users/pending-nurses');
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch pending nurses:', {
        message: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  },

  approveNurse: async (userId: string, status: 'approved' | 'rejected') => {
    try {
      const response = await api.patch(`/users/${userId}/approve`, { status });
      return response.data;
    } catch (error: any) {
      console.error('Failed to approve/reject nurse:', {
        message: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  },

  createRequest: async (data: CreateRequestData) => {
    try {
      const response = await api.post('/requests', data);
      return response.data;
    } catch (error: any) {
      console.error('Failed to create request:', {
        message: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  },

  getUsersByRole: async (role: string, status?: string) => {
    try {
      const params = status ? { role, status } : { role };
      const response = await api.get('/users', { params });
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch users by role:', {
        message: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  },

  getAllRequests: async (filters: RequestFilters = {}) => {
    try {
      // Remove null values from filters
      const queryParams = Object.entries(filters)
        .filter(([_, value]) => value !== null)
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

      const response = await api.get('/requests', { params: queryParams });
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch requests:', {
        message: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  },
};

export const nurseApi = {
  registerPatient: async (data: PatientRegistrationData) => {
    try {
      const response = await api.post('/users/register-patient', data);
      return response.data;
    } catch (error: any) {
      console.error('Failed to register patient:', {
        message: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  },

  getMyPatients: async () => {
    try {
      const response = await api.get('/requests/my-patients');
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch patients:', {
        message: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  },

  updateRequestStatus: async (requestId: string, status: string) => {
    try {
      const response = await api.patch(`/requests/${requestId}/status`, { status });
      return response.data;
    } catch (error: any) {
      console.error('Failed to update request status:', {
        message: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  },
};

export const authApi = {
  register: async (data: RegisterData) => {
    try {
      console.log('Starting registration with data:', data);
      const response = await api.post('/auth/register', data);
      console.log('Registration successful:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Registration failed:', {
        message: error.message,
        response: error.response?.data,
        request: error.request?._response,
      });
      throw error;
    }
  },

  login: async (data: LoginData) => {
    try {
      const response = await api.post('/auth/login', data);
      return response.data;
    } catch (error: any) {
      console.error('Login failed:', {
        message: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  },
};

export const appointmentApi = {
  fetchAppointments: async (patientId?: string) => {
    try {
      const response = await axios.get(`${API_URL}/appointments/${patientId}`, {
        headers: { Authorization: `Bearer ${await SecureStore.getItemAsync('token')}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  },
};

export const taskApi = {
  getNurseTasks: async () => {
    const response = await api.get<Task[]>('/tasks/nurse');
    return response.data;
  },

  updateTaskStatus: async (taskId: string, status: 'completed' | 'rejected', rejectionReason?: string) => {
    const response = await api.put(`/tasks/${taskId}/status`, { status, rejectionReason });
    return response.data;
  },

  createTask: async (data: {
    description: string;
    assignedTo: string;
    patient?: string;
  }) => {
    const response = await api.post('/tasks', data);
    return response.data;
  },
};

export const messageApi = {
  getNurses: async () => {
    const params = { role: 'nurse' };
    const response = await api.get<User[]>('/users', { params });
    return response.data;
  },

  getConversation: async (nurseId: string) => {
    const response = await api.get<Message[]>(`/messages/conversation/${nurseId}`);
    return response.data;
  },

  sendMessage: async (data: {
    receiver: string;
    content: string;
    messageType: 'text' | 'image';
    imageUrl?: string;
  }) => {
    const response = await api.post('/messages/send', data);
    return response.data;
  },

  uploadImage: async (imageUri: string) => {
    const formData = new FormData();
    const uriParts = imageUri.split('.');
    const fileType = uriParts[uriParts.length - 1];

    formData.append('image', {
      uri: imageUri,
      name: `photo.${fileType}`,
      type: `image/${fileType}`,
    } as any);

    const response = await api.post('/messages/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  markMessageAsRead: async (messageId: string) => {
    const response = await api.put(`/messages/${messageId}/read`);
    return response.data;
  },
};

export default api;
