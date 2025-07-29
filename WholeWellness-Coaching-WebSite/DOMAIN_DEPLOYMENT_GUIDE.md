# Domain Deployment Guide for wholewellnesscoaching.org

## Overview
This guide covers deploying the Whole Wellness Coaching platform to your custom domain wholewellnesscoaching.org hosted on GoDaddy.

## Prerequisites
- Domain: wholewellnesscoaching.org (GoDaddy)
- Replit deployment ready
- Database configured (Neon/Supabase)
- Environment variables set

## Deployment Steps

### 1. Replit Deployment
1. Click "Deploy" button in Replit
2. Configure deployment settings:
   - Choose "Autoscale" deployment type
   - Set environment variables
   - Configure custom domain

### 2. Custom Domain Configuration

#### A. In Replit Console:
1. Go to Deployments tab
2. Click "Add Custom Domain"
3. Enter: wholewellnesscoaching.org
4. Copy the provided CNAME record

#### B. In GoDaddy DNS Management:
1. Log into GoDaddy account
2. Go to Domain Management → DNS
3. Add CNAME record:
   - Type: CNAME
   - Name: @ (for root domain)
   - Value: [Replit provided CNAME]
   - TTL: 1 hour

4. Add www redirect (optional):
   - Type: CNAME
   - Name: www
   - Value: wholewellnesscoaching.org
   - TTL: 1 hour

### 3. SSL Certificate
- Replit automatically provides SSL certificates
- Domain will be accessible via https://wholewellnesscoaching.org

### 4. Environment Variables Required
```
DATABASE_URL=your_database_connection_string
SESSION_SECRET=your_session_secret
OPENAI_API_KEY=your_openai_key (for AI coaching)
STRIPE_SECRET_KEY=your_stripe_key (for donations)
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
```

### 5. Domain Propagation
- DNS changes may take 24-48 hours to propagate
- Check propagation status at: whatsmydns.net

## Platform Features Ready for Production

### Core Features ✅
- User authentication and member portal
- Donation processing with Stripe
- AI coaching system (6 specialized agents)
- Coach management dashboard
- AI coaching portal for weight loss coaching

### AI Coaching Sessions ✅
- Nutritionist AI coach
- Fitness trainer AI coach
- Behavior coach
- Wellness coordinator
- Accountability partner
- Meal prep assistant

### Member Benefits ✅
- Reward points system
- Membership levels (Bronze, Silver, Gold, Platinum)
- Community impact dashboard
- AI coaching access

### Coach Features ✅
- Professional onboarding
- Client management
- Google Meet integration
- Session notes and tracking
- Automated messaging
- Payment processing

## Post-Deployment Checklist

### Technical Verification
- [ ] Domain resolves to correct site
- [ ] SSL certificate active
- [ ] All forms submitting correctly
- [ ] Database connections working
- [ ] Payment processing functional
- [ ] Email notifications working

### Content Review
- [ ] All founder information accurate
- [ ] Mission statement reflects organization
- [ ] Contact information updated
- [ ] Legal pages (privacy, terms) current
- [ ] Donation amounts and descriptions correct

### User Testing
- [ ] Registration/login flow
- [ ] Donation process end-to-end
- [ ] AI coaching sessions functional
- [ ] Coach dashboard accessible
- [ ] AI coaching portal working

## Ongoing Maintenance

### Regular Updates
- Monitor user feedback and testimonials
- Update AI coaching responses based on usage
- Review and adjust donation preset amounts
- Add new coach profiles as team grows

### Analytics and Monitoring
- Set up Google Analytics (optional)
- Monitor deployment logs in Replit
- Track donation conversion rates
- Review AI coaching session feedback

## Support and Documentation
- Platform documentation: Available in project root
- Technical support: Replit support for hosting issues
- Feature requests: Can be implemented through code updates

## Backup and Security
- Database backups: Handled by database provider
- Code backups: Stored in Replit Git repository
- SSL security: Automatically maintained by Replit
- User data protection: Encrypted sessions and secure storage

---

## Quick Reference Commands

### Replit Console Commands
```bash
# Check deployment status
replit deploy status

# View deployment logs
replit deploy logs

# Update environment variables
replit secrets set VARIABLE_NAME=value
```

### Database Commands (if needed)
```bash
# Run database migrations
npm run db:migrate

# Seed database with initial data
npm run db:seed
```

This deployment will provide your organization with a professional, full-featured platform accessible at wholewellnesscoaching.org.