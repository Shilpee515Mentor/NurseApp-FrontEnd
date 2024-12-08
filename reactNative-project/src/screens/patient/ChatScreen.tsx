import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Platform,
  Keyboard,
  KeyboardAvoidingView,
  Dimensions,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useLLM } from '../../contexts/LLMContext';
import { useAuth } from '../../contexts/AuthContext';


export default function ChatScreen() {
  const { messages, sendMessage, isTyping } = useLLM();
  const { user } = useAuth();
  const [inputText, setInputText] = useState('');
  const [showOptions, setShowOptions] = useState(true);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const keyboardWillShow = (e: KeyboardEvent) => {
      setKeyboardHeight(e.endCoordinates.height);
      setShowOptions(false);
    };

    const keyboardWillHide = () => {
      setKeyboardHeight(0);
      if (!inputText.trim()) {
        setShowOptions(true);
      }
    };

    const showListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      keyboardWillShow
    );
    const hideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      keyboardWillHide
    );

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, [inputText]);

  // Quick Options Configuration
  const QUICK_OPTIONS = [
    {
      id: 'comfort',
      title: 'Comfort Needs',
      options: [
        { 
          id: 'blanket', 
          text: 'Need a blanket',
          description: 'Request a blanket with high priority for immediate comfort'
        },
        { 
          id: 'pillow', 
          text: 'Need a pillow',
          description: 'Request additional or different pillows for better comfort'
        },
        { 
          id: 'temperature', 
          text: 'Adjust room temperature',
          description: 'Request room temperature adjustment for better comfort'
        },
        { 
          id: 'position', 
          text: 'Help with positioning',
          description: 'Request urgent assistance with repositioning in bed'
        },
      ]
    },
    {
      id: 'basic',
      title: 'Basic Needs',
      options: [
        { 
          id: 'water', 
          text: 'Need water',
          description: 'Request water or other beverages with medium priority'
        },
        { 
          id: 'food', 
          text: 'Food related',
          description: 'Request meal service or dietary assistance'
        },
        { 
          id: 'bathroom', 
          text: 'Bathroom assistance',
          description: 'Request urgent assistance with bathroom needs'
        },
        { 
          id: 'personal', 
          text: 'Personal items',
          description: 'Request personal care items or toiletries'
        },
      ]
    },
    {
      id: 'medical',
      title: 'Medical Needs',
      options: [
        { 
          id: 'pain', 
          text: 'Pain management',
          description: 'Request urgent assistance with pain management, rate pain 1-10'
        },
        { 
          id: 'medication', 
          text: 'Medication timing',
          description: 'Inquire about medication schedule or request medication'
        },
        { 
          id: 'symptoms', 
          text: 'New symptoms',
          description: 'Report new or worsening symptoms for immediate attention'
        },
        { 
          id: 'nurse', 
          text: 'Speak to nurse',
          description: 'Request immediate nurse consultation for medical concerns'
        },
      ]
    }
  ];

  // Render Quick Options
  const renderQuickOptions = () => (
    <ScrollView 
      style={styles.quickOptionsContainer}
      contentContainerStyle={styles.quickOptionsContentContainer}
    >
      {QUICK_OPTIONS.map((category) => (
        <View key={category.id} style={styles.categoryContainer}>
          <Text style={styles.categoryTitle}>{category.title}</Text>
          <View style={styles.optionsScrollView}>
            {category.options.map((option) => (
              <TouchableOpacity 
                key={option.id} 
                style={styles.optionButton}
                onPress={() => {
                  setInputText(option.text);
                }}
              >
                <Text style={styles.optionButtonText}>{option.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const handleSend = () => {
    if (inputText.trim()) {
      sendMessage(inputText.trim());
      setInputText('');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <FlatList
          ref={flatListRef}
          style={styles.chatContainer}
          contentContainerStyle={styles.chatContent}
          data={messages}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={[
              styles.messageContainer,
              item.isUser ? styles.userMessage : styles.botMessage
            ]}>
              <Text style={[
                styles.messageText,
                item.isUser ? styles.userMessageText : styles.botMessageText
              ]}>
                {item.text}
              </Text>
            </View>
          )}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListFooterComponent={() => (
            <>
              {isTyping && (
                <View style={[styles.messageContainer, styles.botMessage]}>
                  <Text style={[styles.messageText, styles.botMessageText]}>Typing...</Text>
                </View>
              )}
              <View style={{ height: Platform.OS === 'ios' ? 20 : 10 }} />
            </>
          )}
        />

        <View style={[styles.bottomSection, { marginBottom: keyboardHeight }]}>
          {showOptions && (
            <View style={styles.quickOptionsContainer}>
              {renderQuickOptions()}
            </View>
          )}

          <SafeAreaView style={styles.inputWrapper}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Type your message..."
                multiline
                maxHeight={100}
              />

              <TouchableOpacity
                style={[styles.sendButton, !inputText.trim() && styles.disabledButton]}
                onPress={handleSend}
                disabled={!inputText.trim()}
              >
                <Text style={styles.sendButtonText}>Send</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  chatContainer: {
    flex: 1,
  },
  chatContent: {
    padding: 10,
  },
  bottomSection: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  quickOptionsContainer: {
    maxHeight: 250,
    backgroundColor: '#f7f7f7',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingVertical: 10,
  },
  quickOptionsContentContainer: {
    paddingBottom: 20,
  },
  inputWrapper: {
    backgroundColor: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === 'ios' ? 8 : 6,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingTop: 8,
    paddingBottom: 8,
    marginRight: 10,
    fontSize: 16,
    maxHeight: 100,
    minHeight: 36,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.5,
  },
  messageContainer: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
  },
  userMessage: {
    backgroundColor: '#007AFF',
    alignSelf: 'flex-end',
  },
  botMessage: {
    backgroundColor: '#e0e0e0',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
  },
  userMessageText: {
    color: 'white',
  },
  botMessageText: {
    color: '#333',
  },
  categoryContainer: {
    marginBottom: 15,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 15,
    marginBottom: 8,
    color: '#2c3e50',
  },
  optionsScrollView: {
    paddingHorizontal: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionButton: {
    backgroundColor: '#e6f2ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#a0c4e7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  optionButtonText: {
    fontSize: 14,
    color: '#2980b9',
    fontWeight: '500',
  },
});
