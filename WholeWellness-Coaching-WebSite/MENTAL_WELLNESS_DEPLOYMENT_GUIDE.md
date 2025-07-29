# Mental Wellness Hub Deployment Guide

## Quick Deployment Steps

### Option 1: One-Click SQL Deployment (Recommended)
1. Open your Supabase dashboard at https://supabase.com/dashboard
2. Navigate to your project
3. Go to the "SQL Editor" tab
4. Copy and paste the contents of `deploy-mental-wellness-tables.sql` into the SQL editor
5. Click "Run" to execute the script
6. Verify the tables are created in the "Table Editor" tab

### Option 2: Manual Table Creation
If you prefer to create tables manually:
1. Go to Supabase Table Editor
2. Create the following tables in order:
   - `mental_wellness_resources`
   - `emergency_contacts` 
   - `wellness_assessments`
   - `personalized_recommendations`
   - `resource_usage_analytics`

### Option 3: Node.js Script Deployment
Run this command after tables are created:
```bash
node deploy-mental-wellness-direct.js
```

## Database Schema Overview

### Core Tables Created:
1. **mental_wellness_resources** - Main resource database
2. **emergency_contacts** - Crisis hotlines and emergency support
3. **wellness_assessments** - User wellness evaluations
4. **personalized_recommendations** - AI-driven resource suggestions
5. **resource_usage_analytics** - Usage tracking and analytics

### Sample Data Included:
- 10 verified mental wellness resources
- 5 national emergency contact numbers
- Crisis hotlines (988, 741741, etc.)
- Professional therapy services
- Mindfulness and meditation resources

## Features Deployed

### ✅ Mental Wellness Resource Hub
- **Search & Filter**: Find resources by category, type, and keywords
- **Crisis Support**: Immediate access to emergency hotlines
- **Resource Categories**: Anxiety, Depression, Crisis, Therapy, Mindfulness
- **Multi-language Support**: English and Spanish resources
- **Rating System**: Community-rated resource quality
- **Usage Analytics**: Track resource effectiveness

### ✅ Emergency Support System
- **One-Click Crisis Access**: 988 Suicide Prevention Lifeline
- **Text Crisis Support**: 741741 Crisis Text Line
- **Domestic Violence Support**: National hotline integration
- **24/7 Availability**: Round-the-clock crisis support
- **Multi-language**: English and Spanish support

### ✅ Personalized Recommendations
- **AI-Powered Suggestions**: Tailored resource recommendations
- **User Behavior Tracking**: Smart learning from user preferences
- **Follow-up Integration**: Automated care coordination
- **Progress Tracking**: Wellness journey monitoring

### ✅ Analytics & Insights
- **Usage Metrics**: Resource access patterns
- **Effectiveness Tracking**: User feedback collection
- **Performance Analytics**: Resource optimization data
- **Crisis Intervention Metrics**: Emergency response tracking

## Integration Points

### Frontend Integration
- **Navigation**: Mental wellness hub added to main navigation
- **Responsive Design**: Mobile-optimized interface
- **Accessibility**: Screen reader compatible
- **Crisis Mode**: Immediate emergency access

### Backend Integration
- **API Endpoints**: RESTful resource access
- **Real-time Updates**: Live resource updates
- **Authentication**: Secure user tracking
- **Analytics**: Comprehensive usage analytics

## Post-Deployment Verification

After deployment, verify these features work:

1. **Resource Search**: Test filtering by category
2. **Emergency Access**: Verify crisis hotline display
3. **User Analytics**: Check usage tracking
4. **Recommendation Engine**: Test personalized suggestions
5. **Mobile Responsiveness**: Verify mobile interface

## Troubleshooting

### Common Issues:
1. **Tables Not Found**: Run the SQL deployment script
2. **RLS Errors**: Check Row Level Security policies
3. **Data Not Loading**: Verify Supabase connection
4. **Search Not Working**: Check mental_wellness_resources table

### Debug Commands:
```bash
# Test database connection
node test-database-connection.js

# Check table existence
# Run in Supabase SQL Editor:
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%mental%';

# Verify sample data
SELECT COUNT(*) FROM mental_wellness_resources;
SELECT COUNT(*) FROM emergency_contacts;
```

## Next Steps

After successful deployment:
1. Test the mental wellness hub at `/mental-wellness`
2. Verify emergency contacts display properly
3. Test search and filtering functionality
4. Check resource usage analytics
5. Customize resources for your specific needs

## Database Schema Details

The complete schema includes:
- **5 Core Tables**: Comprehensive mental wellness data structure
- **RLS Policies**: Secure data access controls
- **Sample Data**: 10 resources + 5 emergency contacts
- **Analytics Functions**: Usage tracking and reporting
- **Multi-language Support**: English and Spanish content

## Security Features

- **Row Level Security**: Enabled on all tables
- **User Privacy**: Personal data protection
- **Crisis Safety**: Secure emergency contact access
- **Analytics Privacy**: Anonymized usage tracking
- **GDPR Compliance**: Data protection standards

The mental wellness hub is now ready for production use with comprehensive crisis support, resource discovery, and user analytics capabilities.