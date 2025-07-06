# BeautyAI Chrome Extension

A powerful Chrome extension that provides real-time beauty product detection across websites with AI-powered analysis and intelligent recommendations.

## Features

### 🔍 Real-time Detection
- **Smart Monitoring**: Automatically detects beauty products across all websites
- **Multi-source Detection**: Monitors clipboard, DOM changes, and URL navigation
- **Confidence Scoring**: Advanced algorithm calculates detection confidence based on brands, products, ingredients, and context

### 🎯 Proactive Popups
- **Intelligent Triggers**: Shows beautiful popups when high-confidence beauty content is detected
- **Contextual Information**: Displays detection source, confidence level, and content preview
- **Auto-dismiss**: Popups automatically close after 10 seconds with visual countdown

### ⚙️ Monitoring Controls
- **Easy Toggle**: Turn monitoring on/off with a simple switch
- **Sensitivity Settings**: Adjust detection sensitivity (high/medium/low)
- **Source Selection**: Choose which sources to monitor (clipboard, DOM, navigation)
- **Real-time Status**: Visual indicators show monitoring status and detection count

### 📊 Analytics Dashboard
- **Detection History**: View comprehensive history of all detections
- **Statistics**: Track total detections, today's count, and average confidence
- **Source Analysis**: See which sources generate the most detections

### 🛡️ Privacy-First
- **Local Processing**: All monitoring happens locally in your browser
- **No External Data**: Content is never sent to external servers without explicit action
- **Transparent Controls**: Clear privacy notices and user control over all features

## Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory
5. The BeautyAI extension will appear in your extensions list

## Usage

### Getting Started
1. Click the BeautyAI icon in your Chrome toolbar
2. Toggle "Real-time Detection" to start monitoring
3. Browse beauty websites or copy beauty-related content
4. Watch for intelligent popups when products are detected

### Popup Interface
- **Status Toggle**: Enable/disable real-time monitoring
- **Detection Count**: See how many products detected today
- **Recent Detections**: View your latest 5 detections
- **Dashboard Access**: Open full analytics dashboard

### Proactive Detection
When beauty products are detected:
- Elegant popup appears in top-right corner
- Shows detection source and confidence level
- Offers to analyze content with AI
- Auto-closes after 10 seconds if no interaction

### Dashboard Features
- **Comprehensive History**: All detections with timestamps
- **Analytics**: Total detections, daily counts, confidence averages
- **Source Breakdown**: Which monitoring sources are most effective

## Technical Details

### Architecture
- **Background Service Worker**: Handles detection logic and cross-tab communication
- **Content Scripts**: Monitor page content and inject popups
- **Popup Interface**: Quick controls and status overview
- **Dashboard**: Full analytics and history management

### Detection Algorithm
The extension uses a sophisticated confidence scoring system:

- **Brand Recognition** (30% weight): Detects major beauty brands
- **Product Categories** (20% weight): Identifies skincare, makeup, haircare products
- **Ingredient Analysis** (15% weight): Recognizes beauty ingredients like retinol, vitamin C
- **Context Clues** (10% weight): Looks for beauty-related discussions and reviews
- **Source Bonuses**: Navigation and image sources get confidence boosts

### Privacy & Security
- **Manifest V3**: Uses latest Chrome extension security standards
- **Local Storage**: All data stored locally using Chrome's storage API
- **No External Calls**: No data transmitted to external servers
- **User Control**: Complete user control over monitoring and data

## Permissions

The extension requires these permissions:
- `activeTab`: To monitor current tab content
- `storage`: To save settings and detection history
- `clipboardRead`: To monitor clipboard for beauty content (optional)
- `tabs`: To track navigation across beauty sites
- `scripting`: To inject content monitoring scripts

## Development

### File Structure
```
├── manifest.json          # Extension configuration
├── background.js          # Service worker for detection logic
├── content.js            # Content script for page monitoring
├── content.css           # Styles for injected elements
├── popup.html            # Extension popup interface
├── popup.js              # Popup functionality
├── dashboard.html        # Full analytics dashboard
├── dashboard.js          # Dashboard functionality
└── icons/               # Extension icons
```

### Key Components

**Background Service Worker** (`background.js`):
- Manages detection configuration and history
- Processes content from all monitoring sources
- Calculates confidence scores using advanced algorithms
- Triggers popups for high-confidence detections

**Content Monitor** (`content.js`):
- Monitors DOM changes for beauty-related content
- Scans existing page content on load
- Detects beauty-related images and product listings
- Injects and manages proactive popups

**Popup Interface** (`popup.js`):
- Provides quick access to monitoring controls
- Shows real-time status and recent detections
- Allows users to toggle monitoring on/off

## Future Enhancements

- **AI Integration**: Connect with Gemini API for detailed product analysis
- **Price Tracking**: Monitor price changes for detected products
- **Wishlist Management**: Save and organize detected products
- **Social Sharing**: Share discoveries with friends
- **Advanced Filters**: Filter detections by category, brand, or price range

## Support

For issues, feature requests, or questions:
1. Check the extension's popup for status information
2. Review detection history in the dashboard
3. Ensure proper permissions are granted
4. Try adjusting sensitivity settings for better detection

## License

This project is licensed under the MIT License - see the LICENSE file for details.