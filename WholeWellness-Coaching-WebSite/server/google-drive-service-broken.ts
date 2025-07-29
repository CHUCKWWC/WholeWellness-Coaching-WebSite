import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  createdTime: string;
  modifiedTime: string;
  webViewLink: string;
  webContentLink?: string;
  thumbnailLink?: string;
}

export interface CourseMaterial {
  id: string;
  name: string;
  type: 'video' | 'document' | 'image' | 'other';
  url: string;
  thumbnailUrl?: string;
  size?: string;
  uploadedAt: string;
}

class GoogleDriveService {
  private drive: any;
  private auth: any;

  constructor() {
    this.initializeAuth();
  }

  private async initializeAuth() {
    try {
      // Use service account credentials for server-to-server access
      const credentials = {
        type: "service_account",
        project_id: process.env.GOOGLE_PROJECT_ID,
        private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        client_id: process.env.GOOGLE_CLIENT_ID,
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      };

      if (!credentials.private_key || !credentials.client_email) {
        console.warn('Google Drive service account credentials not configured');
        return;
      }

      this.auth = new google.auth.GoogleAuth({
        credentials,
        scopes: [
          'https://www.googleapis.com/auth/drive.readonly',
          'https://www.googleapis.com/auth/drive.file'
        ]
      });

      this.drive = google.drive({ version: 'v3', auth: this.auth });
      console.log('Google Drive service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Google Drive service:', error);
    }
  }

  async listCourseFiles(folderId: string): Promise<CourseMaterial[]> {
    if (!this.drive || !folderId) {
      return this.getMockCourseMaterials();
    }

    try {
      const response = await this.drive.files.list({
        q: `'${folderId}' in parents and trashed = false`,
        fields: 'files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink,thumbnailLink)',
        orderBy: 'name'
      });

      const files: DriveFile[] = response.data.files || [];
      
      return files.map(file => ({
        id: file.id,
        name: file.name,
        type: this.getFileType(file.mimeType),
        url: file.webViewLink,
        thumbnailUrl: file.thumbnailLink,
        size: file.size ? this.formatFileSize(parseInt(file.size)) : undefined,
        uploadedAt: file.createdTime
      }));
    } catch (error) {
      console.error('Error fetching course files from Google Drive:', error);
      return this.getMockCourseMaterials();
    }
  }

  async getCourseFolder(courseId: number): Promise<string | null> {
    // Course folder mapping - in production, this would be stored in database
    const courseFolders: Record<number, string> = {
      1: process.env.COURSE_1_DRIVE_FOLDER_ID || '', // Introduction to Wellness Coaching
      2: process.env.COURSE_2_DRIVE_FOLDER_ID || '', // Advanced Nutrition Fundamentals  
      3: process.env.COURSE_3_DRIVE_FOLDER_ID || ''  // Relationship Counseling Fundamentals
    };

    return courseFolders[courseId] || null;
  }

  async uploadCourseFile(
    folderId: string, 
    fileName: string, 
    fileBuffer: Buffer, 
    mimeType: string
  ): Promise<CourseMaterial | null> {
    if (!this.drive || !folderId) {
      console.error('Google Drive not configured or folder ID missing');
      return null;
    }

    try {
      const fileMetadata = {
        name: fileName,
        parents: [folderId]
      };

      const media = {
        mimeType: mimeType,
        body: fileBuffer,
      };

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id,name,size,createdTime,mimeType,thumbnailLink',
      });

      return {
        id: response.data.id,
        name: response.data.name,
        type: this.getFileType(response.data.mimeType),
        url: `https://drive.google.com/file/d/${response.data.id}/view`,
        thumbnailUrl: response.data.thumbnailLink,
        size: response.data.size ? this.formatFileSize(parseInt(response.data.size)) : undefined,
        uploadedAt: response.data.createdTime
      };
    } catch (error) {
      console.error('Error uploading course file:', error);
      return null;
    }
  }

  async uploadFile(fileName: string, fileBuffer: Buffer, mimeType: string, parentFolderId: string) {
    return this.uploadCourseFile(parentFolderId, fileName, fileBuffer, mimeType);

      const media = {
        mimeType,
        body: fileBuffer
      };

      const response = await this.drive.files.create({
        resource: fileMetadata,
        media,
        fields: 'id,name,mimeType,size,createdTime,webViewLink,thumbnailLink'
      });

      const file = response.data;
      
      return {
        id: file.id,
        name: file.name,
        type: this.getFileType(file.mimeType),
        url: file.webViewLink,
        thumbnailUrl: file.thumbnailLink,
        size: file.size ? this.formatFileSize(parseInt(file.size)) : undefined,
        uploadedAt: file.createdTime
      };
    } catch (error) {
      console.error('Error uploading file to Google Drive:', error);
      return null;
    }
  }

  async createCourseFolder(courseName: string, parentFolderId?: string): Promise<string | null> {
    if (!this.drive) {
      console.error('Google Drive not configured');
      return null;
    }

    try {
      const folderMetadata = {
        name: `${courseName} - Course Materials`,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentFolderId ? [parentFolderId] : undefined
      };

      const response = await this.drive.files.create({
        resource: folderMetadata,
        fields: 'id,name,webViewLink'
      });

      console.log(`Created course folder: ${response.data.name} (${response.data.id})`);
      return response.data.id;
    } catch (error) {
      console.error('Error creating course folder:', error);
      return null;
    }
  }

  async shareFolder(folderId: string, email?: string): Promise<boolean> {
    if (!this.drive || !folderId) {
      return false;
    }

    try {
      // Make folder publicly viewable for course access
      await this.drive.permissions.create({
        fileId: folderId,
        resource: {
          role: 'reader',
          type: email ? 'user' : 'anyone',
          emailAddress: email
        }
      });

      console.log(`Shared folder ${folderId} with ${email || 'public access'}`);
      return true;
    } catch (error) {
      console.error('Error sharing folder:', error);
      return false;
    }
  }

  private getFileType(mimeType: string): 'video' | 'document' | 'image' | 'other' {
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.includes('document') || mimeType.includes('pdf') || mimeType.includes('text')) return 'document';
    return 'other';
  }

  private formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  private getMockCourseMaterials(): CourseMaterial[] {
    // Mock data when Google Drive is not configured
    return [
      {
        id: 'mock-video-1',
        name: 'Course Introduction Video',
        type: 'video',
        url: '#',
        thumbnailUrl: 'https://via.placeholder.com/300x200/4CAF50/white?text=Video',
        size: '45.2 MB',
        uploadedAt: new Date().toISOString()
      },
      {
        id: 'mock-doc-1',
        name: 'Course Handbook.pdf',
        type: 'document',
        url: '#',
        size: '2.1 MB',
        uploadedAt: new Date().toISOString()
      },
      {
        id: 'mock-doc-2',
        name: 'Practice Exercises Worksheet',
        type: 'document',
        url: '#',
        size: '856 KB',
        uploadedAt: new Date().toISOString()
      }
    ];
  }

  // Health check method
  async testConnection(): Promise<boolean> {
    if (!this.drive) {
      return false;
    }

    try {
      await this.drive.files.list({ pageSize: 1 });
      return true;
    } catch (error) {
      console.error('Google Drive connection test failed:', error);
      return false;
    }
  }
}

export const googleDriveService = new GoogleDriveService();