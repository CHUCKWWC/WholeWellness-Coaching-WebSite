import { storage } from './server/storage.js';

async function enrollAllCoachesInCertification() {
  console.log('🎓 Enrolling All Coaches in Advanced Wellness Coaching Certification');
  
  const certificationCourseId = 'course-1'; // Advanced Wellness Coaching Certification
  const enrollmentDate = new Date();
  
  try {
    // Get all users with coach role
    const allUsers = await storage.getAllUsers();
    const coaches = allUsers.filter(user => user.role === 'coach');
    
    console.log(`Found ${coaches.length} coaches to enroll:`);
    coaches.forEach(coach => {
      console.log(`- ${coach.firstName} ${coach.lastName} (${coach.email})`);
    });
    
    // Enroll each coach in the certification course
    for (const coach of coaches) {
      try {
        const enrollmentData = {
          userId: coach.id,
          courseId: certificationCourseId,
          enrollmentDate: enrollmentDate,
          status: 'active',
          progress: 0,
          completedModules: [],
          certificateIssued: false
        };
        
        await storage.createCertificationEnrollment(enrollmentData);
        console.log(`✅ Enrolled: ${coach.firstName} ${coach.lastName}`);
        
        // Create progress tracking for each module
        const courseModules = [
          { moduleId: 1, title: 'Advanced Coaching Techniques', order: 1 },
          { moduleId: 2, title: 'Behavior Change Psychology', order: 2 },
          { moduleId: 3, title: 'Wellness Assessment Methods', order: 3 },
          { moduleId: 4, title: 'Client Relationship Management', order: 4 }
        ];
        
        for (const module of courseModules) {
          const progressData = {
            enrollmentId: `${coach.id}_${certificationCourseId}`,
            moduleId: module.moduleId,
            status: module.order === 1 ? 'not_started' : 'locked',
            score: null,
            attempts: 0,
            timeSpent: 0,
            lastAccessed: null
          };
          
          await storage.createModuleProgress(progressData);
        }
        
      } catch (error) {
        console.error(`❌ Error enrolling ${coach.email}:`, error.message);
      }
    }
    
    console.log('\n🎉 Coach certification enrollment completed!');
    console.log(`\n📊 Enrollment Summary:`);
    console.log(`- Course: Advanced Wellness Coaching Certification`);
    console.log(`- Coaches Enrolled: ${coaches.length}`);
    console.log(`- Enrollment Date: ${enrollmentDate.toISOString().split('T')[0]}`);
    console.log(`- Status: Active`);
    console.log(`- Available Modules: 4 professional development modules`);
    
  } catch (error) {
    console.error('❌ Error during enrollment process:', error);
  }
}

// Run the enrollment
enrollAllCoachesInCertification().catch(console.error);