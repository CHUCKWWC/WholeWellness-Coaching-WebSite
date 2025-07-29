import { GoogleDriveService } from './server/google-drive-service.js';

async function main() {
  console.log('🚀 Uploading course materials to Google Drive...');
  
  const googleDriveService = new GoogleDriveService();
  
  // Course materials to upload
  const courses = [
    {
      id: 1,
      name: "Introduction to Wellness Coaching",
      files: [
        {
          name: "Welcome to Wellness Coaching.pdf",
          content: `# Welcome to Wellness Coaching

## Course Overview
This comprehensive introduction to wellness coaching covers the fundamental principles, ethics, and core competencies needed to become an effective wellness coach.

## Learning Objectives
- Understand the role and scope of wellness coaching  
- Learn ICF core competencies and ethical guidelines
- Develop foundational coaching skills and techniques
- Practice creating a safe, supportive coaching environment

## Module Content
This module provides essential knowledge for beginning wellness coaches, including theoretical foundations and practical applications.

## Professional Standards
- Confidentiality and privacy protection
- Ethical practice guidelines
- Client-coach relationship boundaries
- Continuing education requirements`
        },
        {
          name: "Coaching Ethics and Boundaries.pdf",
          content: `# Coaching Ethics and Professional Boundaries

## Ethical Guidelines
Professional wellness coaches must maintain clear ethical standards and appropriate boundaries with clients.

## Key Principles
- Confidentiality and privacy protection
- Informed consent and clear agreements
- Professional competence and continuing education
- Respect for client autonomy and self-determination

## Boundary Management
Establishing and maintaining appropriate professional boundaries is essential for effective coaching relationships.

## Crisis Intervention
When to refer clients to licensed mental health professionals and emergency resources.`
        },
        {
          name: "ICF Core Competencies Overview.pdf", 
          content: `# ICF Core Competencies for Wellness Coaches

## Foundation
1. Demonstrates Ethical Practice
2. Embodies a Coaching Mindset

## Co-creating the Relationship  
3. Establishes and Maintains Agreements
4. Cultivates Trust and Safety
5. Maintains Presence

## Communicating Effectively
6. Listens Actively
7. Evokes Awareness

## Facilitating Learning and Results
8. Facilitates Client Growth

These competencies form the foundation of professional coaching practice and guide all client interactions.`
        }
      ]
    },
    {
      id: 2,
      name: "Advanced Nutrition Fundamentals",
      files: [
        {
          name: "Macronutrient Guidelines.pdf",
          content: `# Advanced Macronutrient Guidelines

## Protein Requirements
- Calculate individual protein needs based on activity level
- Quality protein sources and amino acid profiles  
- Timing protein intake for optimal results

## Carbohydrate Management
- Understanding glycemic index and load
- Carb cycling for different goals
- Pre and post-workout nutrition strategies

## Healthy Fats
- Essential fatty acids and their functions
- Omega-3 to omega-6 ratios
- Fat-soluble vitamin absorption optimization`
        },
        {
          name: "Meal Planning Templates.pdf",
          content: `# Professional Meal Planning Templates

## Client Assessment
Use these templates to create personalized meal plans based on:
- Individual caloric needs
- Dietary preferences and restrictions
- Lifestyle and schedule considerations  
- Health goals and medical conditions

## Weekly Planning Templates
- Breakfast options and variations
- Lunch combinations for busy schedules
- Dinner planning for families
- Healthy snack alternatives

## Shopping Lists and Prep Guides
Organized templates to streamline meal preparation and grocery shopping for clients.`
        }
      ]
    },
    {
      id: 3,
      name: "Relationship Counseling Fundamentals",
      files: [
        {
          name: "Attachment Theory in Practice.pdf",
          content: `# Attachment Theory in Relationship Coaching

## Four Attachment Styles
1. Secure Attachment - healthy relationship patterns
2. Anxious Attachment - fear of abandonment
3. Avoidant Attachment - discomfort with intimacy
4. Disorganized Attachment - inconsistent patterns

## Practical Applications
- Identifying attachment patterns in clients
- Helping clients understand their relationship behaviors
- Developing secure attachment strategies
- Working with couples with different attachment styles

## Therapeutic Interventions
Evidence-based approaches for addressing attachment issues in coaching relationships.`
        },
        {
          name: "Communication Techniques Workbook.pdf",
          content: `# Advanced Communication Techniques

## Active Listening Skills
- Reflective listening techniques
- Nonverbal communication awareness
- Asking powerful questions
- Creating safe spaces for sharing

## Conflict Resolution
- De-escalation strategies
- Finding common ground
- Negotiation and compromise techniques
- Repair and reconciliation processes

## Gottman Method Applications
- The Four Horsemen warning signs
- Building love maps
- Nurturing fondness and admiration
- Turning toward instead of away`
        }
      ]
    }
  ];

  let totalUploaded = 0;
  
  for (const course of courses) {
    console.log(`\n📁 Processing: ${course.name}`);
    
    try {
      // Create course folder
      const folder = await googleDriveService.createCourseFolder(course.id, course.name);
      console.log(`   Folder ID: ${folder.folderId}`);
      
      // Upload files
      for (const file of course.files) {
        try {
          const buffer = Buffer.from(file.content, 'utf8');
          const result = await googleDriveService.uploadFile(
            file.name,
            buffer, 
            'text/plain',
            folder.folderId
          );
          
          if (result) {
            console.log(`   ✅ ${file.name}`);
            totalUploaded++;
          } else {
            console.log(`   ❌ Failed: ${file.name}`);
          }
        } catch (error) {
          console.log(`   ❌ Error uploading ${file.name}: ${error.message}`);
        }
      }
    } catch (error) {
      console.log(`   ❌ Error processing ${course.name}: ${error.message}`);
    }
  }
  
  console.log(`\n🎉 Upload complete! ${totalUploaded} files uploaded successfully.`);
}

main().catch(console.error);