import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  webContentLink: string;
  thumbnailLink?: string;
  size?: string;
  createdTime: string;
  modifiedTime: string;
  parents?: string[];
}

interface DriveFolder {
  id: string;
  name: string;
  files: DriveFile[];
  subfolders: DriveFolder[];
}

class GoogleDriveService {
  private oauth2Client: OAuth2Client;
  private drive: any;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_DRIVE_CLIENT_ID,
      process.env.GOOGLE_DRIVE_CLIENT_SECRET,
      'https://wholewellnesscoaching.org/auth/google/callback'
    );

    // Set refresh token if available
    if (process.env.GOOGLE_DRIVE_REFRESH_TOKEN) {
      this.oauth2Client.setCredentials({
        refresh_token: process.env.GOOGLE_DRIVE_REFRESH_TOKEN
      });
    }

    this.drive = google.drive({ version: 'v3', auth: this.oauth2Client });
  }

  /**
   * Initialize Google Drive authentication
   */
  async initialize(): Promise<boolean> {
    try {
      // Test authentication by fetching user info
      await this.drive.about.get({ fields: 'user' });
      return true;
    } catch (error) {
      console.error('Google Drive authentication failed:', error);
      return false;
    }
  }

  /**
   * Get course files from a specific Google Drive folder
   */
  async getCourseFiles(folderId: string): Promise<DriveFile[]> {
    try {
      const response = await this.drive.files.list({
        q: `'${folderId}' in parents and trashed=false`,
        fields: 'files(id,name,mimeType,webViewLink,webContentLink,thumbnailLink,size,createdTime,modifiedTime,parents)',
        orderBy: 'name'
      });

      return response.data.files || [];
    } catch (error) {
      console.error('Error fetching course files:', error);
      throw new Error('Failed to fetch course files from Google Drive');
    }
  }

  /**
   * Get folder structure for course materials
   */
  async getCourseFolderStructure(folderId: string): Promise<DriveFolder> {
    try {
      // Get folder info
      const folderResponse = await this.drive.files.get({
        fileId: folderId,
        fields: 'id,name'
      });

      const folder: DriveFolder = {
        id: folderId,
        name: folderResponse.data.name,
        files: [],
        subfolders: []
      };

      // Get all contents of the folder
      const contentsResponse = await this.drive.files.list({
        q: `'${folderId}' in parents and trashed=false`,
        fields: 'files(id,name,mimeType,webViewLink,webContentLink,thumbnailLink,size,createdTime,modifiedTime,parents)',
        orderBy: 'name'
      });

      const contents = contentsResponse.data.files || [];

      // Separate files and folders
      for (const item of contents) {
        if (item.mimeType === 'application/vnd.google-apps.folder') {
          // Recursively get subfolder structure
          const subfolder = await this.getCourseFolderStructure(item.id!);
          folder.subfolders.push(subfolder);
        } else {
          folder.files.push(item as DriveFile);
        }
      }

      return folder;
    } catch (error) {
      console.error('Error fetching folder structure:', error);
      throw new Error('Failed to fetch folder structure from Google Drive');
    }
  }

  /**
   * Get file metadata and download URL
   */
  async getFileInfo(fileId: string): Promise<DriveFile> {
    try {
      const response = await this.drive.files.get({
        fileId,
        fields: 'id,name,mimeType,webViewLink,webContentLink,thumbnailLink,size,createdTime,modifiedTime,parents'
      });

      return response.data as DriveFile;
    } catch (error) {
      console.error('Error fetching file info:', error);
      throw new Error('Failed to fetch file information from Google Drive');
    }
  }

  /**
   * Generate a temporary download URL for a file
   */
  async getDownloadUrl(fileId: string): Promise<string> {
    try {
      const response = await this.drive.files.get({
        fileId,
        alt: 'media'
      }, {
        responseType: 'stream'
      });

      // For direct download, return the webContentLink
      const fileInfo = await this.getFileInfo(fileId);
      return fileInfo.webContentLink || fileInfo.webViewLink;
    } catch (error) {
      console.error('Error generating download URL:', error);
      throw new Error('Failed to generate download URL');
    }
  }

  /**
   * Search for files in Google Drive
   */
  async searchFiles(query: string, folderId?: string): Promise<DriveFile[]> {
    try {
      let searchQuery = `name contains '${query}' and trashed=false`;
      if (folderId) {
        searchQuery += ` and '${folderId}' in parents`;
      }

      const response = await this.drive.files.list({
        q: searchQuery,
        fields: 'files(id,name,mimeType,webViewLink,webContentLink,thumbnailLink,size,createdTime,modifiedTime,parents)',
        orderBy: 'relevance'
      });

      return response.data.files || [];
    } catch (error) {
      console.error('Error searching files:', error);
      throw new Error('Failed to search files in Google Drive');
    }
  }

  /**
   * Get sharing permissions for a file
   */
  async getFilePermissions(fileId: string): Promise<boolean> {
    try {
      const response = await this.drive.permissions.list({
        fileId,
        fields: 'permissions(role,type)'
      });

      // Check if file is publicly readable or shared
      const permissions = response.data.permissions || [];
      return permissions.some(p => p.type === 'anyone' || p.role === 'reader');
    } catch (error) {
      console.error('Error checking file permissions:', error);
      return false;
    }
  }

  /**
   * Create a course materials folder structure
   */
  async createCourseFolder(courseName: string, parentFolderId?: string): Promise<string> {
    try {
      const folderMetadata = {
        name: `${courseName} - Course Materials`,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentFolderId ? [parentFolderId] : undefined
      };

      const response = await this.drive.files.create({
        resource: folderMetadata,
        fields: 'id'
      });

      return response.data.id;
    } catch (error) {
      console.error('Error creating course folder:', error);
      throw new Error('Failed to create course folder in Google Drive');
    }
  }
}

export const googleDriveService = new GoogleDriveService();
export { DriveFile, DriveFolder };