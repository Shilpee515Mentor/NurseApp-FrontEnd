import React, { useState, useEffect, useRef } from 'react';
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
import * as ImagePicker from 'expo-image-picker';
import io from 'socket.io-client';
import { CONFIG } from '../../config/environment';

export default function MessagesScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [nurses, setNurses] = useState<User[]>([]);
  const [selectedNurse, setSelectedNurse] = useState<User | null>(null);
  const { user } = useAuth();
  const socketRef = useRef<any>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    fetchNurses();
    setupSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const setupSocket = () => {
    socketRef.current = io(CONFIG.API_URL);
    
    socketRef.current.on('newMessage', (message: Message) => {
      setMessages(prev => [message, ...prev]);
    });
  };

  const fetchNurses = async () => {
    try {
      const data = await messageApi.getNurses();
      setNurses(data.filter(nurse => nurse._id !== user?._id));
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch nurses');
    }
  };

  const fetchMessages = async (nurseId: string) => {
    try {
      const data = await messageApi.getConversation(nurseId);
      setMessages(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string, messageType: 'text' | 'image' = 'text', imageUrl?: string) => {
    if (!selectedNurse) return;

    try {
      await messageApi.sendMessage({
        receiver: selectedNurse._id,
        content,
        messageType,
        imageUrl,
      });
      setMessageText('');
    } catch (error) {
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      try {
        const uploadResult = await messageApi.uploadImage(result.assets[0].uri);
        await sendMessage('Image', 'image', uploadResult.imageUrl);
      } catch (error) {
        Alert.alert('Error', 'Failed to upload image');
      }
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
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
