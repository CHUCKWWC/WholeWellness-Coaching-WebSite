import { google } from 'googleapis';

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

export class GoogleDriveService {
  private drive: any;
  private auth: any;

  constructor() {
    this.initializeAuth();
  }

  private async initializeAuth() {
    try {
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

  async createCourseFolder(courseId: number, courseName: string, parentFolderId?: string) {
    if (!this.drive) {
      console.error('Google Drive not configured');
      return { success: false, folderId: null };
    }

    try {
      const folderMetadata = {
        name: `${courseName} - Course Materials`,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentFolderId ? [parentFolderId] : undefined
      };

      const response = await this.drive.files.create({
        requestBody: folderMetadata,
        fields: 'id,name,webViewLink'
      });

      console.log(`Created course folder: ${response.data.name} (${response.data.id})`);
      return { 
        success: true, 
        folderId: response.data.id,
        name: response.data.name,
        webViewLink: response.data.webViewLink 
      };
    } catch (error) {
      console.error('Error creating course folder:', error);
      return { success: false, folderId: null };
    }
  }

  async uploadFile(fileName: string, fileBuffer: Buffer, mimeType: string, parentFolderId: string) {
    if (!this.drive || !parentFolderId) {
      console.error('Google Drive not configured or folder ID missing');
      return null;
    }

    try {
      const fileMetadata = {
        name: fileName,
        parents: [parentFolderId]
      };

      const media = {
        mimeType: mimeType,
        body: fileBuffer,
      };

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id,name,size,createdTime,mimeType,thumbnailLink,webViewLink',
      });

      return {
        id: response.data.id,
        name: response.data.name,
        type: this.getFileType(response.data.mimeType),
        url: response.data.webViewLink,
        thumbnailUrl: response.data.thumbnailLink,
        size: response.data.size ? this.formatFileSize(parseInt(response.data.size)) : undefined,
        uploadedAt: response.data.createdTime
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    }
  }

  async listCourseFiles(folderId: string): Promise<CourseMaterial[]> {
    if (!this.drive || !folderId) {
      return [];
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
      return [];
    }
  }

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

  private getFileType(mimeType: string): 'video' | 'document' | 'image' | 'other' {
    if (mimeType.includes('video')) return 'video';
    if (mimeType.includes('document') || mimeType.includes('pdf') || mimeType.includes('text')) return 'document';
    if (mimeType.includes('image')) return 'image';
    return 'other';
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}