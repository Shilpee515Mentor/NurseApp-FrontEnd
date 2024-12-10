import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  FlatList,
} from 'react-native';
import {
  Text,
  Surface,
  IconButton,
  useTheme,
  TextInput,
  Avatar,
  Chip,
} from 'react-native-paper';
import { useLLM } from '../../contexts/LLMContext';
import { useAuth } from '../../contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { 
  FadeInDown, 
  FadeOutUp,
  SlideInRight,
  Layout,
} from 'react-native-reanimated';

interface QuickOption {
  id: string;
  text: string;
  icon: string;
}

const quickOptions: QuickOption[] = [
  { id: 'pain', text: 'I am in pain', icon: 'bandage' },
  { id: 'medication', text: 'Need medication', icon: 'pill' },
  { id: 'nurse', text: 'Call nurse', icon: 'doctor' },
  { id: 'emergency', text: 'Emergency', icon: 'alert' },
];

export default function ChatScreen() {
  const { messages, sendMessage, isTyping } = useLLM();
  const { user } = useAuth();
  const [inputText, setInputText] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const theme = useTheme();
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const keyboardDidShow = () => setShowSuggestions(false);
    const keyboardDidHide = () => {
      if (!inputText.trim()) {
        setShowSuggestions(true);
      }
    };

    const showSubscription = Keyboard.addListener('keyboardDidShow', keyboardDidShow);
    const hideSubscription = Keyboard.addListener('keyboardDidHide', keyboardDidHide);

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [inputText]);

  const handleSend = () => {
    if (inputText.trim()) {
      sendMessage(inputText.trim());
      setInputText('');
      setShowSuggestions(true);
    }
  };

  const handleQuickOption = (option: QuickOption) => {
    sendMessage(option.text);
    setShowSuggestions(false);
  };

  const renderMessage = ({ item, index }: { item: any; index: number }) => (
    <Animated.View
      entering={SlideInRight.delay(index * 100)}
      layout={Layout.springify()}
      style={[
        styles.messageContainer,
        item.isUser ? styles.userMessage : styles.assistantMessage,
      ]}
    >
      {!item.isUser && (
        <Avatar.Icon
          size={32}
          icon="robot"
          style={styles.avatar}
        />
      )}
      <Surface style={[
        styles.messageBubble,
        item.isUser ? styles.userBubble : styles.assistantBubble,
      ]}>
        <Text style={[
          styles.messageText,
          item.isUser ? styles.userMessageText : styles.assistantMessageText,
        ]}>
          {item.text}
        </Text>
      </Surface>
    </Animated.View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#6A11CB', '#2575FC'] as const}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <BlurView intensity={20} style={styles.headerBlur}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Medical Assistant</Text>
            <Avatar.Icon
              size={40}
              icon="robot"
            />
          </View>
        </BlurView>
      </LinearGradient>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        ListFooterComponent={
          isTyping ? (
            <Animated.View
              entering={FadeInDown}
              exiting={FadeOutUp}
              style={styles.typingIndicator}
            >
              <Surface style={styles.typingBubble}>
                <Text style={styles.typingText}>AI is typing</Text>
                <View style={styles.dotContainer}>
                  {[0, 1, 2].map((dot) => (
                    <View key={dot} style={styles.typingDot} />
                  ))}
                </View>
              </Surface>
            </Animated.View>
          ) : null
        }
      />

      {showSuggestions && (
        <Animated.View
          entering={FadeInDown}
          exiting={FadeOutUp}
          style={styles.suggestionsContainer}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestionsScroll}
          >
            {quickOptions.map((option) => (
              <Chip
                key={option.id}
                icon={() => (
                  <Icon name={option.icon} size={20} color={theme.colors.primary} />
                )}
                onPress={() => handleQuickOption(option)}
                style={styles.suggestionChip}
                mode="outlined"
              >
                {option.text}
              </Chip>
            ))}
          </ScrollView>
        </Animated.View>
      )}

      <Surface style={styles.inputContainer}>
        <TextInput
          mode="flat"
          placeholder="Type your message..."
          value={inputText}
          onChangeText={setInputText}
          style={styles.input}
          right={
            <TextInput.Icon
              icon="send"
              disabled={!inputText.trim()}
              onPress={handleSend}
            />
          }
        />
      </Surface>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 48,
    paddingBottom: 16,
  },
  headerBlur: {
    padding: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  assistantMessage: {
    justifyContent: 'flex-start',
  },
  avatar: {
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: '#2575FC',
    borderTopRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#fff',
  },
  assistantMessageText: {
    color: '#333',
  },
  typingIndicator: {
    marginLeft: 48,
    marginBottom: 16,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    maxWidth: 100,
  },
  typingText: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  dotContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#666',
    marginHorizontal: 2,
    opacity: 0.6,
  },
  suggestionsContainer: {
    padding: 8,
  },
  suggestionsScroll: {
    paddingHorizontal: 8,
  },
  suggestionChip: {
    marginHorizontal: 4,
  },
  inputContainer: {
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  input: {
    backgroundColor: '#fff',
  },
});
