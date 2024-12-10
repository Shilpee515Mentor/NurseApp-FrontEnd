import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Surface,
  Text,
  TextInput,
  IconButton,
  Avatar,
  ActivityIndicator,
} from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { messageApi, Message, User } from '../../services/api';
import { Socket } from 'socket.io-client';
import io from 'socket.io-client';
import { CONFIG } from '../../config/environment';

interface SocketMessage extends Message {
  _id: string;
  sender: string;
  receiver: string;
  content: string;
  messageType: 'text' | 'image';
  imageUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export default function MessagesScreen() {
  const [messages, setMessages] = useState<SocketMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);
  const [nurses, setNurses] = useState<User[]>([]);
  const [selectedNurse, setSelectedNurse] = useState<User | null>(null);
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const setupSocket = useCallback(() => {
    try {
      socketRef.current = io(CONFIG.API_URL, {
        auth: {
          token: user?.token
        },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socketRef.current.on('connect', () => {
        console.log('Socket connected');
        setSocketConnected(true);
      });

      socketRef.current.on('disconnect', () => {
        console.log('Socket disconnected');
        setSocketConnected(false);
      });

      socketRef.current.on('error', (error) => {
        console.error('Socket error:', error);
        Alert.alert('Connection Error', 'Failed to connect to chat server');
      });
      
      socketRef.current.on('newMessage', (message: SocketMessage) => {
        setMessages(prev => {
          // Avoid duplicate messages
          if (prev.some(m => m._id === message._id)) return prev;
          return [message, ...prev];
        });
        
        // Mark message as read if it's for the current conversation
        if (selectedNurse && message.sender === selectedNurse._id) {
          markMessageAsRead(message._id);
        }
      });

      socketRef.current.on('messageRead', ({ messageId }) => {
        setMessages(prev => prev.map(msg => 
          msg._id === messageId ? { ...msg, isRead: true } : msg
        ));
      });

    } catch (error) {
      console.error('Socket setup error:', error);
      Alert.alert('Connection Error', 'Failed to initialize chat connection');
    }
  }, [user, selectedNurse]);

  useEffect(() => {
    fetchNurses();
    setupSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [setupSocket]);

  const markMessageAsRead = async (messageId: string) => {
    try {
      await messageApi.markMessageAsRead(messageId);
      socketRef.current?.emit('messageRead', { messageId });
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const fetchNurses = async () => {
    try {
      setLoading(true);
      const data = await messageApi.getNurses();
      setNurses(data.filter(nurse => nurse._id !== user?._id));
    } catch (error) {
      console.error('Error fetching nurses:', error);
      Alert.alert('Error', 'Failed to fetch nurses');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (nurseId: string) => {
    try {
      setLoading(true);
      const data = await messageApi.getConversation(nurseId);
      setMessages(data);
      
      // Mark all unread messages as read
      data.forEach(message => {
        if (!message.isRead && message.sender === nurseId) {
          markMessageAsRead(message._id);
        }
      });
    } catch (error) {
      console.error('Error fetching messages:', error);
      Alert.alert('Error', 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string, messageType: 'text' | 'image' = 'text', imageUrl?: string) => {
    if (!selectedNurse || !content.trim()) return;

    try {
      const response = await messageApi.sendMessage({
        receiver: selectedNurse._id,
        content: content.trim(),
        messageType,
        imageUrl,
      });

      // Optimistically add message to UI
      const newMessage: SocketMessage = {
        _id: response._id,
        sender: user?._id || '',
        receiver: selectedNurse._id,
        content: content.trim(),
        messageType,
        imageUrl,
        isRead: false,
        createdAt: new Date().toISOString(),
      };

      setMessages(prev => [newMessage, ...prev]);
      setMessageText('');
      
      // Emit socket event
      socketRef.current?.emit('sendMessage', newMessage);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const pickImage = async () => {
    // const result = await ImagePicker.launchImageLibraryAsync({
    //   mediaTypes: ImagePicker.MediaTypeOptions.Images,
    //   quality: 0.8,
    // });

    // if (!result.canceled) {
    //   try {
    //     const uploadResult = await messageApi.uploadImage(result.assets[0].uri);
    //     await sendMessage('Image', 'image', uploadResult.imageUrl);
    //   } catch (error) {
    //     Alert.alert('Error', 'Failed to upload image');
    //   }
    // }
  };

  const renderMessage = ({ item }: { item: SocketMessage }) => {
    const isOwnMessage = item.sender === user?._id;

    return (
      <View style={[styles.messageContainer, isOwnMessage ? styles.ownMessage : styles.otherMessage]}>
        {!isOwnMessage && (
          <Avatar.Text
            size={32}
            label="NU"
            style={styles.avatar}
          />
        )}
        <Surface style={[styles.messageBubble, isOwnMessage ? styles.ownBubble : styles.otherBubble]}>
          {item.messageType === 'image' ? (
            <Image source={{ uri: item.imageUrl }} style={styles.messageImage} />
          ) : (
            <Text style={styles.messageText}>{item.content}</Text>
          )}
          <Text style={styles.timestamp}>
            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </Surface>
      </View>
    );
  };

  const renderNurseItem = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={[
        styles.nurseItem,
        selectedNurse?._id === item._id && styles.selectedNurse,
      ]}
      onPress={() => {
        setSelectedNurse(item);
        fetchMessages(item._id);
      }}
    >
      <Avatar.Text
        size={40}
        label={`${item.firstName[0]}${item.lastName[0]}`}
      />
      <Text style={styles.nurseName}>{item.firstName} {item.lastName}</Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.nurseList}>
        <FlatList
          horizontal
          data={nurses}
          renderItem={renderNurseItem}
          keyExtractor={(item) => item._id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.nurseListContent}
        />
      </View>

      {selectedNurse ? (
        <>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.messagesList}
            inverted
            onContentSizeChange={() => flatListRef.current?.scrollToOffset({ offset: 0, animated: true })}
          />

          <View style={styles.inputContainer}>
            <TextInput
              mode="outlined"
              value={messageText}
              onChangeText={setMessageText}
              placeholder="Type a message..."
              style={styles.input}
              right={
                <TextInput.Icon
                  icon="image"
                  onPress={pickImage}
                />
              }
            />
            <IconButton
              icon="send"
              size={24}
              onPress={() => {
                if (messageText.trim()) {
                  sendMessage(messageText.trim());
                }
              }}
              style={styles.sendButton}
            />
          </View>
        </>
      ) : (
        <View style={styles.selectNursePrompt}>
          <Text>Select a nurse to start messaging</Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  nurseList: {
    backgroundColor: 'white',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  nurseListContent: {
    paddingHorizontal: 16,
    gap: 16,
  },
  nurseItem: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
  },
  selectedNurse: {
    backgroundColor: '#e3f2fd',
  },
  nurseName: {
    marginTop: 4,
    fontSize: 12,
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 4,
    alignItems: 'flex-end',
  },
  ownMessage: {
    justifyContent: 'flex-end',
  },
  otherMessage: {
    justifyContent: 'flex-start',
  },
  avatar: {
    marginRight: 8,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    maxWidth: '70%',
  },
  ownBubble: {
    backgroundColor: '#e3f2fd',
  },
  otherBubble: {
    backgroundColor: 'white',
  },
  messageText: {
    fontSize: 16,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },
  timestamp: {
    fontSize: 10,
    color: '#757575',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: 'white',
  },
  sendButton: {
    marginLeft: 8,
  },
  selectNursePrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
