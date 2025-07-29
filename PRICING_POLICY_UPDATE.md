# WholeWellness Coaching - Updated Pricing Policy

## Approved Pricing Structure
**Motion by Lisa Jones, seconded by Dr. Bobby Guillory, unanimously approved**

### 1. Live Coaching Package
- **Price**: $599 for six 50-minute sessions
- **Revenue Split**: 30% to WholeWellness admin, 70% to coaches
- **Payment Options**: Weekly or biweekly payments available
- **Discounts**: May be available for ongoing or returning clients
- **Session Length**: 50 minutes each
- **Total Sessions**: 6 sessions per package

### 2. AI Coaching Package
- **Price**: $299 for six sessions
- **Pricing Logic**: AI sessions priced at 50% of live coaching
- **Technology**: Guided by proprietary algorithms
- **Session Length**: 50 minutes each
- **Total Sessions**: 6 sessions per package
- **Availability**: 24/7 access

## Implementation Status

### ✅ Updated Components:
- **Subscribe.tsx**: New pricing plans with $299 AI and $599 Live coaching packages
- **Navigation**: Assessments link added to main navigation for visibility
- **Storage System**: Switched to Supabase for persistent data storage

### 🔄 In Progress:
- **AICoaching.tsx**: Updating pricing display and CTAs
- **Assessment Integration**: Connecting assessment results to coaching package upsells
- **Coach Revenue Split**: Backend implementation of 70/30 revenue sharing

### 📋 Pricing Display Strategy:
1. **AI Coaching Page**: Prominently display $299 pricing with "50% savings" messaging
2. **Subscribe Page**: Show both packages with Live Coaching marked as "Popular"
3. **Assessment Page**: Use assessments as lead generation for coaching packages
4. **Homepage**: Feature coaching packages in hero/CTA sections

## Revenue Optimization Features

### Package Structure:
1. **AI Coaching Package** ($299)
   - 6 AI coaching sessions
   - 24/7 availability
   - Progress tracking
   - Resource library access

2. **Live Coaching Package** ($599) [POPULAR]
   - 6 live coaching sessions
   - Certified professional coaches
   - Weekly/biweekly scheduling
   - Video capabilities
   - Priority support

3. **Combined Package** ($799)
   - 6 AI + 6 Live sessions
   - Best value proposition
   - Hybrid approach
   - $99 savings vs separate packages

### Business Logic:
- AI coaching positioned as accessible entry point
- Live coaching as premium tier with human connection
- Combined package for maximum customer lifetime value
- Assessment results drive coaching package conversions

---

**Implementation Date**: January 21, 2025
**Approved By**: Lisa Jones (Motion), Dr. Bobby Guillory (Second)
**Status**: Unanimously Approved