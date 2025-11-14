export function HomepageMockup() {
  return (
    <div className="w-full h-[600px] overflow-hidden text-xs" style={{ transform: 'scale(0.8)', transformOrigin: 'top left' }}>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-8 rounded-t-lg">
        <h1 className="text-2xl font-bold mb-2">Empowering Lives Through Accessible Coaching</h1>
        <p className="text-sm mb-4">"Coaching for Everyone: Affordable, Accessible, Empowering."</p>
        <div className="flex gap-3">
          <button className="bg-white text-purple-700 px-4 py-2 rounded-md font-semibold text-xs">
            Get Started
          </button>
          <button className="border-2 border-white px-4 py-2 rounded-md font-semibold text-xs">
            Learn Our Story
          </button>
        </div>
      </div>

      {/* Service Cards */}
      <div className="p-6 bg-gray-50">
        <h2 className="text-lg font-bold text-center mb-4">Your Wellness Journey Starts Here</h2>
        <div className="grid grid-cols-2 gap-3">
          {/* AI Coaching Card */}
          <div className="border-2 border-purple-500 bg-white p-4 rounded-lg relative">
            <div className="absolute top-2 right-2 bg-purple-500 text-white text-[10px] px-2 py-0.5 rounded">
              Most Popular
            </div>
            <h3 className="font-bold text-sm mb-1">AI Coaching</h3>
            <p className="text-[10px] text-gray-600 mb-2">Get instant support from our 6 specialized AI coaches</p>
            <div className="text-[10px] text-purple-600 mb-2">95% satisfaction</div>
            <button className="w-full bg-purple-600 text-white py-1.5 rounded text-[10px] font-semibold">
              Start Now
            </button>
          </div>

          {/* Wellness Journey Card */}
          <div className="border-2 border-green-500 bg-white p-4 rounded-lg relative">
            <div className="absolute top-2 right-2 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded">
              New
            </div>
            <h3 className="font-bold text-sm mb-1">Wellness Journey</h3>
            <p className="text-[10px] text-gray-600 mb-2">Create your personalized wellness plan with AI</p>
            <div className="text-[10px] text-green-600 mb-2">89% satisfaction</div>
            <button className="w-full bg-green-600 text-white py-1.5 rounded text-[10px] font-semibold">
              Start Now
            </button>
          </div>

          {/* Assessment Card */}
          <div className="border-2 border-blue-500 bg-white p-4 rounded-lg relative">
            <div className="absolute top-2 right-2 bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded">
              Recommended
            </div>
            <h3 className="font-bold text-sm mb-1">Take Assessment</h3>
            <p className="text-[10px] text-gray-600 mb-2">Discover your wellness needs</p>
            <div className="text-[10px] text-blue-600 mb-2">92% satisfaction</div>
            <button className="w-full bg-blue-600 text-white py-1.5 rounded text-[10px] font-semibold">
              Start Now
            </button>
          </div>

          {/* Live Coaching Card */}
          <div className="border-2 border-orange-500 bg-white p-4 rounded-lg relative">
            <div className="absolute top-2 right-2 bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded">
              Premium
            </div>
            <h3 className="font-bold text-sm mb-1">Live Coaching</h3>
            <p className="text-[10px] text-gray-600 mb-2">1-on-1 sessions with professional coaches</p>
            <div className="text-[10px] text-orange-600 mb-2">87% satisfaction</div>
            <button className="w-full bg-orange-600 text-white py-1.5 rounded text-[10px] font-semibold">
              Start Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
