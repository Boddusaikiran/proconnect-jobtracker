# AI Customer Care Chatbot - Feature Documentation

## Overview
An intelligent, AI-powered customer support chatbot with advanced features including voice input, draggable UI, dark mode support, and persistent chat history.

---

## Features

### 🤖 **AI-Powered Responses**
- Integrates with your existing `/api/ai/chat` endpoint
- Intelligent responses powered by OpenAI GPT
- Fallback to echo mode if API key is not configured

### 🎤 **Voice Input**
- Speech-to-text using Web Speech API
- Real-time voice recognition
- Visual feedback during recording
- Supports English (US) language

### 🗣️ **Text-to-Speech**
- AI responses are read aloud automatically
- Uses browser's native speech synthesis
- Can be muted if needed

### 🎨 **Modern UI**
- Draggable floating button
- Draggable chat window
- Snaps to corners for better UX
- Dark mode support (auto-detects system preference)
- Smooth animations and transitions
- Responsive design

### 💾 **Persistent Chat History**
- Saves conversations to localStorage
- Chat history persists across page reloads
- Clear chat option available
- Timestamps for each message

### 👁️ **Idle Detection**
- Button fades to 30% opacity after 3 seconds of inactivity
- Returns to full opacity on user interaction
- Improves UI cleanliness

### 📱 **User Experience**
- Real-time typing indicators
- Message timestamps
- User and AI avatars
- Smooth scrolling to latest messages
- Enter key to send messages

---

## Installation

The component has been automatically integrated into your application:

### Files Created
1. **Component:** `client/src/components/CustomerCareAI.tsx`
2. **Types:** `client/src/types/speech.d.ts`

### Integration
The component is added to `App.tsx` and will appear on all pages as a floating button.

---

## Usage

### For Users

1. **Open Chat**
   - Click the blue robot icon in the bottom-right corner
   - The button is draggable - move it anywhere on screen

2. **Send Messages**
   - Type your message in the input field
   - Press Enter or click "Send"
   - Wait for AI response

3. **Voice Input**
   - Click the microphone button (green)
   - Speak your message
   - The text will appear in the input field
   - Click "Send" to submit

4. **Clear Chat**
   - Click the trash icon (🗑️) in the header
   - Confirms deletion of all messages

5. **Close Chat**
   - Click the X button in the header
   - Chat history is preserved

### For Developers

#### Customization Options

**Change AI Endpoint:**
```typescript
// In CustomerCareAI.tsx, line ~92
const res = await fetch("/api/ai/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ message: input }),
});
```

**Adjust Idle Timeout:**
```typescript
// In CustomerCareAI.tsx, line ~37
idleTimer = setTimeout(() => setIsIdle(true), 3000); // Change 3000 to desired ms
```

**Modify Chat Window Size:**
```typescript
// In CustomerCareAI.tsx, line ~196
style={{ left: chatPos.x, top: chatPos.y, width: 320, height: 480 }}
// Change width and height values
```

**Change Voice Language:**
```typescript
// In CustomerCareAI.tsx, line ~49
recognition.lang = "en-US"; // Change to desired language code
```

**Disable Text-to-Speech:**
```typescript
// In CustomerCareAI.tsx, line ~99-103
// Comment out or remove this block:
if ("speechSynthesis" in window) {
  const utter = new SpeechSynthesisUtterance(aiMessage.text);
  utter.lang = "en-US";
  window.speechSynthesis.speak(utter);
}
```

---

## Technical Details

### Dependencies
- **react-icons:** For UI icons (AiOutlineRobot, FaUserCircle, FaMicrophone, FaMicrophoneSlash)
- **Web Speech API:** For voice recognition (browser native)
- **Speech Synthesis API:** For text-to-speech (browser native)

### Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Chat UI | ✅ | ✅ | ✅ | ✅ |
| Voice Input | ✅ | ❌ | ✅ | ✅ |
| Text-to-Speech | ✅ | ✅ | ✅ | ✅ |
| Dark Mode | ✅ | ✅ | ✅ | ✅ |

**Note:** Firefox doesn't support Web Speech API for voice recognition.

### State Management
- Uses React hooks (useState, useRef, useEffect)
- localStorage for persistence
- No external state management library required

### Performance
- Lazy loading of speech recognition
- Debounced idle detection
- Efficient re-renders with proper dependency arrays
- Minimal bundle size impact

---

## API Integration

### Backend Endpoint
The component expects a POST endpoint at `/api/ai/chat`:

**Request:**
```json
{
  "message": "User's question here"
}
```

**Response:**
```json
{
  "reply": "AI's response here"
}
```

### Current Implementation
Your existing endpoint in `server/routes.ts` already supports this:

```typescript
app.post("/api/ai/chat", async (req, res) => {
  const { message } = req.body;
  // ... OpenAI integration
  res.json({ reply: aiResponse });
});
```

---

## Styling

### Tailwind Classes Used
- **Colors:** blue-600, gray-900, gray-800, etc.
- **Spacing:** p-4, gap-2, space-y-2
- **Layout:** flex, fixed, rounded-full, shadow-lg
- **Animations:** animate-bounce, transition
- **Responsive:** max-w-[70%]

### Dark Mode
Automatically detects system preference:
```typescript
const [darkMode] = useState(
  window.matchMedia("(prefers-color-scheme: dark)").matches
);
```

---

## Troubleshooting

### Voice Input Not Working
- **Check browser compatibility** (Chrome/Safari/Edge only)
- **Ensure HTTPS** (required for microphone access in production)
- **Grant microphone permissions** when prompted

### AI Not Responding
- **Verify OpenAI API key** is set in `.env`
- **Check backend logs** for errors
- **Test endpoint** directly: `curl -X POST http://localhost:5000/api/ai/chat -H "Content-Type: application/json" -d '{"message":"test"}'`

### Chat History Not Persisting
- **Check localStorage** is enabled in browser
- **Verify storage key:** `customerCareAI_chat`
- **Clear browser cache** if corrupted

### Button Not Draggable
- **Ensure no CSS conflicts** with `cursor-move`
- **Check z-index** (should be 50)
- **Verify mouse events** are not blocked

---

## Future Enhancements

Potential improvements for future versions:

1. **Multi-language Support**
   - Language selector in UI
   - Automatic language detection

2. **File Attachments**
   - Upload screenshots
   - Share documents

3. **Chat Export**
   - Download chat history
   - Email transcript

4. **Typing Indicators**
   - Show when user is typing
   - Real-time status updates

5. **Emoji Support**
   - Emoji picker
   - Reaction buttons

6. **Chat Templates**
   - Quick reply buttons
   - Common questions

7. **Analytics**
   - Track user interactions
   - Measure response times

---

## Security Considerations

1. **Input Sanitization**
   - All user inputs are sent to backend
   - Backend should validate and sanitize

2. **Rate Limiting**
   - Consider adding rate limits to prevent abuse
   - Implement on backend API

3. **Data Privacy**
   - Chat history stored in localStorage (client-side)
   - No sensitive data should be stored
   - Consider encryption for sensitive conversations

4. **HTTPS**
   - Required for microphone access
   - Ensures secure communication

---

## Support

For issues or questions:
1. Check browser console for errors
2. Verify backend API is running
3. Test with different browsers
4. Review this documentation

---

## License

Part of ProConnect Job Tracker application.
