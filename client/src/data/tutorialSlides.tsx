import { HtmlTutorialSlide } from '@/components/HtmlTutorialSlide';

// User Tutorial Slides
export const userTutorialSlides = [
  {
    id: 'welcome',
    component: (
      <HtmlTutorialSlide
        title="Welcome to WholeWellness"
        description="Your journey to personal growth starts here"
        htmlContent={`
          <div style="font-family: system-ui; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; border-radius: 12px; color: white; margin-bottom: 20px;">
              <h1 style="font-size: 2.5rem; margin-bottom: 10px;">Empowering Lives Through Accessible Coaching</h1>
              <p style="font-size: 1.2rem; margin-bottom: 20px;">"Coaching for Everyone: Affordable, Accessible, Empowering."</p>
              <div style="display: flex; gap: 15px;">
                <button style="background: white; color: #667eea; padding: 12px 24px; border-radius: 8px; font-weight: bold; border: none;">Get Started</button>
                <button style="background: transparent; color: white; padding: 12px 24px; border-radius: 8px; border: 2px solid white;">Learn Our Story</button>
              </div>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-top: 20px;">
              <div style="border: 2px solid #667eea; padding: 20px; border-radius: 8px;">
                <div style="background: #667eea; color: white; padding: 4px 12px; border-radius: 4px; display: inline-block; margin-bottom: 10px;">Most Popular</div>
                <h3 style="font-size: 1.5rem; margin-bottom: 8px;">AI Coaching</h3>
                <p style="color: #666; margin-bottom: 12px;">Get instant support from our 6 specialized AI coaches</p>
                <button style="background: #667eea; color: white; padding: 10px 20px; border-radius: 6px; border: none; width: 100%;">Start Now</button>
              </div>
              
              <div style="border: 2px solid #10b981; padding: 20px; border-radius: 8px;">
                <div style="background: #10b981; color: white; padding: 4px 12px; border-radius: 4px; display: inline-block; margin-bottom: 10px;">New</div>
                <h3 style="font-size: 1.5rem; margin-bottom: 8px;">Wellness Journey</h3>
                <p style="color: #666; margin-bottom: 12px;">Create your personalized wellness plan with AI insights</p>
                <button style="background: #10b981; color: white; padding: 10px 20px; border-radius: 6px; border: none; width: 100%;">Start Now</button>
              </div>
            </div>
          </div>
        `}
        clickTargets={[
          {
            number: 1,
            label: 'Get Started Button',
            description: 'Click here to begin your onboarding journey and create your account',
            selector: '.hero-cta',
            color: 'border-purple-500'
          },
          {
            number: 2,
            label: 'AI Coaching Card',
            description: 'Start chatting with our specialized AI coaches (Most Popular - $19.99/month)',
            selector: '.ai-coaching-card',
            color: 'border-blue-500'
          },
          {
            number: 3,
            label: 'Wellness Journey Card',
            description: 'Create a personalized wellness plan with goal tracking',
            selector: '.wellness-journey-card',
            color: 'border-green-500'
          }
        ]}
        tips={[
          'Press "/" anytime to search across the platform',
          'Use Alt+A for quick access to AI coaching',
          'Use Alt+W for wellness journey shortcuts',
          'Look for the "Quick Exit" button in emergencies'
        ]}
      />
    )
  },
  {
    id: 'ai-coaching',
    component: (
      <HtmlTutorialSlide
        title="AI Coaching - $19.99/month"
        description="24/7 access to 6 specialized AI coaches"
        htmlContent={`
          <div style="font-family: system-ui; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="font-size: 2rem; margin-bottom: 10px;">Meet Our Specialized AI Coaches</h1>
              <p style="color: #666;">Start your personalized coaching journey with our expert AI coaches</p>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 30px;">
              <div style="border: 2px solid #e5e7eb; padding: 20px; border-radius: 8px; text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 10px;">🧘‍♀️</div>
                <h3 style="font-weight: bold; margin-bottom: 5px;">Charlene</h3>
                <p style="font-size: 0.875rem; color: #666; margin-bottom: 10px;">Mindfulness Coach</p>
                <div style="font-size: 0.75rem; color: #999; margin-bottom: 15px;">
                  <div>Meditation • Stress Reduction</div>
                  <div>Mindful Living • Breathing</div>
                </div>
                <button style="background: #667eea; color: white; padding: 8px 16px; border-radius: 6px; border: none; width: 100%;">Start Chat</button>
              </div>
              
              <div style="border: 2px solid #e5e7eb; padding: 20px; border-radius: 8px; text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 10px;">✨</div>
                <h3 style="font-weight: bold; margin-bottom: 5px;">Dasha</h3>
                <p style="font-size: 0.875rem; color: #666; margin-bottom: 10px;">Wellness Coach</p>
                <div style="font-size: 0.75rem; color: #999; margin-bottom: 15px;">
                  <div>Holistic Health • Lifestyle</div>
                  <div>Self-Care • Energy</div>
                </div>
                <button style="background: #667eea; color: white; padding: 8px 16px; border-radius: 6px; border: none; width: 100%;">Start Chat</button>
              </div>
              
              <div style="border: 2px solid #e5e7eb; padding: 20px; border-radius: 8px; text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 10px;">🤗</div>
                <h3 style="font-weight: bold; margin-bottom: 5px;">Bobby</h3>
                <p style="font-size: 0.875rem; color: #666; margin-bottom: 10px;">Mental Health Support</p>
                <div style="font-size: 0.75rem; color: #999; margin-bottom: 15px;">
                  <div>Emotional Support • Coping</div>
                  <div>Mental Wellness • Crisis</div>
                </div>
                <button style="background: #667eea; color: white; padding: 8px 16px; border-radius: 6px; border: none; width: 100%;">Start Chat</button>
              </div>
            </div>
            
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px; color: white; text-align: center;">
              <div style="background: #fbbf24; color: #78350f; padding: 4px 12px; border-radius: 4px; display: inline-block; margin-bottom: 15px; font-weight: bold;">BEST VALUE</div>
              <h2 style="font-size: 2.5rem; margin-bottom: 10px;">$19.99/month</h2>
              <p style="margin-bottom: 20px;">7-Day Free Trial</p>
              <button style="background: white; color: #667eea; padding: 15px 40px; border-radius: 8px; font-weight: bold; border: none; font-size: 1.1rem;">Start Your Free Trial</button>
              <p style="font-size: 0.875rem; margin-top: 15px; opacity: 0.9;">7 days free, then $19.99/month. Cancel anytime.</p>
            </div>
          </div>
        `}
        clickTargets={[
          {
            number: 1,
            label: 'Start Chat Buttons',
            description: 'Click on any coach card to start a conversation. Try Charlene for mindfulness or Bobby for mental health support',
            selector: '.coach-card-button',
            color: 'border-purple-500'
          },
          {
            number: 2,
            label: 'Start Your Free Trial',
            description: 'Get 7 days free access to all 6 AI coaches, then $19.99/month. Cancel anytime',
            selector: '.trial-button',
            color: 'border-yellow-500'
          }
        ]}
        tips={[
          'You must accept the medical disclaimer before chatting',
          'All conversations are private and confidential',
          'Each coach has unique specialties - choose based on your needs',
          'You can switch between coaches anytime during your subscription'
        ]}
      />
    )
  },
  {
    id: 'login',
    component: (
      <HtmlTutorialSlide
        title="Sign In to Your Account"
        description="Access your dashboard and coaching tools"
        htmlContent={`
          <div style="font-family: system-ui; padding: 40px; max-width: 400px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="font-size: 2rem; margin-bottom: 10px;">Welcome Back</h1>
              <p style="color: #666;">Sign in to continue your wellness journey</p>
            </div>
            
            <form style="space-y: 20px;">
              <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 500;">Email</label>
                <input 
                  type="email" 
                  placeholder="your.email@example.com"
                  style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 1rem;"
                />
              </div>
              
              <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 500;">Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 1rem;"
                />
              </div>
              
              <div style="text-align: right; margin-bottom: 20px;">
                <a href="#" style="color: #667eea; text-decoration: none; font-size: 0.875rem;">Forgot password?</a>
              </div>
              
              <button 
                type="submit"
                style="width: 100%; background: #667eea; color: white; padding: 14px; border-radius: 8px; font-weight: bold; border: none; font-size: 1.1rem; cursor: pointer;"
              >
                Sign In
              </button>
              
              <div style="text-align: center; margin-top: 20px; color: #666;">
                Don't have an account? <a href="#" style="color: #667eea; text-decoration: none; font-weight: 500;">Create Account</a>
              </div>
            </form>
          </div>
        `}
        clickTargets={[
          {
            number: 1,
            label: 'Email Input',
            description: 'Enter your registered email address',
            selector: 'input[type="email"]',
            color: 'border-blue-500'
          },
          {
            number: 2,
            label: 'Password Input',
            description: 'Enter your account password',
            selector: 'input[type="password"]',
            color: 'border-blue-500'
          },
          {
            number: 3,
            label: 'Sign In Button',
            description: 'Click to access your dashboard',
            selector: 'button[type="submit"]',
            color: 'border-purple-500'
          },
          {
            number: 4,
            label: 'Create Account Link',
            description: 'New user? Click here to register',
            selector: '.register-link',
            color: 'border-green-500'
          }
        ]}
        tips={[
          'Use the "Forgot password?" link if you can\'t remember your password',
          'After login, you\'ll be redirected based on your role (Member, Coach, or Admin)',
          'Your session will stay active for security purposes'
        ]}
      />
    )
  },
  {
    id: 'coaches',
    component: (
      <HtmlTutorialSlide
        title="Find Your Perfect Coach"
        description="Connect with verified professional coaches"
        htmlContent={`
          <div style="font-family: system-ui; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="font-size: 2rem; margin-bottom: 10px;">Find Your Perfect Coach</h1>
              <p style="color: #666;">Connect with verified wellness coaches who are committed to supporting your journey</p>
            </div>
            
            <div style="background: white; border: 2px solid #e5e7eb; border-radius: 12px; padding: 25px; margin-bottom: 20px;">
              <div style="display: flex; align-items: start; gap: 20px;">
                <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem; font-weight: bold;">
                  SJ
                </div>
                
                <div style="flex: 1;">
                  <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                    <h3 style="font-size: 1.5rem; font-weight: bold;">Sarah Johnson</h3>
                    <span style="background: #10b981; color: white; padding: 4px 10px; border-radius: 4px; font-size: 0.75rem; font-weight: bold;">Verified Coach</span>
                  </div>
                  
                  <p style="color: #666; margin-bottom: 15px; line-height: 1.6;">Licensed clinical social worker specializing in trauma recovery and domestic violence support. 8+ years helping women rebuild their lives.</p>
                  
                  <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 15px;">
                    <span style="background: #ede9fe; color: #7c3aed; padding: 6px 12px; border-radius: 6px; font-size: 0.875rem;">Trauma Recovery</span>
                    <span style="background: #ede9fe; color: #7c3aed; padding: 6px 12px; border-radius: 6px; font-size: 0.875rem;">Domestic Violence</span>
                    <span style="background: #ede9fe; color: #7c3aed; padding: 6px 12px; border-radius: 6px; font-size: 0.875rem;">Financial Planning</span>
                  </div>
                  
                  <div style="color: #666; font-size: 0.875rem; margin-bottom: 15px;">
                    <strong>Speaks:</strong> English, Spanish • <strong>Experience:</strong> 8 years
                  </div>
                  
                  <button style="background: #667eea; color: white; padding: 12px 24px; border-radius: 8px; font-weight: bold; border: none; cursor: pointer;">
                    View Profile
                  </button>
                </div>
              </div>
            </div>
            
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px; color: white; text-align: center;">
              <h2 style="font-size: 1.8rem; margin-bottom: 15px;">Ready to Start Your Wellness Journey?</h2>
              <p style="margin-bottom: 25px; font-size: 1.1rem;">Our coaches are here to support you every step of the way.</p>
              <div style="display: flex; gap: 15px; justify-content: center;">
                <button style="background: white; color: #667eea; padding: 14px 30px; border-radius: 8px; font-weight: bold; border: none; cursor: pointer;">
                  Schedule a Session
                </button>
                <button style="background: transparent; color: white; padding: 14px 30px; border-radius: 8px; font-weight: bold; border: 2px solid white; cursor: pointer;">
                  Learn More About Us
                </button>
              </div>
            </div>
          </div>
        `}
        clickTargets={[
          {
            number: 1,
            label: 'View Profile Button',
            description: 'Click to see full coach bio, certifications, availability, and book sessions',
            selector: '.coach-profile-button',
            color: 'border-purple-500'
          },
          {
            number: 2,
            label: 'Schedule a Session',
            description: 'Book a 1-on-1 video session with a professional coach',
            selector: '.schedule-button',
            color: 'border-green-500'
          }
        ]}
        tips={[
          'All coaches are verified and certified professionals',
          'Check coach specialties to find the best match for your needs',
          'You can filter coaches by language, specialty, and availability',
          'First session consultations help determine if the coach is right for you'
        ]}
      />
    )
  },
  {
    id: 'wellness-journey',
    component: (
      <HtmlTutorialSlide
        title="AI-Powered Wellness Journey"
        description="Create personalized plans with goal tracking"
        htmlContent={`
          <div style="font-family: system-ui; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="background: #10b981; color: white; padding: 6px 15px; border-radius: 6px; display: inline-block; margin-bottom: 15px; font-weight: bold;">NEW FEATURE</div>
              <h1 style="font-size: 2rem; margin-bottom: 10px;">AI-Powered Wellness Journey</h1>
              <p style="color: #666;">Create personalized wellness plans with goal tracking, milestones, and AI insights</p>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px;">
              <div style="border: 2px solid #e5e7eb; border-radius: 12px; padding: 25px; text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 15px;">🎯</div>
                <h3 style="font-weight: bold; margin-bottom: 10px; font-size: 1.2rem;">Set Goals</h3>
                <p style="color: #666; font-size: 0.9rem;">Define your wellness objectives with AI guidance</p>
              </div>
              
              <div style="border: 2px solid #e5e7eb; border-radius: 12px; padding: 25px; text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 15px;">📊</div>
                <h3 style="font-weight: bold; margin-bottom: 10px; font-size: 1.2rem;">Track Progress</h3>
                <p style="color: #666; font-size: 0.9rem;">Monitor your journey with visual milestones</p>
              </div>
              
              <div style="border: 2px solid #e5e7eb; border-radius: 12px; padding: 25px; text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 15px;">✨</div>
                <h3 style="font-weight: bold; margin-bottom: 10px; font-size: 1.2rem;">Get Insights</h3>
                <p style="color: #666; font-size: 0.9rem;">Receive AI-powered recommendations</p>
              </div>
            </div>
            
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 35px; border-radius: 12px; color: white;">
              <h2 style="font-size: 1.8rem; margin-bottom: 15px; text-align: center;">Start Your Wellness Journey Today</h2>
              <p style="text-align: center; margin-bottom: 25px; font-size: 1.05rem;">Create a personalized plan tailored to your unique needs and goals</p>
              <div style="text-align: center;">
                <button style="background: white; color: #10b981; padding: 16px 40px; border-radius: 8px; font-weight: bold; border: none; font-size: 1.15rem; cursor: pointer;">
                  Create My Journey
                </button>
              </div>
              <ul style="margin-top: 25px; list-style: none; padding: 0;">
                <li style="padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.2);">✓ Personalized goal setting</li>
                <li style="padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.2);">✓ AI-driven milestone tracking</li>
                <li style="padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.2);">✓ Progress visualization</li>
                <li style="padding: 8px 0;">✓ Adaptive recommendations</li>
              </ul>
            </div>
          </div>
        `}
        clickTargets={[
          {
            number: 1,
            label: 'Create My Journey Button',
            description: 'Start building your personalized wellness plan with AI assistance',
            selector: '.create-journey-button',
            color: 'border-green-500'
          }
        ]}
        tips={[
          'The AI analyzes your responses to create a customized plan',
          'You can adjust goals and milestones at any time',
          'Track multiple wellness areas simultaneously',
          'Journey insights help you stay motivated and on track'
        ]}
      />
    )
  }
];

// Coach Tutorial Slides
export const coachTutorialSlides = [
  {
    id: 'coach-dashboard',
    component: (
      <HtmlTutorialSlide
        title="Coach Dashboard Overview"
        description="Manage your coaching practice from one central hub"
        htmlContent={`
          <div style="font-family: system-ui; padding: 20px;">
            <h1 style="font-size: 2rem; margin-bottom: 20px;">Coach Dashboard</h1>
            
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 12px; color: white;">
                <div style="font-size: 2.5rem; font-weight: bold; margin-bottom: 5px;">12</div>
                <div style="font-size: 0.9rem; opacity: 0.9;">Active Clients</div>
              </div>
              
              <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 20px; border-radius: 12px; color: white;">
                <div style="font-size: 2.5rem; font-weight: bold; margin-bottom: 5px;">8</div>
                <div style="font-size: 0.9rem; opacity: 0.9;">Upcoming Sessions</div>
              </div>
              
              <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 20px; border-radius: 12px; color: white;">
                <div style="font-size: 2.5rem; font-weight: bold; margin-bottom: 5px;">95%</div>
                <div style="font-size: 0.9rem; opacity: 0.9;">Satisfaction Rate</div>
              </div>
              
              <div style="background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); padding: 20px; border-radius: 12px; color: white;">
                <div style="font-size: 2.5rem; font-weight: bold; margin-bottom: 5px;">24</div>
                <div style="font-size: 0.9rem; opacity: 0.9;">Hours This Week</div>
              </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px;">
              <div style="border: 2px solid #e5e7eb; border-radius: 12px; padding: 20px;">
                <h3 style="font-weight: bold; margin-bottom: 15px; font-size: 1.2rem;">Today's Schedule</h3>
                <div style="space-y: 10px;">
                  <div style="padding: 15px; background: #f9fafb; border-radius: 8px; margin-bottom: 10px;">
                    <div style="font-weight: bold;">10:00 AM - Sarah M.</div>
                    <div style="color: #666; font-size: 0.9rem;">Trauma Recovery Session</div>
                  </div>
                  <div style="padding: 15px; background: #f9fafb; border-radius: 8px; margin-bottom: 10px;">
                    <div style="font-weight: bold;">2:00 PM - Mike D.</div>
                    <div style="color: #666; font-size: 0.9rem;">Career Coaching</div>
                  </div>
                </div>
              </div>
              
              <div style="border: 2px solid #e5e7eb; border-radius: 12px; padding: 20px;">
                <h3 style="font-weight: bold; margin-bottom: 15px; font-size: 1.2rem;">Quick Actions</h3>
                <button style="width: 100%; background: #667eea; color: white; padding: 12px; border-radius: 8px; border: none; margin-bottom: 10px; cursor: pointer;">Set Availability</button>
                <button style="width: 100%; background: #10b981; color: white; padding: 12px; border-radius: 8px; border: none; margin-bottom: 10px; cursor: pointer;">Start Session</button>
                <button style="width: 100%; background: #f59e0b; color: white; padding: 12px; border-radius: 8px; border: none; cursor: pointer;">View Clients</button>
              </div>
            </div>
          </div>
        `}
        clickTargets={[
          {
            number: 1,
            label: 'Set Availability Button',
            description: 'Configure your weekly schedule and time slots for client bookings',
            selector: '.availability-button',
            color: 'border-purple-500'
          },
          {
            number: 2,
            label: 'Start Session Button',
            description: 'Launch a video session with a client instantly',
            selector: '.session-button',
            color: 'border-green-500'
          },
          {
            number: 3,
            label: 'Today\'s Schedule',
            description: 'View and manage your upcoming sessions for the day',
            selector: '.schedule-widget',
            color: 'border-blue-500'
          }
        ]}
        tips={[
          'Dashboard stats update in real-time as you work with clients',
          'Click on any session in the schedule to view details or reschedule',
          'Use Quick Actions for common tasks without navigating menus'
        ]}
      />
    )
  }
];
