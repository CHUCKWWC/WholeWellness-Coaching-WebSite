# 100ms Video Conferencing - Mobile Testing Guide

## Overview
This guide provides comprehensive instructions for testing the WholeWellness 100ms video conferencing implementation on iOS and Android devices. The platform uses **@100mslive/roomkit-react HMSPrebuilt** component for reliable, battle-tested video sessions.

## Critical Prerequisites

### 🚨 Real Devices Required
**Simulators and emulators DO NOT support actual video/audio:**
- iOS Simulator: Cannot access camera or microphone
- Android Emulator: Cannot provide real video streams
- **You MUST use physical devices for meaningful testing**

### Platform Requirements

#### iOS Testing
- **Minimum iOS Version:** iOS 13.0+
- **Recommended:** iOS 15.0+ for best performance
- **TestFlight Access:** https://testflight.apple.com/join/dhUSE7N8
- **Xcode:** 12+ for development/debugging

#### Android Testing
- **Minimum Android Version:** Android 5.0 (API level 21)
- **Recommended:** Android 10+ for best performance
- **Required Permissions:**
  ```xml
  <uses-permission android:name="android.permission.CAMERA" />
  <uses-permission android:name="android.permission.RECORD_AUDIO" />
  <uses-permission android:name="android.permission.INTERNET" />
  ```
- **Note:** Runtime permissions must be granted by user

## Testing Environments

### 1. Development Testing
**Local Network Testing:**
```bash
# Ensure your Replit deployment is accessible
# Test URL: https://your-repl-url.replit.app
```

**Device Requirements:**
- Connect mobile device to same network OR use public Replit URL
- Grant camera and microphone permissions when prompted
- Test with 2+ devices simultaneously

### 2. TestFlight (iOS Only)
1. **Install TestFlight App:** Download from App Store
2. **Join Beta:** Click TestFlight link provided by 100ms
3. **Install Build:** Open app from TestFlight
4. **Grant Permissions:** Camera, microphone, notifications

### 3. Production Testing
- Test on Replit's published domain
- Verify CSP (Content Security Policy) allows 100ms domains
- Check SSL certificate validity

## Network Reliability Testing

### Required Test Scenarios

100ms recommends testing these network conditions to ensure video quality and reliability:

#### Test 1: Low Bandwidth Conditions
**Tool:** Network Link Conditioner (iOS) or Charles Proxy (Android)

| Bandwidth | Expected Behavior |
|-----------|-------------------|
| 300 Kbps  | Audio functional, video degrades significantly |
| 500 Kbps  | Audio clear, video low quality but visible |
| 800 Kbps  | Active speaker video remains visible |
| 1 Mbps+   | Full quality video and audio |

**Test Steps:**
1. Start video call with normal connection
2. Apply bandwidth throttling using Network Link Conditioner
3. Verify audio prioritizes over video download
4. Confirm active speaker remains visible at 800+ Kbps
5. Check UI shows appropriate quality indicators

#### Test 2: Network Blips (Connection Loss)
**Scenario:** Sudden network disconnection and reconnection

**Test Steps:**
1. Start active video call
2. Toggle airplane mode ON for 5 seconds
3. Toggle airplane mode OFF
4. **Expected:** SDK auto-reconnects within 10-15 seconds
5. **Expected:** UI shows "Reconnecting..." indicator
6. **Expected:** Session resumes without requiring refresh

**Success Criteria:**
- Reconnection time < 20 seconds
- No data loss (chat messages preserved)
- Video/audio resume automatically

#### Test 3: Network Switching
**Scenario:** Transitioning between network types

**Test Cases:**
- WiFi 2.4GHz ↔ WiFi 5GHz
- WiFi ↔ Mobile Data (4G/5G)
- Mobile Data ↔ Mobile Hotspot

**Test Steps:**
1. Start call on WiFi
2. Disable WiFi (forces switch to mobile data)
3. Monitor reconnection time
4. Re-enable WiFi
5. Verify seamless transition

**Success Criteria:**
- Transition time < 5 seconds
- No audio dropouts during switch
- UI indicates network change

## Functional Testing Checklist

### Pre-Session Testing
- [ ] **Room Code Generation:** Coach can create session and get valid room code
- [ ] **Room Code Sharing:** Client can receive and enter room code
- [ ] **Guest Access:** Anonymous users can join without authentication
- [ ] **Permission Prompts:** Camera/microphone permissions requested correctly

### In-Session Testing
- [ ] **Video Display:** Both participants see each other's video
- [ ] **Audio Quality:** Clear audio in both directions
- [ ] **Mute Controls:** Audio and video mute/unmute work correctly
- [ ] **Screen Layout:** Participant tiles display properly
- [ ] **Chat Function:** Messages send and appear in real-time
- [ ] **Participant List:** Shows all participants accurately
- [ ] **Network Indicators:** Connection quality indicators update

### iOS-Specific Testing
- [ ] **Picture-in-Picture (PiP):** Video continues when app backgrounded
- [ ] **Background Audio:** Audio continues when screen locked
- [ ] **Rotation:** Video layout adapts to portrait/landscape
- [ ] **Interruptions:** Handles phone calls, Siri, notifications
- [ ] **Camera Flip:** Front/back camera switching works
- [ ] **CSP Compliance:** No "Endpoint is not reachable" errors

### Android-Specific Testing
- [ ] **Background Behavior:** App maintains connection when minimized
- [ ] **Permission Handling:** Runtime permissions granted properly
- [ ] **Device Variations:** Test on low-end and high-end devices
- [ ] **Split Screen:** Video works in split-screen mode
- [ ] **Notification Handling:** Incoming calls/notifications handled gracefully

## Performance Testing

### Launch Time Targets
| State | Target Time |
|-------|-------------|
| Cold Start | < 3 seconds |
| Warm Start | < 1 second |
| Hot Start | < 0.5 seconds |

### Rendering Performance
- **Target:** 60 FPS during video calls
- **Minimum:** 30 FPS for acceptable quality
- **Tool:** Use React Native Performance Monitor

### Battery Consumption
**Test Duration:** 30-minute video call

| Device Type | Expected Drain |
|-------------|----------------|
| iPhone (modern) | 10-15% |
| iPhone (older) | 15-25% |
| Android (modern) | 12-18% |
| Android (older) | 20-30% |

**Test Steps:**
1. Fully charge device to 100%
2. Close all background apps
3. Start 30-minute video call
4. Record battery level at start and end
5. Calculate percentage drain

## Critical CSP Configuration

**Important:** The application MUST have proper Content Security Policy configured to allow 100ms domains.

### Server-Side CSP (server/security.ts)
```javascript
'connect-src': [
  'https://*.100ms.live',
  'wss://*.100ms.live'
],
'media-src': [
  'blob:',
  'https://*.100ms.live'
]
```

### Client-Side CSP (client/index.html)
```html
<meta http-equiv="Content-Security-Policy" 
  content="connect-src 'self' https://*.100ms.live wss://*.100ms.live; 
           media-src 'self' blob: https://*.100ms.live;">
```

### iOS-Specific CSP Issue
**Error:** "Endpoint is not reachable"
**Cause:** Mismatched CSP between server and client meta tag
**Fix:** Ensure both server and client CSP policies include:
- `https://*.100ms.live` (wildcard for all subdomains)
- `wss://*.100ms.live` (WebSocket connections)
- `media-src blob:` (CRITICAL for iOS video/audio streams)

## Debugging Tips

### Common Issues

#### Issue: "Camera/Microphone Not Working"
**Diagnosis:**
1. Check browser console for permission errors
2. Verify app has granted permissions in device settings
3. Restart app and grant permissions again
4. Test in Safari (iOS) or Chrome (Android) first

#### Issue: "Video Freezes or Stutters"
**Diagnosis:**
1. Run network bandwidth test (use speedtest.net)
2. Check for background apps consuming bandwidth
3. Verify device has sufficient RAM (close other apps)
4. Monitor CPU usage during call

#### Issue: "Cannot Connect to Room"
**Diagnosis:**
1. Verify room code is correct and valid
2. Check network connectivity (try loading other websites)
3. Inspect CSP configuration (check browser console)
4. Verify 100ms API keys are correct and active

#### Issue: "Audio Echo or Feedback"
**Diagnosis:**
1. Ensure participants are not in same physical room
2. Check if multiple devices are joined from same location
3. Verify microphone sensitivity settings
4. Test with headphones to eliminate speaker feedback

### Logging for Support
Enable verbose logging to capture issues:

**Client-Side:**
```javascript
// Add to video session component
hmsActions.setLogLevel('VERBOSE');
```

**Server-Side:**
```javascript
// POST /api/video/log-error endpoint available for capturing errors
fetch('/api/video/log-error', {
  method: 'POST',
  body: JSON.stringify({
    error: 'Description',
    deviceInfo: navigator.userAgent,
    connectionType: navigator.connection?.effectiveType
  })
});
```

## Multi-Device Testing Matrix

### Recommended Test Combinations

| Test # | Device 1 | Device 2 | Scenario |
|--------|----------|----------|----------|
| 1 | iPhone 13+ | Android Phone | Cross-platform compatibility |
| 2 | iPhone SE (old) | iPad Pro | iOS low-end + high-end |
| 3 | Android Budget | Android Flagship | Android performance range |
| 4 | iOS Safari | Android Chrome | Browser compatibility |
| 5 | Desktop Browser | iPhone | Coach-client typical setup |

## Test Documentation Template

Use this template to document test results:

```markdown
## Test Session: [Date]

**Tester:** [Name]
**Devices:**
- Device 1: [Model, OS version]
- Device 2: [Model, OS version]

**Network Conditions:**
- Device 1: [WiFi/4G/5G, speed]
- Device 2: [WiFi/4G/5G, speed]

**Test Results:**
- [ ] Room creation: PASS/FAIL
- [ ] Room join: PASS/FAIL
- [ ] Video quality: PASS/FAIL
- [ ] Audio quality: PASS/FAIL
- [ ] Network switching: PASS/FAIL

**Issues Found:**
1. [Description]
2. [Description]

**Screenshots/Recordings:**
- [Attach evidence]
```

## Quick Start Testing Guide

### 5-Minute Smoke Test
1. **Setup:** 2 mobile devices (1 iOS, 1 Android)
2. **Coach Action:** Create session, copy room code
3. **Client Action:** Enter room code, join session
4. **Verify:** Both see video and hear audio clearly
5. **Test Mute:** Both mute/unmute audio successfully
6. **Test Network:** Toggle WiFi off/on, verify reconnection
7. **Exit:** Both leave session cleanly

**Success Criteria:** All steps complete without errors in < 5 minutes

## Resources

### Official 100ms Documentation
- Main Docs: https://www.100ms.live/docs
- iOS SDK: https://github.com/100mslive/100ms-ios-sdk
- Android SDK: https://github.com/100mslive/100ms-android
- React Native: https://github.com/100mslive/100ms-react-native
- Network Testing Guide: https://www.100ms.live/blog/network-reliability-test

### Testing Tools
- **Network Link Conditioner** (Mac/iOS): Built into Xcode
- **Charles Proxy** (Android): https://www.charlesproxy.com
- **Speedtest.net**: For bandwidth verification
- **BrowserStack**: For cross-device testing

### Support Channels
- 100ms Discord: https://100ms.live/discord
- WholeWellness Support: contact@wholewellness-coaching.org

## Conclusion

Testing 100ms video on mobile requires:
1. **Real devices** (simulators insufficient)
2. **Network condition testing** (bandwidth, switching, blips)
3. **Cross-platform verification** (iOS + Android)
4. **Performance monitoring** (battery, FPS, launch time)
5. **CSP configuration** (critical for iOS compatibility)

Follow this guide systematically to ensure robust video conferencing experience for all WholeWellness coaches and clients.

---
**Last Updated:** November 2025
**Platform Version:** @100mslive/roomkit-react HMSPrebuilt
