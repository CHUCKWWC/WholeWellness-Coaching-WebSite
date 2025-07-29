import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

export default function Programs() {
  const communityPrograms = [
    {
      title: "Support Groups",
      icon: "👥",
      schedule: "Weekly virtual meetings",
      description: "Connect with others who share similar experiences in a safe, supportive environment. Share challenges, celebrate victories, and build lasting friendships.",
      topics: ["Domestic Violence Recovery", "Divorce & Separation", "Widowhood Support", "Career Transitions"],
      cost: "Free",
      duration: "Ongoing"
    },
    {
      title: "Monthly Workshops",
      icon: "🎓",
      schedule: "First Saturday of each month",
      description: "Skill-building sessions covering essential life skills and personal development topics. Interactive format with practical takeaways.",
      topics: ["Boundary Setting", "Financial Planning", "Communication Skills", "Self-Care Strategies"],
      cost: "Free for members, $25 for non-members",
      duration: "2 hours"
    },
    {
      title: "Mentorship Program",
      icon: "🤝",
      schedule: "Matched pairing with flexible meeting times",
      description: "Connect with experienced mentors who have successfully navigated similar life challenges. Get personalized guidance and support.",
      topics: ["One-on-one mentoring", "Goal setting", "Career guidance", "Life transition support"],
      cost: "Free",
      duration: "6-month commitment"
    }
  ];

  const specialPrograms = [
    {
      title: "New Beginnings Intensive",
      duration: "8 weeks",
      description: "Comprehensive program for those starting over after major life changes. Combines individual coaching with group support.",
      includes: ["8 individual sessions", "Weekly group meetings", "Resource library access", "24/7 crisis support"],
      cost: "Sliding scale: Free - $400",
      nextStart: "March 15, 2024"
    },
    {
      title: "Career Catalyst Program", 
      duration: "12 weeks",
      description: "Intensive career development program combining coaching, skills assessment, and practical job search support.",
      includes: ["Skills assessment", "Resume & LinkedIn optimization", "Interview coaching", "Networking strategies"],
      cost: "Sliding scale: $100 - $600",
      nextStart: "April 1, 2024"
    },
    {
      title: "Relationship Renewal Workshop Series",
      duration: "6 weeks",
      description: "Learn to build healthy relationships, whether you're single, dating, or in a relationship. Focus on boundaries and communication.",
      includes: ["6 group workshops", "Workbook & resources", "Partner exercises", "Follow-up support"],
      cost: "Sliding scale: $75 - $300",
      nextStart: "March 22, 2024"
    }
  ];

  const onlineResources = [
    {
      type: "Articles & Guides",
      icon: "📖",
      count: "50+ resources",
      description: "Evidence-based articles on personal development, relationships, career growth, and mental health."
    },
    {
      type: "Video Library",
      icon: "🎥", 
      count: "25+ videos",
      description: "On-demand coaching sessions, guided meditations, and educational content available 24/7."
    },
    {
      type: "Worksheets & Tools",
      icon: "📝",
      count: "30+ downloads",
      description: "Practical tools for self-reflection, goal setting, budgeting, and relationship building."
    },
    {
      type: "Weekly Podcast",
      icon: "🎙️",
      count: "New episodes weekly",
      description: "Expert interviews, success stories, and practical tips for personal growth and empowerment."
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-warm to-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-secondary mb-6">
            Programs & Resources
          </h1>
          <p className="text-xl text-gray-700 leading-relaxed">
            Comprehensive support systems designed to meet you where you are in your journey. 
            From free community programs to intensive workshops, we have something for everyone.
          </p>
        </div>
      </section>

      {/* Community Programs */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-secondary mb-4">Community Programs</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Connect with others on similar journeys through our supportive community programs.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {communityPrograms.map((program, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="bg-primary text-white rounded-full p-4 w-16 h-16 flex items-center justify-center mb-6 text-2xl">
                    {program.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-secondary mb-3">{program.title}</h3>
                  <Badge variant="outline" className="mb-4">{program.schedule}</Badge>
                  <p className="text-gray-600 mb-6">{program.description}</p>
                  
                  <div className="mb-6">
                    <h4 className="font-semibold text-secondary mb-2">Topics Covered:</h4>
                    <ul className="space-y-1">
                      {program.topics.map((topic, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-center">
                          <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                          {topic}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <span className="text-sm text-gray-500">Cost: </span>
                      <span className="font-semibold text-primary">{program.cost}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Duration: </span>
                      <span className="font-semibold">{program.duration}</span>
                    </div>
                  </div>
                  
                  <Link href="/booking">
                    <Button className="w-full bg-primary hover:bg-secondary">
                      Join Program
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Special Programs */}
      <section className="py-16 bg-warm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-secondary mb-4">Intensive Programs</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Structured programs for focused transformation and skill development.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {specialPrograms.map((program, index) => (
              <Card key={index} className="bg-white">
                <CardContent className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-xl font-semibold text-secondary">{program.title}</h3>
                    <Badge className="bg-primary">{program.duration}</Badge>
                  </div>
                  
                  <p className="text-gray-600 mb-6">{program.description}</p>
                  
                  <div className="mb-6">
                    <h4 className="font-semibold text-secondary mb-2">Program Includes:</h4>
                    <ul className="space-y-2">
                      {program.includes.map((item, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-center">
                          <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Investment:</span>
                      <span className="font-semibold text-primary">{program.cost}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Next Start:</span>
                      <span className="font-semibold">{program.nextStart}</span>
                    </div>
                  </div>
                  
                  <Link href="/booking">
                    <Button className="w-full bg-primary hover:bg-secondary">
                      Apply Now
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Online Resources */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-secondary mb-4">Resource Library</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Access our comprehensive library of self-help resources, available 24/7 for your personal growth journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {onlineResources.map((resource, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="bg-primary text-white rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl">
                    {resource.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-secondary mb-2">{resource.type}</h3>
                  <Badge variant="secondary" className="mb-3">{resource.count}</Badge>
                  <p className="text-gray-600 text-sm">{resource.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="bg-gray-50 rounded-2xl p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <img 
                  src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
                  alt="Community gathering and support" 
                  className="rounded-2xl shadow-lg w-full h-auto" 
                />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-secondary mb-6">Member Access Benefits</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="bg-primary text-white rounded-full p-2 flex-shrink-0">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-secondary">Unlimited Resource Access</h4>
                      <p className="text-gray-600 text-sm">Download all worksheets, guides, and tools</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="bg-primary text-white rounded-full p-2 flex-shrink-0">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-secondary">Priority Program Registration</h4>
                      <p className="text-gray-600 text-sm">Early access to workshops and special programs</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="bg-primary text-white rounded-full p-2 flex-shrink-0">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-secondary">Community Forum Access</h4>
                      <p className="text-gray-600 text-sm">Connect with other members in our private forum</p>
                    </div>
                  </div>
                </div>
                
                <Link href="/members">
                  <Button className="mt-6 bg-primary hover:bg-secondary">
                    Become a Member
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-br from-primary to-secondary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Start Your Journey Today
          </h2>
          <p className="text-xl opacity-90 mb-8">
            Whether you need immediate support or want to explore our programs, we're here to help you take the next step.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/booking">
              <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
                Schedule Consultation
              </Button>
            </Link>
            <Link href="/resources">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-primary"
              >
                Browse Resources
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
