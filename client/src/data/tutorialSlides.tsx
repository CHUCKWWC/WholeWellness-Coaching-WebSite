import { HtmlSlide } from '@/components/TutorialSlideshow';
import {
  HomepageMockup,
  LoginMockup,
  AICoachingMockup,
  CoachesMockup,
  CoachProfileMockup,
  VideoSessionMockup,
  AppointmentsMockup,
  AdminDashboardMockup,
  UserManagementMockup,
  CoachApprovalMockup
} from '@/components/mockups';

// User Tutorial Slides (HTML mockup-based)
export const userTutorialSlides: HtmlSlide[] = [
  {
    type: 'html',
    title: "Welcome to WholeWellness",
    description: "Your journey to personal growth starts here",
    mockup: <HomepageMockup />,
    clickTargets: [
      {
        number: 1,
        label: 'Get Started Button',
        description: 'Click here to begin your onboarding journey and create your account',
        top: '12%',
        left: '8%',
        width: '130px',
        height: '40px'
      },
      {
        number: 2,
        label: 'AI Coaching Card - Most Popular',
        description: 'Start chatting with our 6 specialized AI coaches for $19.99/month',
        top: '42%',
        left: '6%',
        width: '44%',
        height: '120px'
      },
      {
        number: 3,
        label: 'Wellness Journey Card',
        description: 'Create a personalized wellness plan with AI-powered goal tracking',
        top: '42%',
        left: '52%',
        width: '44%',
        height: '120px'
      }
    ],
    tips: [
      'Press "/" anytime to search across the platform',
      'Use Alt+A for quick access to AI coaching',
      'Use Alt+W for wellness journey shortcuts',
      'Look for the "Quick Exit" button for safety'
    ]
  },
  {
    type: 'html',
    title: "AI Coaching - $19.99/month",
    description: "24/7 access to 6 specialized AI coaches",
    mockup: <AICoachingMockup />,
    clickTargets: [
      {
        number: 1,
        label: 'Start Chat with Any Coach',
        description: 'Click "Start Chat" on any coach card. Try Charlene for mindfulness or Bobby for mental health support',
        top: '18%',
        left: '6%',
        width: '28%',
        height: '105px'
      },
      {
        number: 2,
        label: 'Start Your Free Trial Button',
        description: 'Get 7 days free access to all 6 AI coaches, then $19.99/month. Cancel anytime',
        top: '65%',
        left: '25%',
        width: '50%',
        height: '35px'
      }
    ],
    tips: [
      'You must accept the medical disclaimer before chatting',
      'All conversations are private and confidential',
      'Each coach has unique specialties - choose based on your needs',
      'You can switch between coaches anytime during your subscription'
    ]
  },
  {
    type: 'html',
    title: "Sign In to Your Account",
    description: "Access your dashboard and coaching tools",
    mockup: <LoginMockup />,
    clickTargets: [
      {
        number: 1,
        label: 'Email Input Field',
        description: 'Enter your registered email address here',
        top: '28%',
        left: '25%',
        width: '50%',
        height: '36px'
      },
      {
        number: 2,
        label: 'Password Input Field',
        description: 'Enter your account password',
        top: '44%',
        left: '25%',
        width: '50%',
        height: '36px'
      },
      {
        number: 3,
        label: 'Sign In Button',
        description: 'Click to access your personalized dashboard',
        top: '62%',
        left: '25%',
        width: '50%',
        height: '42px'
      },
      {
        number: 4,
        label: 'Create Account Link',
        description: 'New user? Click here to register for a free account',
        top: '72%',
        left: '40%',
        width: '35%',
        height: '20px'
      }
    ],
    tips: [
      'Use the "Forgot password?" link if you can\'t remember your password',
      'After login, you\'ll be redirected based on your role (Member, Coach, or Admin)',
      'Your session stays secure with automatic timeout after inactivity'
    ]
  },
  {
    type: 'html',
    title: "Find Your Perfect Coach",
    description: "Connect with verified professional coaches",
    mockup: <CoachesMockup />,
    clickTargets: [
      {
        number: 1,
        label: 'View Profile Button',
        description: 'Click to see full coach bio, certifications, availability, and client reviews',
        top: '38%',
        left: '20%',
        width: '120px',
        height: '28px'
      },
      {
        number: 2,
        label: 'Schedule a Session',
        description: 'Book a 1-on-1 video session with a professional coach',
        top: '78%',
        left: '25%',
        width: '160px',
        height: '40px'
      }
    ],
    tips: [
      'All coaches are verified and certified professionals',
      'Check coach specialties to find the best match for your needs',
      'You can filter coaches by language, specialty, and availability',
      'First session consultations help determine if the coach is right for you'
    ]
  },
  {
    type: 'html',
    title: "AI-Powered Wellness Journey",
    description: "Create personalized plans with goal tracking",
    mockup: <HomepageMockup />,
    clickTargets: [
      {
        number: 1,
        label: 'Wellness Journey Card',
        description: 'Click "Start Now" to create your personalized wellness plan with AI-powered goal tracking and milestone tracking',
        top: '42%',
        left: '52%',
        width: '44%',
        height: '120px'
      }
    ],
    tips: [
      'The AI analyzes your responses to create a customized plan',
      'You can adjust goals and milestones at any time',
      'Track multiple wellness areas simultaneously',
      'Journey insights help you stay motivated and on track'
    ]
  }
];

// Coach Tutorial Slides (HTML mockup-based)
export const coachTutorialSlides: HtmlSlide[] = [
  {
    type: 'html',
    title: "Coach Dashboard Overview",
    description: "Manage your coaching practice from one central hub",
    mockup: <HomepageMockup />,
    clickTargets: [
      {
        number: 1,
        label: 'Dashboard Stats',
        description: 'View your active clients, upcoming sessions, satisfaction rate, and hours',
        top: '8%',
        left: '8%',
        width: '85%',
        height: '80px'
      },
      {
        number: 2,
        label: 'Quick Actions',
        description: 'Use quick action buttons to set availability, start sessions, or view clients',
        top: '42%',
        left: '52%',
        width: '44%',
        height: '120px'
      }
    ],
    tips: [
      'Dashboard stats update in real-time as you work with clients',
      'Click on any session in the schedule to view details or reschedule',
      'Use Quick Actions for common tasks without navigating menus',
      'Set up your availability first to start receiving client bookings'
    ]
  },
  {
    type: 'html',
    title: "Create Your Coach Profile",
    description: "Build a professional profile that attracts clients",
    mockup: <CoachProfileMockup />,
    clickTargets: [
      {
        number: 1,
        label: 'Profile Photo Upload',
        description: 'Click the camera icon to upload a professional headshot - helps clients recognize you',
        top: '11%',
        left: '2%',
        width: '160px',
        height: '160px'
      },
      {
        number: 2,
        label: 'Add Specializations',
        description: 'Click "+ Add" to add your coaching specialties (Mindfulness, Career, Wellness, etc.)',
        top: '41%',
        left: '2%',
        width: '94%',
        height: '50px'
      },
      {
        number: 3,
        label: 'Write Your Bio',
        description: 'Share your background, approach, and what makes you unique - this appears on your public profile',
        top: '56%',
        left: '2%',
        width: '94%',
        height: '110px'
      },
      {
        number: 4,
        label: 'Set Availability Schedule',
        description: 'Click "Edit Schedule" to set when you\'re available for client sessions',
        top: '75%',
        left: '2%',
        width: '94%',
        height: '110px'
      },
      {
        number: 5,
        label: 'Save Changes',
        description: 'Click "Save Changes" at the top to publish your profile updates',
        top: '2%',
        left: '78%',
        width: '160px',
        height: '45px'
      }
    ],
    tips: [
      'A complete profile with photo and bio gets 3x more client bookings',
      'List 3-5 specializations to help clients find the right coach',
      'Update your availability regularly to maximize booking opportunities',
      'Your bio should be 2-3 sentences highlighting your unique approach'
    ]
  },
  {
    type: 'html',
    title: "Start a Video Call with a Client",
    description: "Conduct professional HD video coaching sessions",
    mockup: <VideoSessionMockup />,
    clickTargets: [
      {
        number: 1,
        label: 'Start Instant Session Button',
        description: 'Click here to create an instant video session - generates a room code you can share immediately',
        top: '2%',
        left: '62%',
        width: '300px',
        height: '45px'
      },
      {
        number: 2,
        label: 'Join Active Session',
        description: 'For ongoing sessions, click "Join Session" to enter the video room',
        top: '28%',
        left: '2%',
        width: '130px',
        height: '40px'
      },
      {
        number: 3,
        label: 'Share Session Link',
        description: 'Click "Share Link" to send invitation emails or copy the room code for participants',
        top: '28%',
        left: '20%',
        width: '140px',
        height: '40px'
      },
      {
        number: 4,
        label: 'Prepare for Upcoming Session',
        description: 'Click "Prepare" to review client notes and goals before the session starts',
        top: '49%',
        left: '68%',
        width: '90px',
        height: '32px'
      }
    ],
    tips: [
      'Instant sessions are great for quick check-ins or urgent support',
      'Always start your video 2-3 minutes early to test audio/video',
      'Room codes work for guests - no client account needed to join',
      'Sessions are automatically recorded (with permission) for note-taking',
      'Use "Share Link" to email invitations directly from the platform'
    ]
  },
  {
    type: 'html',
    title: "Check Your Appointments",
    description: "View and manage your coaching schedule",
    mockup: <AppointmentsMockup />,
    clickTargets: [
      {
        number: 1,
        label: 'Filter Appointments',
        description: 'Click tabs to filter by All, Upcoming, Past, or Cancelled appointments',
        top: '12%',
        left: '2%',
        width: '400px',
        height: '40px'
      },
      {
        number: 2,
        label: 'Today\'s Appointments',
        description: 'View all sessions scheduled for today with status badges (Confirmed/Pending)',
        top: '21%',
        left: '2%',
        width: '94%',
        height: '300px'
      },
      {
        number: 3,
        label: 'Start Session',
        description: 'Click "Start Session" to launch the video call when it\'s time',
        top: '28%',
        left: '74%',
        width: '110px',
        height: '32px'
      },
      {
        number: 4,
        label: 'Confirm Pending Booking',
        description: 'For pending requests, click "Confirm" to accept or "Reschedule" to propose new time',
        top: '43%',
        left: '74%',
        width: '90px',
        height: '32px'
      },
      {
        number: 5,
        label: 'Week Overview',
        description: 'Scroll down to see upcoming appointments for the rest of the week',
        top: '73%',
        left: '2%',
        width: '94%',
        height: '170px'
      }
    ],
    tips: [
      'Green badges mean confirmed - client has accepted the booking',
      'Yellow badges mean pending - waiting for confirmation or payment',
      'Set calendar reminders 30 minutes before each session',
      'Check appointment details to review client goals and notes',
      'Use "Calendar View" for a visual month overview',
      'New appointments appear instantly when clients book'
    ]
  }
];

// Admin Tutorial Slides (HTML mockup-based)
export const adminTutorialSlides: HtmlSlide[] = [
  {
    type: 'html',
    title: "Admin Dashboard Overview",
    description: "Monitor platform operations and manage users",
    mockup: <AdminDashboardMockup />,
    clickTargets: [
      {
        number: 1,
        label: 'Platform Statistics',
        description: 'Monitor key metrics: total users, active coaches, daily sessions, and revenue',
        top: '10%',
        left: '2%',
        width: '94%',
        height: '120px'
      },
      {
        number: 2,
        label: 'Quick Actions Panel',
        description: 'Access common admin tasks: manage users, approve coaches, view analytics, monitor crisis alerts',
        top: '38%',
        left: '2%',
        width: '94%',
        height: '180px'
      }
    ],
    tips: [
      'Check dashboard stats daily to monitor platform health',
      'Crisis alerts require immediate attention - review flagged conversations',
      'Revenue trends help forecast growth and sustainability',
      'Active coach count indicates service availability for clients'
    ]
  },
  {
    type: 'html',
    title: "Manage Platform Users",
    description: "View, edit, and moderate user accounts",
    mockup: <UserManagementMockup />,
    clickTargets: [
      {
        number: 1,
        label: 'Search and Filter Controls',
        description: 'Search users by name/email and filter by role (User/Coach/Admin) or status (Active/Inactive)',
        top: '15%',
        left: '2%',
        width: '94%',
        height: '60px'
      },
      {
        number: 2,
        label: 'User Table',
        description: 'View all users with details: name, email, role, status, and action buttons',
        top: '25%',
        left: '2%',
        width: '94%',
        height: '350px'
      },
      {
        number: 3,
        label: 'Edit User Button',
        description: 'Click "Edit" to modify user details, change roles, or update status',
        top: '33%',
        left: '68%',
        width: '60px',
        height: '30px'
      },
      {
        number: 4,
        label: 'Delete User Button',
        description: 'Click "Delete" to remove a user account (requires confirmation)',
        top: '33%',
        left: '78%',
        width: '70px',
        height: '30px'
      }
    ],
    tips: [
      'Always verify user identity before making changes',
      'Delete operations are permanent - double-check before confirming',
      'Use filters to quickly find specific user groups',
      'Role changes take effect immediately after saving',
      'Monitor inactive users for potential re-engagement campaigns'
    ]
  },
  {
    type: 'html',
    title: "Approve New Coaches",
    description: "Review and approve pending coach applications",
    mockup: <CoachApprovalMockup />,
    clickTargets: [
      {
        number: 1,
        label: 'Coach Application Card',
        description: 'Review applicant details: bio, specializations, certifications, and experience',
        top: '12%',
        left: '2%',
        width: '94%',
        height: '280px'
      },
      {
        number: 2,
        label: 'Approve Application Button',
        description: 'Click to approve the coach and grant platform access',
        top: '77%',
        left: '6%',
        width: '180px',
        height: '40px'
      },
      {
        number: 3,
        label: 'Review Documents Button',
        description: 'View uploaded certifications, licenses, and background check documents',
        top: '77%',
        left: '30%',
        width: '160px',
        height: '40px'
      },
      {
        number: 4,
        label: 'Reject Application Button',
        description: 'Reject the application with optional feedback for the applicant',
        top: '77%',
        left: '50%',
        width: '100px',
        height: '40px'
      }
    ],
    tips: [
      'Verify all certifications are current and valid before approving',
      'Check professional bio quality - it appears on their public profile',
      'Review specializations to ensure they match platform needs',
      'Average approval time: 2-3 days keeps applicants engaged',
      'Provide constructive feedback when rejecting applications',
      'Approved coaches receive automated welcome email with onboarding steps'
    ]
  }
];
