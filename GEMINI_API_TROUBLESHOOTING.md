# Gemini API Troubleshooting Guide

## 🐛 Current Issue
You're seeing the fallback message: "I'm having trouble generating recipes right now. Let me help you with cooking tips instead!"

This indicates that the Gemini API call is failing, likely due to one of these issues:

## ✅ **Quick Fixes to Try**

### 1. **Check Your API Key**
Make sure you have the Gemini API key set in your environment variables:

```bash
# Check if the API key is set
echo $NEXT_PUBLIC_GEMINI_API_KEY
```

If it's not set, add it to your `.env.local` file:
```bash
# Create or update .env.local
echo "NEXT_PUBLIC_GEMINI_API_KEY=your_actual_api_key_here" >> .env.local
```

### 2. **Get a Gemini API Key** (if you don't have one)
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click "Get API Key"
4. Create a new API key
5. Copy the key and add it to your `.env.local` file

### 3. **Restart the Development Server**
After adding the API key:
```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

### 4. **Verify the API Key is Working**
Test the API key directly:
```bash
curl -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}' \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=YOUR_API_KEY"
```

## 🔧 **Model Name Fix Applied**

I've updated the model name to `gemini-2.5-flash` in:
- `src/lib/gemini-service.ts`
- `src/lib/langchain-conversation-service.ts`

The previous model names (`gemini-1.5-flash`, `gemini-pro`, and `gemini-1.5-pro`) were causing 404 errors because they're not available in the v1beta API version. The correct model name is `gemini-2.5-flash` (latest stable model).

**Available Models Confirmed:**
- ✅ `gemini-2.5-flash` (latest stable)
- ✅ `gemini-2.5-pro` (latest pro)
- ✅ `gemini-pro-latest` (latest pro alias)

## 🧪 **Test the Fix**

### 1. **Check Environment Variables**
```bash
# In your project root
cat .env.local
```

### 2. **Test Recipe Generation**
1. Open `http://localhost:3000/dashboard`
2. Try asking for a recipe: "Show me a quick dinner recipe"
3. You should now see recipe generation instead of the fallback message

### 3. **Check Browser Console**
Open browser dev tools (F12) and check the console for any error messages.

## 🚨 **Common Issues & Solutions**

### **Issue: "API key not found"**
**Solution:** Add `NEXT_PUBLIC_GEMINI_API_KEY` to your `.env.local` file

### **Issue: "Model not found"**
**Solution:** ✅ Already fixed - changed to `gemini-pro`

### **Issue: "Quota exceeded"**
**Solution:** Check your Google AI Studio quota limits

### **Issue: "Invalid API key"**
**Solution:** Generate a new API key from Google AI Studio

### **Issue: "CORS error"**
**Solution:** The API calls should work from the server-side API route

## 🔍 **Debug Steps**

### 1. **Check Server Logs**
Look at your terminal where `npm run dev` is running for any error messages.

### 2. **Test API Route Directly**
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"userMessage": "Hello!", "context": {}}'
```

### 3. **Check Network Tab**
In browser dev tools, go to Network tab and look for failed requests to the API.

## 🎯 **Expected Behavior After Fix**

Once the API key is properly configured:
- ✅ Recipe generation should work
- ✅ You should see the enhanced ChefGPT personality
- ✅ No more fallback error messages
- ✅ Full conversation memory (server-side)

## 📞 **Still Having Issues?**

If you're still seeing the fallback message after trying these steps:

1. **Check the server logs** for specific error messages
2. **Verify the API key** is correctly formatted
3. **Try a different API key** from Google AI Studio
4. **Check your internet connection** and firewall settings

The system is designed to gracefully fall back to personality-enhanced responses even when the API fails, so you'll still get a good user experience!

---

**Next Steps:**
1. Add your Gemini API key to `.env.local`
2. Restart the development server
3. Test recipe generation
4. Enjoy your enhanced ChefGPT experience! 🚀
