import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Testimonial {
  id: number;
  quote: string;
  author: string;
  role: string;
  rating: number;
  image?: string;
}

interface TestimonialsCarouselProps {
  type: 'client' | 'coach';
  autoPlay?: boolean;
  interval?: number;
}

const clientTestimonials: Testimonial[] = [
  {
    id: 1,
    quote: "After everything I went through, I never thought I could feel whole again. My coach helped me discover strength I didn't know I had.",
    author: "Sarah M.",
    role: "Member since 2024",
    rating: 5
  },
  {
    id: 2,
    quote: "The matching process was so thoughtful. They paired me with someone who truly understands my journey as a survivor.",
    author: "Jennifer L.",
    role: "Member since 2023",
    rating: 5
  },
  {
    id: 3,
    quote: "Having both AI coaching for daily support and a real coach for deep work has been transformative. I'm finally living, not just surviving.",
    author: "Maria R.",
    role: "Member since 2024",
    rating: 5
  },
  {
    id: 4,
    quote: "The confidentiality gave me peace of mind to open up. My coach created a safe space where I could heal at my own pace.",
    author: "Amanda K.",
    role: "Member since 2023",
    rating: 5
  }
];

const coachTestimonials: Testimonial[] = [
  {
    id: 1,
    quote: "Being part of WholeWellness has given my coaching career purpose. Helping women rebuild their lives is the most rewarding work I've ever done.",
    author: "Dr. Emily Chen",
    role: "Coach since 2022",
    rating: 5
  },
  {
    id: 2,
    quote: "The support from the WholeWellness community is incredible. The training, resources, and fellow coaches make me a better professional every day.",
    author: "Lisa Thompson",
    role: "Coach since 2023",
    rating: 5
  },
  {
    id: 3,
    quote: "I love the flexibility to set my own schedule while doing meaningful work. Every client success story reminds me why I became a coach.",
    author: "Dr. Patricia Moore",
    role: "Coach since 2021",
    rating: 5
  },
  {
    id: 4,
    quote: "The certification program elevated my practice. I now have specialized skills to help women navigate trauma with confidence and compassion.",
    author: "Rebecca Santos",
    role: "Coach since 2023",
    rating: 5
  }
];

export default function TestimonialsCarousel({ type, autoPlay = true, interval = 6000 }: TestimonialsCarouselProps) {
  const testimonials = type === 'client' ? clientTestimonials : coachTestimonials;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!autoPlay || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, isPaused, interval, testimonials.length]);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <div 
      className="relative py-6"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        <Quote className="absolute top-4 left-4 h-12 w-12 text-purple-200 dark:text-purple-800" />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTestimonial.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className="relative z-10"
          >
            <div className="flex justify-center mb-3">
              {Array.from({ length: currentTestimonial.rating }).map((_, i) => (
                <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            
            <blockquote className="text-center text-lg sm:text-xl text-gray-700 dark:text-gray-200 italic mb-6 leading-relaxed">
              "{currentTestimonial.quote}"
            </blockquote>
            
            <div className="text-center">
              <p className="font-semibold text-gray-900 dark:text-white">
                {currentTestimonial.author}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {currentTestimonial.role}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between mt-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={prev}
            className="rounded-full hover:bg-purple-100 dark:hover:bg-gray-600"
            data-testid="button-testimonial-prev"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <div className="flex gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === currentIndex 
                    ? 'w-6 bg-purple-600 dark:bg-purple-400' 
                    : 'w-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                }`}
                data-testid={`button-testimonial-dot-${i}`}
              />
            ))}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={next}
            className="rounded-full hover:bg-purple-100 dark:hover:bg-gray-600"
            data-testid="button-testimonial-next"
            aria-label="Next testimonial"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
