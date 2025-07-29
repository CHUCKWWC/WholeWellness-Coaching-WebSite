# Subdomain Setup Guide for Wholewellness Coaching Platform

## Quick Setup Steps

### 1. Deploy Your Platform
Click the "Deploy" button in Replit to make your platform live. You'll receive a URL like `your-app-name.replit.app`

### 2. Choose Your Subdomain
Recommended options:
- `portal.wholewellnesscoaching.com`
- `coaching.wholewellnesscoaching.com`
- `members.wholewellnesscoaching.com`

### 3. DNS Configuration

#### Method A: CNAME Record (Recommended)
In your domain provider's DNS settings:
```
Type: CNAME
Host: portal
Target: your-app-name.replit.app
TTL: 300
```

#### Method B: A Record (If CNAME fails)
```
Type: A
Host: portal
IP Address: [Get from Replit deployment]
TTL: 300
```

### 4. SSL Certificate
Replit automatically provides SSL certificates for custom domains. After DNS propagation (5-60 minutes), your subdomain will be secure with HTTPS.

### 5. Update Main Website Links

#### On Your Wix Site
Add navigation links to your new coaching platform:
- Menu item: "Coaching Portal" → `https://portal.yoursite.com`
- Call-to-action buttons linking to specific features:
  - "Start AI Coaching" → `https://portal.yoursite.com/ai-coaching`
  - "Make a Donation" → `https://portal.yoursite.com/donate`
  - "Member Portal" → `https://portal.yoursite.com/member-portal`

### 6. Branding Consistency

#### Update Platform Branding
Match your Wix site colors and fonts in the coaching platform:
- Logo: Upload your organization logo
- Colors: Update primary/secondary colors in `client/src/index.css`
- Fonts: Import matching Google Fonts

#### Cross-Site Navigation
- Add "Back to Main Site" link in platform header
- Ensure consistent messaging between both sites

## Technical Benefits

### Performance
- Dedicated server resources for the coaching platform
- Faster loading than embedded widgets
- Full database capabilities for user data

### Features Preserved
- All AI coaching functionality
- Real-time impact dashboard
- Member engagement system
- Complete donation processing
- Comprehensive analytics

### SEO Advantages
- Subdomain inherits main domain authority
- Separate content optimization
- Dedicated sitemap for coaching content

## User Experience Flow

1. **Discovery**: Users find coaching services on main Wix site
2. **Transition**: Clear call-to-action buttons guide to coaching portal
3. **Engagement**: Full platform experience on subdomain
4. **Return**: Easy navigation back to main site

## Maintenance

### Updates
- Platform updates deploy automatically
- No disruption to main Wix site
- Independent scaling based on usage

### Monitoring
- Separate analytics for coaching platform
- User journey tracking across both sites
- Performance monitoring for subdomain

## Support Integration

### Help Documentation
- Link coaching platform help docs from main site
- Consistent support contact information
- Unified user support experience

### Contact Forms
- Platform contact forms can reference main site services
- Cross-referencing between sites for comprehensive support

This setup provides the best of both worlds: your established Wix presence with the advanced coaching platform capabilities running independently on a subdomain.