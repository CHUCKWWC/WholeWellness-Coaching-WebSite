import { GoogleDriveService } from './google-drive-service';

// Sample course materials to upload for demonstration
const sampleMaterials = [
  {
    courseId: 1,
    courseName: "Introduction to Wellness Coaching",
    materials: [
      {
        name: "Welcome to Wellness Coaching.pdf",
        content: "Sample PDF content for introduction module",
        mimeType: "application/pdf"
      },
      {
        name: "Coaching Ethics and Boundaries.pdf", 
        content: "Sample ethics guide content",
        mimeType: "application/pdf"
      },
      {
        name: "ICF Core Competencies Overview.pdf",
        content: "Sample competencies document",
        mimeType: "application/pdf"
      }
    ]
  },
  {
    courseId: 2,
    courseName: "Advanced Nutrition Fundamentals",
    materials: [
      {
        name: "Macronutrient Guidelines.pdf",
        content: "Sample nutrition guide content", 
        mimeType: "application/pdf"
      },
      {
        name: "Meal Planning Templates.pdf",
        content: "Sample meal planning templates",
        mimeType: "application/pdf"
      },
      {
        name: "Client Nutrition Assessment Tools.pdf",
        content: "Sample assessment tools",
        mimeType: "application/pdf"
      }
    ]
  },
  {
    courseId: 3,
    courseName: "Relationship Counseling Fundamentals", 
    materials: [
      {
        name: "Attachment Theory in Practice.pdf",
        content: "Sample attachment theory guide",
        mimeType: "application/pdf"
      },
      {
        name: "Communication Techniques Workbook.pdf",
        content: "Sample communication workbook",
        mimeType: "application/pdf"
      },
      {
        name: "Conflict Resolution Strategies.pdf",
        content: "Sample conflict resolution guide", 
        mimeType: "application/pdf"
      }
    ]
  }
];

export async function uploadSampleCourseMaterials() {
  const googleDriveService = new GoogleDriveService();
  
  try {
    console.log('Starting course materials upload...');
    
    for (const course of sampleMaterials) {
      console.log(`\nProcessing course: ${course.courseName}`);
      
      // Create course folder if it doesn't exist
      const folder = await googleDriveService.createCourseFolder(course.courseId, course.courseName);
      console.log(`Course folder: ${folder.folderId}`);
      
      // Upload materials to the folder
      for (const material of course.materials) {
        try {
          const fileBuffer = Buffer.from(material.content, 'utf8');
          const uploadedFile = await googleDriveService.uploadFile(
            material.name,
            fileBuffer,
            material.mimeType,
            folder.folderId
          );
          console.log(`✓ Uploaded: ${material.name} (${uploadedFile.id})`);
        } catch (error) {
          console.error(`✗ Failed to upload ${material.name}:`, error);
        }
      }
    }
    
    console.log('\n✅ Course materials upload completed!');
    return true;
  } catch (error) {
    console.error('❌ Upload process failed:', error);
    return false;
  }
}

// Export for use in routes
export { sampleMaterials };