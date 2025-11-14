import { HtmlSlide } from '@/components/TutorialSlideshow';
import {
  HomepageMockup,
  LoginMockup,
  AICoachingMockup,
  CoachesMockup
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
  }
];
