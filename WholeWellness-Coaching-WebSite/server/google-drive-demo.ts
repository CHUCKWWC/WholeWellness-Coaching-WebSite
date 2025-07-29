// Demo Google Drive service that works without API credentials
// This provides a fallback experience until Google Drive API is configured

interface DemoFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  webContentLink: string;
  thumbnailLink?: string;
  size?: string;
  createdTime: string;
  modifiedTime: string;
}

interface DemoFolder {
  id: string;
  name: string;
  files: DemoFile[];
  subfolders: DemoFolder[];
}

// Demo course files that would typically come from Google Drive
const demoFiles: DemoFile[] = [
  {
    id: "demo-1",
    name: "Advanced Wellness Coaching - Module 1.pdf",
    mimeType: "application/pdf",
    webViewLink: "#",
    webContentLink: "#",
    size: "2048576",
    createdTime: "2025-01-15T10:00:00Z",
    modifiedTime: "2025-01-20T14:30:00Z"
  },
  {
    id: "demo-2", 
    name: "Coaching Techniques Video Tutorial.mp4",
    mimeType: "video/mp4",
    webViewLink: "#",
    webContentLink: "#",
    thumbnailLink: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200",
    size: "52428800",
    createdTime: "2025-01-16T09:15:00Z",
    modifiedTime: "2025-01-18T11:45:00Z"
  },
  {
    id: "demo-3",
    name: "Client Assessment Worksheet.docx", 
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    webViewLink: "#",
    webContentLink: "#",
    size: "1024000",
    createdTime: "2025-01-17T13:20:00Z",
    modifiedTime: "2025-01-19T16:10:00Z"
  },
  {
    id: "demo-4",
    name: "Nutrition Planning Template.xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
    webViewLink: "#",
    webContentLink: "#",
    size: "512000",
    createdTime: "2025-01-18T08:30:00Z",
    modifiedTime: "2025-01-21T12:00:00Z"
  },
  {
    id: "demo-5",
    name: "Behavior Change Strategies Presentation.pptx",
    mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    webViewLink: "#", 
    webContentLink: "#",
    thumbnailLink: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200",
    size: "4096000",
    createdTime: "2025-01-19T15:45:00Z",
    modifiedTime: "2025-01-22T09:30:00Z"
  },
  {
    id: "demo-6",
    name: "Course Resources and References.pdf",
    mimeType: "application/pdf",
    webViewLink: "#",
    webContentLink: "#", 
    size: "1536000",
    createdTime: "2025-01-20T11:00:00Z",
    modifiedTime: "2025-01-23T14:15:00Z"
  }
];

class GoogleDriveDemoService {
  /**
   * Get demo course files for testing purposes
   */
  async getCourseFiles(folderId: string): Promise<DemoFile[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return demoFiles.map(file => ({
      ...file,
      webViewLink: `https://drive.google.com/file/d/${file.id}/view`,
      webContentLink: `https://drive.google.com/uc?id=${file.id}&export=download`
    }));
  }

  /**
   * Get demo folder structure
   */
  async getCourseFolderStructure(folderId: string): Promise<DemoFolder> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return {
      id: folderId,
      name: "Wellness Coaching Course Materials",
      files: demoFiles,
      subfolders: [
        {
          id: "subfolder-1",
          name: "Module 1 - Foundation",
          files: demoFiles.slice(0, 2),
          subfolders: []
        },
        {
          id: "subfolder-2", 
          name: "Module 2 - Advanced Techniques",
          files: demoFiles.slice(2, 4),
          subfolders: []
        },
        {
          id: "subfolder-3",
          name: "Resources & Templates",
          files: demoFiles.slice(4),
          subfolders: []
        }
      ]
    };
  }

  /**
   * Search demo files
   */
  async searchFiles(query: string, folderId?: string): Promise<DemoFile[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return demoFiles.filter(file => 
      file.name.toLowerCase().includes(query.toLowerCase())
    );
  }

  /**
   * Get demo download URL
   */
  async getDownloadUrl(fileId: string): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return `https://drive.google.com/uc?id=${fileId}&export=download`;
  }

  /**
   * Initialize demo service (always returns true)
   */
  async initialize(): Promise<boolean> {
    return true;
  }
}

export const googleDriveDemoService = new GoogleDriveDemoService();
export { DemoFile, DemoFolder };