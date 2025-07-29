import type { Express } from "express";
import { storage } from "./storage.js";
import { requireAuth } from "./auth.js";

export function registerAdminCertificationRoutes(app: Express) {
  // Get all certification enrollments for admin
  app.get('/api/admin/certifications/enrollments', requireAuth, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      // Get all enrollments with user and course details
      const enrollments = await storage.getAllCertificationEnrollments();
      
      // Transform data for admin view
      const enrollmentDetails = await Promise.all(
        enrollments.map(async (enrollment: any) => {
          const user = await storage.getUser(enrollment.userId);
          const courses = await storage.getCertificationCourses();
          const course = courses.find((c: any) => c.id === enrollment.courseId);
          
          return {
            id: enrollment.id || `${enrollment.userId}_${enrollment.courseId}`,
            userId: enrollment.userId,
            userName: user ? `${user.firstName} ${user.lastName}` : 'Unknown User',
            userEmail: user?.email || 'No email',
            courseId: enrollment.courseId,
            courseTitle: course?.title || 'Unknown Course',
            enrollmentDate: enrollment.enrollmentDate || new Date().toISOString(),
            status: enrollment.status || 'active',
            progress: enrollment.progress || 0,
            completedModules: enrollment.completedModules?.length || 0,
            totalModules: course?.syllabus?.modules?.length || 4,
            certificateIssued: enrollment.certificateIssued || false,
            certificateId: enrollment.certificateId
          };
        })
      );

      res.json(enrollmentDetails);
    } catch (error) {
      console.error('Error fetching enrollment details:', error);
      res.status(500).json({ error: 'Failed to fetch enrollments' });
    }
  });

  // Get certification courses for admin
  app.get('/api/admin/certifications/courses', requireAuth, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const courses = await storage.getCertificationCourses();
      
      // Add enrollment stats to each course
      const coursesWithStats = await Promise.all(
        courses.map(async (course: any) => {
          const enrollments = await storage.getCertificationEnrollmentsByCourse(course.id);
          const completedEnrollments = enrollments.filter((e: any) => e.status === 'completed').length;
          
          return {
            ...course,
            enrollmentCount: enrollments.length,
            completionRate: enrollments.length > 0 ? Math.round((completedEnrollments / enrollments.length) * 100) : 0
          };
        })
      );

      res.json(coursesWithStats);
    } catch (error) {
      console.error('Error fetching courses:', error);
      res.status(500).json({ error: 'Failed to fetch courses' });
    }
  });

  // Get certification analytics
  app.get('/api/admin/certifications/analytics', requireAuth, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const enrollments = await storage.getAllCertificationEnrollments();
      const courses = await storage.getCertificationCourses();
      
      const analytics = {
        totalEnrollments: enrollments.length,
        activeCourses: courses.filter((c: any) => c.isActive).length,
        certificatesIssued: enrollments.filter((e: any) => e.certificateIssued).length,
        averageProgress: enrollments.length > 0 
          ? Math.round(enrollments.reduce((sum: number, e: any) => sum + (e.progress || 0), 0) / enrollments.length)
          : 0
      };

      res.json(analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  });

  // Enroll user in certification course
  app.post('/api/admin/certifications/enroll', requireAuth, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { userId, courseId } = req.body;
      
      if (!userId || !courseId) {
        return res.status(400).json({ error: 'User ID and Course ID are required' });
      }

      const enrollmentData = {
        userId,
        courseId,
        enrollmentDate: new Date(),
        status: 'active',
        progress: 0,
        completedModules: [],
        certificateIssued: false
      };

      await storage.createCertificationEnrollment(enrollmentData);
      
      res.json({ success: true, message: 'User enrolled successfully' });
    } catch (error) {
      console.error('Error enrolling user:', error);
      res.status(500).json({ error: 'Failed to enroll user' });
    }
  });

  // Update enrollment status
  app.patch('/api/admin/certifications/enrollments/:enrollmentId', requireAuth, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { enrollmentId } = req.params;
      const { status } = req.body;
      
      await storage.updateCertificationEnrollment(enrollmentId, { status });
      
      res.json({ success: true, message: 'Enrollment updated successfully' });
    } catch (error) {
      console.error('Error updating enrollment:', error);
      res.status(500).json({ error: 'Failed to update enrollment' });
    }
  });

  // Issue certificate
  app.post('/api/admin/certifications/issue-certificate/:enrollmentId', requireAuth, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { enrollmentId } = req.params;
      
      // Generate certificate ID
      const certificateId = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      await storage.updateCertificationEnrollment(enrollmentId, {
        certificateIssued: true,
        certificateId,
        status: 'completed'
      });
      
      res.json({ 
        success: true, 
        message: 'Certificate issued successfully',
        certificateId 
      });
    } catch (error) {
      console.error('Error issuing certificate:', error);
      res.status(500).json({ error: 'Failed to issue certificate' });
    }
  });

  // Export certification data
  app.get('/api/admin/certifications/export', requireAuth, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const enrollments = await storage.getAllCertificationEnrollments();
      
      // Transform to CSV format
      const csvData = enrollments.map((enrollment: any) => ({
        'User ID': enrollment.userId,
        'Course ID': enrollment.courseId,
        'Enrollment Date': enrollment.enrollmentDate,
        'Status': enrollment.status,
        'Progress': `${enrollment.progress}%`,
        'Certificate Issued': enrollment.certificateIssued ? 'Yes' : 'No',
        'Certificate ID': enrollment.certificateId || 'N/A'
      }));

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=certifications.csv');
      
      // Simple CSS conversion (in a real app, use a proper CSV library)
      const headers = Object.keys(csvData[0] || {});
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => headers.map(header => row[header as keyof typeof row]).join(','))
      ].join('\n');
      
      res.send(csvContent);
    } catch (error) {
      console.error('Error exporting data:', error);
      res.status(500).json({ error: 'Failed to export data' });
    }
  });
}