// Test script to upload course materials directly
import { GoogleDriveService } from './server/google-drive-service.js';

async function uploadCourseMaterials() {
  console.log('🚀 Starting course materials upload...');
  
  const googleDriveService = new GoogleDriveService();
  
  // Sample materials to upload
  const sampleMaterials = [
    {
      courseId: 1,
      courseName: "Introduction to Wellness Coaching",
      materials: [
        {
          name: "Welcome to Wellness Coaching.pdf",
          content: `# Welcome to Wellness Coaching

## Course Overview
This comprehensive introduction covers fundamental principles, ethics, and core competencies for effective wellness coaching.

## Learning Objectives
- Understand the role and scope of wellness coaching
- Learn ICF core competencies and ethical guidelines
- Develop foundational coaching skills and techniques
- Practice creating safe, supportive coaching environments

## Key Topics
- Professional coaching foundations
- Client-coach relationship dynamics
- Ethical practice standards
- Communication techniques`,
          mimeType: "text/plain"
        },
        {
          name: "Coaching Ethics and Boundaries Guide.pdf",
          content: `# Professional Ethics and Boundaries

## Ethical Standards
- Confidentiality and privacy protection
- Informed consent procedures
- Professional competence requirements
- Client autonomy respect

## Boundary Management
- Professional vs personal relationships
- Dual relationship awareness
- Crisis intervention protocols
- Referral guidelines`,
          mimeType: "text/plain"
        },
        {
          name: "ICF Core Competencies Reference.pdf",
          content: `# ICF Core Competencies

## Foundation Level
1. Demonstrates Ethical Practice
2. Embodies Coaching Mindset

## Relationship Building
3. Establishes Agreements
4. Cultivates Trust and Safety
5. Maintains Presence

## Communication
6. Listens Actively
7. Evokes Awareness

## Learning Facilitation
8. Facilitates Client Growth`,
          mimeType: "text/plain"
        }
      ]
    },
    {
      courseId: 2,
      courseName: "Advanced Nutrition Fundamentals", 
      materials: [
        {
          name: "Macronutrient Planning Guide.pdf",
          content: `# Advanced Macronutrient Guidelines

## Protein Requirements
- Individual needs based on activity level
- Quality sources and amino acid profiles
- Optimal timing strategies

## Carbohydrate Management
- Glycemic index understanding
- Carb cycling methods
- Pre/post workout nutrition

## Healthy Fats
- Essential fatty acid functions
- Omega-3 to omega-6 ratios
- Fat-soluble vitamin support`,
          mimeType: "text/plain"
        },
        {
          name: "Client Assessment Tools.pdf",
          content: `# Nutrition Assessment Templates

## Initial Intake
- Current eating patterns
- Medical history review
- Food allergies/intolerances
- Previous diet experiences

## Progress Tracking
- Weekly check-in forms
- Body composition monitoring
- Energy/mood assessments
- Goal achievement metrics`,
          mimeType: "text/plain"
        }
      ]
    },
    {
      courseId: 3,
      courseName: "Relationship Counseling Fundamentals",
      materials: [
        {
          name: "Attachment Theory Application.pdf", 
          content: `# Attachment Theory in Practice

## Four Attachment Styles
1. Secure - healthy relationship patterns
2. Anxious - fear of abandonment
3. Avoidant - discomfort with intimacy
4. Disorganized - inconsistent patterns

## Practical Applications
- Identifying client attachment patterns
- Understanding relationship behaviors
- Developing secure attachment strategies
- Working with different attachment combinations`,
          mimeType: "text/plain"
        },
        {
          name: "Communication Techniques Workbook.pdf",
          content: `# Advanced Communication Methods

## Active Listening Skills
- Reflective listening techniques
- Nonverbal communication awareness
- Powerful questioning strategies
- Safe space creation

## Conflict Resolution
- De-escalation techniques
- Common ground identification
- Negotiation and compromise
- Repair and reconciliation processes`,
          mimeType: "text/plain"
        }
      ]
    }
  ];

  let totalUploaded = 0;
  let errors = [];

  try {
    for (const course of sampleMaterials) {
      console.log(`\n📁 Processing: ${course.courseName}`);
      
      // Create course folder
      const folder = await googleDriveService.createCourseFolder(course.courseId, course.courseName);
      console.log(`   Folder created: ${folder.folderId}`);
      
      // Upload materials
      for (const material of course.materials) {
        try {
          const fileBuffer = Buffer.from(material.content, 'utf8');
          const uploadedFile = await googleDriveService.uploadFile(
            material.name,
            fileBuffer,
            material.mimeType,
            folder.folderId
          );
          console.log(`   ✅ Uploaded: ${material.name}`);
          totalUploaded++;
        } catch (error) {
          console.log(`   ❌ Failed: ${material.name} - ${error.message}`);
          errors.push(`${material.name}: ${error.message}`);
        }
      }
    }
    
    console.log(`\n🎉 Upload Complete!`);
    console.log(`   Files uploaded: ${totalUploaded}`);
    if (errors.length > 0) {
      console.log(`   Errors: ${errors.length}`);
      errors.forEach(error => console.log(`   - ${error}`));
    }
    
  } catch (error) {
    console.error('❌ Upload process failed:', error);
  }
}

uploadCourseMaterials();