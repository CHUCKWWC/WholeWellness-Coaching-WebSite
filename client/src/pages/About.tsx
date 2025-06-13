import { Card, CardContent } from "@/components/ui/card";

export default function About() {
  const teamValues = [
    {
      title: "Accessibility",
      description: "We believe everyone deserves access to high-quality coaching, regardless of their financial situation.",
      icon: "🎯"
    },
    {
      title: "Empowerment",
      description: "Our coaching approach focuses on helping individuals discover their own strength and capabilities.",
      icon: "💪"
    },
    {
      title: "Compassion",
      description: "We provide a safe, non-judgmental space where clients can explore and grow.",
      icon: "❤️"
    },
    {
      title: "Transformation",
      description: "We're committed to facilitating meaningful, lasting change in our clients' lives.",
      icon: "🦋"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-warm to-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-secondary mb-6">
            About Wholewellness Coaching
          </h1>
          <p className="text-xl text-gray-700 leading-relaxed">
            Founded on the belief that everyone deserves access to transformative coaching, 
            we're dedicated to breaking down barriers and making personal development accessible to all.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
                alt="Diverse women in supportive community setting" 
                className="rounded-2xl shadow-lg" 
              />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-secondary mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Wholewellness Coaching was born from a simple yet powerful observation: 
                  the people who need coaching the most often have the least access to it. 
                  Traditional coaching services, while valuable, remain out of reach for many 
                  due to cost barriers.
                </p>
                <p>
                  Our founder recognized this gap after witnessing firsthand how life coaching 
                  could transform lives, particularly for women facing major life transitions 
                  such as leaving abusive relationships, navigating divorce, or dealing with 
                  the loss of a spouse.
                </p>
                <p>
                  We believe that mental health services are the foundation of self-care, 
                  personal development, and a healthy lifestyle. While therapy helps with 
                  understanding the "why," coaching provides the "how" to apply knowledge 
                  and create meaningful change.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-warm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Card className="bg-white">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-secondary mb-6">Our Mission</h3>
                <p className="text-gray-700 leading-relaxed mb-6">
                  We see a future where high-quality life coaching is not a privilege but a right, where technology bridges gaps and 
                  brings expert guidance to those who need it most. Our vision is of a global community where self-discovery and 
                  continuous improvement are celebrated, where individuals from all walks of life can find the coaching they need to 
                  thrive in relationships, stay anchored during a divorce, find love and passion at any age, business & careers, health, 
                  and personal development.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Our mission is to empower disadvantaged individuals to unlock their full potential and achieve transformative growth, 
                  provide a supportive and innovative coaching platform that fosters personal development, cultivates resilience, and 
                  promotes holistic well-being. Our mission is to make high-quality life coaching accessible to all.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-secondary mb-6">Our Vision</h3>
                <p className="text-gray-700 leading-relaxed mb-6">
                  We see a future where high-quality life coaching is not a privilege but a right, 
                  where technology bridges gaps and brings expert guidance to those who need it most.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Our vision is of a global community where self-discovery and continuous improvement 
                  are celebrated, where individuals from all walks of life can find the coaching they 
                  need to thrive in relationships, careers, health, and personal growth.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Founders */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-secondary mb-12">
            Our Founders
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl font-bold">CS</span>
              </div>
              <h3 className="text-xl font-semibold text-secondary mb-2">Dr. Charlene Inman Smith</h3>
              <p className="text-primary font-medium mb-4">Executive Director & Co-Founder</p>
              <p className="text-gray-700 leading-relaxed">
                Dr. Charlene Smith is a dating coach with thirty-six years of experience, living in San Antonio, Texas. 
                At sixty-seven, she produced and hosted a streaming series, "Set It off Senior Style." She specializes in 
                coaching senior clients on safely dating and relationships, and has been interviewed on FOX and ABC while 
                conducting workshops on senior dating.
              </p>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl font-bold">DL</span>
              </div>
              <h3 className="text-xl font-semibold text-secondary mb-2">Dasha Lazaryuk</h3>
              <p className="text-primary font-medium mb-4">Program Director & Co-Founder</p>
              <p className="text-gray-700 leading-relaxed">
                Dasha is a Divorce & Resource (Time, Money, Energy) Coach specializing in helping women reclaim their 
                power amidst a divorce and build their dream life post-divorce. Her goal is to create a support system 
                for women undergoing such a profound transformation. Drawing from her own experience during the hardest 
                time of her life, she provides the guidance she wished she had during her journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Approach */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-secondary mb-4">Our Approach</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We combine evidence-based coaching methodologies with a deep understanding 
              of the unique challenges faced by underserved communities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamValues.map((value, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="text-4xl mb-4">{value.icon}</div>
                  <h3 className="text-xl font-semibold text-secondary mb-3">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Impact */}
      <section className="py-16 bg-gradient-to-br from-primary to-secondary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Our Impact</h2>
            <p className="text-lg opacity-90 max-w-3xl mx-auto">
              The journey of a thousand miles begins with a single step - and with your help, 
              we can provide the guidance and support needed for that crucial first step and every one that follows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-lg opacity-90">Lives Transformed</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">75%</div>
              <div className="text-lg opacity-90">Receive Free or Discounted Services</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">95%</div>
              <div className="text-lg opacity-90">Client Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Future Goals */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-secondary mb-4">Looking Forward</h2>
            <p className="text-lg text-gray-600">
              Our goals for expanding impact and reach
            </p>
          </div>

          <div className="prose prose-lg mx-auto text-gray-700">
            <p>
              With support, we can expand our reach globally, enhance our technology, 
              and continue to innovate in the field of online coaching. We can build 
              a future where personal growth and well-being are not luxuries, but 
              fundamental rights accessible to all.
            </p>
            <p>
              We want to inspire positive change, cultivate self-discovery, and 
              empower individuals to lead fulfilling, purposeful lives. Our goal 
              is to unlock the potential within every individual and create a 
              world where everyone has the opportunity to thrive.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
