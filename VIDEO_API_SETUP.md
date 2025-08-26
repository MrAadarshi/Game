# 🎬 Video API Setup Guide

Complete guide to setting up **Pexels**, **Pixabay**, and **YouTube** APIs for unlimited video content in your shorts application.

## 🚀 Quick Start

Your app now supports **3 video sources** for unlimited content variety:

- **Pexels**: High-quality stock videos (FREE)
- **Pixabay**: Creative Commons videos (FREE) 
- **YouTube**: Real trending shorts (PAID)

## 📋 Setup Priority

### 🥇 **Step 1: Pexels API (Highly Recommended)**
- **Cost**: FREE
- **Benefit**: 20,000 requests/hour vs 200 without key
- **Quality**: Professional stock videos
- **Setup Time**: 2 minutes

### 🥈 **Step 2: Pixabay API (Required for Pixabay)**
- **Cost**: FREE  
- **Benefit**: 20,000 requests/day
- **Quality**: Creative Commons videos
- **Setup Time**: 3 minutes

### 🥉 **Step 3: YouTube API (Optional)**
- **Cost**: PAID (quota-based)
- **Benefit**: Real trending content
- **Quality**: Authentic shorts
- **Setup Time**: 5 minutes

---

## 🎨 Pexels API Setup

### Why Pexels?
- ✅ **FREE 20,000 requests/hour** with API key
- ✅ **High-quality** professional videos
- ✅ **No copyright issues**
- ✅ **Mobile-optimized** portrait videos
- ✅ **Instant activation**

### Setup Steps:

1. **Visit**: [https://www.pexels.com/api/](https://www.pexels.com/api/)
2. **Sign up** for a free account
3. **Navigate** to "Your API Key" section
4. **Copy** your API key
5. **Add to environment**:

```bash
# Add to your .env file
REACT_APP_PEXELS_API_KEY=YOUR_ACTUAL_API_KEY_HERE
```

### Rate Limits:
- **Without key**: 200 requests/hour
- **With key**: 20,000 requests/hour ⚡

---

## 🖼️ Pixabay API Setup

### Why Pixabay?
- ✅ **FREE 20,000 requests/day**
- ✅ **Large video library**
- ✅ **Creative Commons** content
- ✅ **Multiple quality options**
- ✅ **Safe search** built-in

### Setup Steps:

1. **Visit**: [https://pixabay.com/api/docs/](https://pixabay.com/api/docs/)
2. **Create** a free account
3. **Find your API key** in the documentation
4. **Copy** the key from the docs page
5. **Add to environment**:

```bash
# Add to your .env file
REACT_APP_PIXABAY_API_KEY=YOUR_ACTUAL_API_KEY_HERE
```

### Rate Limits:
- **Free tier**: 5,000 requests/hour
- **Daily limit**: 20,000 requests/day

---

## 📺 YouTube API Setup (Optional)

### Why YouTube?
- ✅ **Real trending** content
- ✅ **Massive** content library
- ✅ **Authentic** engagement metrics
- ❌ **Costs apply** for high usage
- ❌ **Quota limitations**

### Setup Steps:

1. **Visit**: [Google Cloud Console](https://console.cloud.google.com/)
2. **Create** new project or select existing
3. **Enable** YouTube Data API v3
4. **Create** credentials (API key)
5. **Restrict** the key to YouTube Data API (security)
6. **Add to environment**:

```bash
# Add to your .env file
REACT_APP_YOUTUBE_API_KEY=YOUR_ACTUAL_API_KEY_HERE
```

### Rate Limits:
- **Free quota**: 10,000 units/day
- **Cost**: $0.10 per 100 quota units after free tier

---

## 🔧 Environment Configuration

Create a `.env` file in your project root:

```bash
# Video API Configuration

# Pexels (FREE - Recommended)
REACT_APP_PEXELS_API_KEY=your_pexels_key_here

# Pixabay (FREE - Required for Pixabay videos)
REACT_APP_PIXABAY_API_KEY=your_pixabay_key_here

# YouTube (PAID - Optional)
REACT_APP_YOUTUBE_API_KEY=your_youtube_key_here
```

## 🚦 Testing Your Setup

### Check API Status:
Open browser console and look for:

```javascript
// ✅ Working APIs
🔍 Fetching 25 videos from pexels for trending
✅ pexels: 20 videos fetched

// ❌ API Issues  
❌ Error fetching from pixabay: API key required

// 📊 Distribution
📊 API Distribution: { pexels: 35, pixabay: 15, youtube: 25 }
```

### Verify Video Sources:
Your shorts should show a mix of:
- **Pexels**: Professional stock videos
- **Pixabay**: Creative content
- **YouTube**: Real shorts (if configured)
- **Fallback**: Mock content when APIs fail

---

## 💡 Cost Analysis

### Monthly Usage (100,000 video requests)

| Provider | Cost | Features |
|----------|------|----------|
| **Pexels** | **FREE** | Professional quality, unlimited |
| **Pixabay** | **FREE** | Creative Commons, unlimited |
| **YouTube** | **~$10-50** | Real content, engagement data |

### Recommended Setup:
- **Free Plan**: Pexels + Pixabay = Unlimited free videos
- **Premium Plan**: All three APIs = Maximum variety + real content

---

## 🛠️ Troubleshooting

### API Key Not Working?
```bash
# Check for common issues:
1. ❌ Extra spaces in .env file
2. ❌ Wrong key format
3. ❌ Key not activated on provider site
4. ❌ Browser cache (restart dev server)
```

### No Videos Loading?
```bash
# Debugging steps:
1. 🔍 Check browser console for errors
2. 🌐 Verify internet connection  
3. 🔄 Restart development server
4. 📋 Check .env file format
```

### Rate Limits Reached?
The app automatically handles this:
- ✅ **Caching** prevents repeated requests
- ✅ **Fallback** content when limits hit
- ✅ **Rate limiting** protection built-in

---

## 📊 Performance Monitoring

### View API Status:
```javascript
// In browser console
console.log(ContentAggregator.getSystemStatus());
```

### Expected Output:
```javascript
{
  apis: {
    pexels: { enabled: true, configured: true, priority: 2 },
    pixabay: { enabled: true, configured: true, priority: 1 },
    youtube: { enabled: true, configured: false, priority: 3 }
  },
  usage: {
    pexels: { requests: 45, lastReset: 1640995200000 },
    pixabay: { requests: 23, lastReset: 1640995200000 }
  }
}
```

---

## 🎯 Best Practices

### For Development:
1. **Start with Pexels** (easiest setup)
2. **Add Pixabay** for variety
3. **Skip YouTube** initially (costs money)

### For Production:
1. **Use all three APIs** for maximum content
2. **Monitor quotas** regularly
3. **Set up billing alerts** for YouTube
4. **Cache aggressively** to reduce API calls

### Content Strategy:
- **50% YouTube** (real trending content)
- **35% Pexels** (professional quality)
- **15% Pixabay** (creative variety)

---

## 🆘 Support

### Need Help?
1. **Check console logs** for detailed error messages
2. **Verify API keys** on provider websites
3. **Test individual APIs** using their documentation
4. **Check rate limits** and usage quotas

### Common Solutions:
- **Invalid API key**: Double-check on provider website
- **CORS errors**: APIs are configured for client-side use
- **Rate limiting**: App automatically handles this
- **No content**: Fallback mock content always available

---

## ✅ Success Checklist

- [ ] Pexels API key added and working
- [ ] Pixabay API key added and working  
- [ ] YouTube API key added (optional)
- [ ] Console shows successful API calls
- [ ] Videos loading from multiple sources
- [ ] No console errors
- [ ] Fallback content works when APIs fail

**Congratulations! Your shorts app now has unlimited video content from premium sources! 🎉** 