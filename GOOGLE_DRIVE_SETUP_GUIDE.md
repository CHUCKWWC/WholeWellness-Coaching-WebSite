# Google Drive Integration Setup Guide

## Overview
This guide explains how to configure Google Drive integration for certification course materials storage and access.

## Why Google Drive Integration?

The platform uses Google Drive to:
- ✅ Store and organize course videos, documents, and resources
- ✅ Provide secure access to course materials for authenticated users
- ✅ Allow easy content management and updates by administrators
- ✅ Enable scalable file storage without server limitations
- ✅ Maintain professional course material organization

## Setup Requirements

### 1. Google Cloud Project Setup

#### Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Enable the Google Drive API:
   - Navigate to "APIs & Services" → "Library"
   - Search for "Google Drive API"
   - Click "Enable"

#### Create Service Account
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "Service Account"
3. Fill in service account details:
   - **Name**: `wholewellness-drive-service`
   - **Description**: `Service account for course materials management`
4. Click "Create and Continue"
5. Grant roles:
   - **Google Drive API** → **Drive Admin** (for full access)
   - Or **Drive Editor** (for file management)
6. Click "Done"

#### Generate Service Account Key
1. Find your service account in the credentials list
2. Click on the service account email
3. Go to "Keys" tab
4. Click "Add Key" → "Create New Key"
5. Select "JSON" format
6. Download the JSON file (keep it secure!)

### 2. Environment Variables Configuration

Add these variables to your environment (Replit Secrets or `.env` file):

```bash
# Google Drive Service Account Credentials
GOOGLE_PROJECT_ID=your-project-id
GOOGLE_PRIVATE_KEY_ID=key-id-from-json
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key\n-----END PRIVATE KEY-----\n"
GOOGLE_CLIENT_EMAIL=service-account@project.iam.gserviceaccount.com
GOOGLE_CLIENT_ID=client-id-from-json

# Course Folder IDs (created after folder setup)
COURSE_1_DRIVE_FOLDER_ID=folder-id-for-module-1
COURSE_2_DRIVE_FOLDER_ID=folder-id-for-module-2  
COURSE_3_DRIVE_FOLDER_ID=folder-id-for-module-3
```

### 3. Course Folders Creation

#### Option A: Automatic Creation (Recommended)
1. Login to your platform as an admin
2. Navigate to admin panel
3. Use the Google Drive test endpoint: `GET /api/admin/google-drive/test`
4. If connected, create folders: `POST /api/admin/google-drive/create-folders`
5. Copy the returned folder IDs to environment variables

#### Option B: Manual Creation
1. Login to [Google Drive](https://drive.google.com/)
2. Create main folder: "WholeWellness Certification Courses"
3. Inside, create 3 subfolders:
   - "Introduction to Wellness Coaching - Course Materials"
   - "Advanced Nutrition Fundamentals - Course Materials"
   - "Relationship Counseling Fundamentals - Course Materials"
4. Share each folder:
   - Right-click → "Share"
   - Add your service account email with "Editor" access
   - Copy each folder ID from the URL
5. Update environment variables with folder IDs

### 4. Course Materials Organization

#### Recommended Folder Structure
```
Course Materials/
├── Introduction to Wellness Coaching/
│   ├── Videos/
│   │   ├── 01-Introduction-45min.mp4
│   │   ├── 02-Core-Principles-20min.mp4
│   │   └── 03-Ethics-15min.mp4
│   ├── Documents/
│   │   ├── Course-Handbook.pdf
│   │   ├── Practice-Exercises.pdf
│   │   └── ICF-Core-Competencies.pdf
│   └── Resources/
│       ├── Checklists/
│       └── Templates/
├── Advanced Nutrition Fundamentals/
│   ├── Videos/
│   ├── Documents/
│   └── Interactive-Tools/
└── Relationship Counseling Fundamentals/
    ├── Videos/
    ├── Case-Studies/
    └── Assessment-Tools/
```

#### File Naming Conventions
- **Videos**: `Module-Topic-Duration.mp4` (e.g., `01-Introduction-45min.mp4`)
- **Documents**: `Descriptive-Name.pdf` (e.g., `Course-Handbook.pdf`)
- **Resources**: Clear, descriptive names for easy identification

## Testing the Integration

### 1. Connection Test
```bash
curl -X GET "https://your-domain.com/api/admin/google-drive/test" \
  -H "Authorization: Bearer your-jwt-token"
```

Expected response:
```json
{
  "success": true,
  "connected": true,
  "message": "Google Drive service is connected and working"
}
```

### 2. Course Materials Test
```bash
curl -X GET "https://your-domain.com/api/course-materials/1" \
  -H "Authorization: Bearer your-jwt-token"
```

Expected response:
```json
{
  "success": true,
  "courseId": 1,
  "folderId": "your-folder-id",
  "materials": [
    {
      "id": "file-id",
      "name": "Course Introduction Video",
      "type": "video",
      "url": "https://drive.google.com/file/d/...",
      "size": "45.2 MB",
      "uploadedAt": "2025-01-15T10:30:00.000Z"
    }
  ]
}
```

## User Experience Features

### For Students
- **Course Materials Access**: Direct links to Google Drive files
- **Video Streaming**: In-browser video playback for course content
- **Document Downloads**: PDF handbooks, worksheets, and resources
- **Progress Tracking**: Materials completed and accessed
- **Mobile Access**: Full mobile compatibility for course materials

### For Administrators
- **Easy Content Management**: Upload directly to Google Drive
- **Folder Organization**: Structured course material organization
- **Access Control**: Service account-based secure access
- **Bulk Operations**: Upload multiple files simultaneously
- **Version Control**: Google Drive's built-in version history

## Troubleshooting

### Common Issues

#### "Google Drive service not configured"
- ✅ Check all environment variables are set correctly
- ✅ Verify service account JSON key is valid
- ✅ Ensure Google Drive API is enabled in Google Cloud Console

#### "No Google Drive folder configured for this course"
- ✅ Set COURSE_X_DRIVE_FOLDER_ID environment variables
- ✅ Verify folder IDs are correct (from Google Drive URLs)
- ✅ Ensure service account has access to folders

#### "Permission denied" errors
- ✅ Share folders with service account email
- ✅ Grant "Editor" or "Viewer" permissions as needed
- ✅ Check service account has proper Google Cloud roles

#### Files not loading
- ✅ Verify files exist in the correct folders
- ✅ Check file sharing permissions
- ✅ Ensure file names don't contain special characters

### Debug Steps
1. **Test API Connection**: Use `/api/admin/google-drive/test` endpoint
2. **Check Logs**: Review server logs for Google API errors
3. **Verify Credentials**: Re-download service account JSON if needed
4. **Test Folder Access**: Manually access folders with service account
5. **Check Quotas**: Ensure Google Drive API quotas aren't exceeded

## Security Considerations

### Service Account Security
- ✅ Store private keys securely (environment variables, not code)
- ✅ Use minimal required permissions (Editor, not Owner)
- ✅ Rotate service account keys periodically
- ✅ Monitor API usage and access logs

### File Access Control
- ✅ Use service account for server-to-server access only
- ✅ Don't expose folder URLs directly to users
- ✅ Implement authentication checks before file access
- ✅ Consider implementing download limits or restrictions

## Production Deployment

### Checklist
- [ ] Google Cloud project created and APIs enabled
- [ ] Service account created with proper roles
- [ ] Environment variables configured in production
- [ ] Course folders created and shared
- [ ] Connection tested and working
- [ ] Course materials uploaded and organized
- [ ] User access tested on certification dashboard
- [ ] File permissions and security verified

### Monitoring
- Monitor Google Drive API usage quotas
- Track file access patterns and performance
- Set up alerts for API errors or service disruptions
- Regular backup of critical course materials

## Alternative Solutions

If Google Drive integration is not desired, alternative options include:

1. **Local File Storage**: Store files on server filesystem
2. **AWS S3 Integration**: Use Amazon S3 for file storage
3. **Dropbox Business**: Alternative cloud storage solution
4. **Azure Blob Storage**: Microsoft cloud storage option

Each alternative would require similar service integration patterns but different API configurations.

## Support

For implementation assistance:
1. Check server logs for specific error messages
2. Verify all environment variables are correctly set
3. Test Google Drive API access independently
4. Review Google Cloud Console for API usage and errors
5. Contact platform administrators for credential assistance

**Status**: Ready for implementation with proper Google Cloud setup