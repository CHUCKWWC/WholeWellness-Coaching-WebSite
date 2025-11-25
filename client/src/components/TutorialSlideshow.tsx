import { useState, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Download, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { HtmlTutorialSlide } from "./HtmlTutorialSlide";
import { motion, AnimatePresence } from "framer-motion";

// Discriminated union for slide types (exported for reuse)
export type ImageSlide = {
  type: 'image';
  image: string;
  alt: string;
  title: string;
  description: string;
};

export type HtmlSlide = {
  type: 'html';
  title: string;
  description: string;
  mockup: ReactNode;
  clickTargets: Array<{
    number: number;
    label: string;
    description: string;
    top?: string;
    left?: string;
    width?: string;
    height?: string;
  }>;
  tips?: string[];
};

export type Slide = ImageSlide | HtmlSlide;

interface TutorialSlideshowProps {
  slides: Slide[];
  title: string;
  onClose?: () => void;
}

export function TutorialSlideshow({ slides, title, onClose }: TutorialSlideshowProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const handleDownload = () => {
    const slide = slides[currentSlide];
    if (slide.type === 'image') {
      const link = document.createElement('a');
      link.href = slide.image;
      link.download = `${slide.alt}.png`;
      link.click();
    }
  };

  const currentSlideData = slides[currentSlide];

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-1 bg-gradient-to-b from-teal-500 to-blue-500 rounded-full" />
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{title}</h2>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-gray-100 dark:hover:bg-gray-800"
            data-testid="button-close-tutorial"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <Card className="bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <CardContent className="p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Main Slide Display - Conditional rendering based on type */}
              {currentSlideData.type === 'image' ? (
                <>
                  <div className="relative mb-6">
                    <img
                      src={currentSlideData.image}
                      alt={currentSlideData.alt}
                      className="w-full rounded-xl shadow-lg border border-gray-100 dark:border-gray-700"
                      data-testid={`img-tutorial-slide-${currentSlide}`}
                    />
                  </div>

                  {/* Slide Info for Image */}
                  <div className="mb-6 text-center">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {currentSlideData.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {currentSlideData.description}
                    </p>
                  </div>
                </>
              ) : (
                /* HTML Mockup Slide */
                <div className="mb-6">
                  <HtmlTutorialSlide
                    title={currentSlideData.title}
                    description={currentSlideData.description}
                    mockup={currentSlideData.mockup}
                    clickTargets={currentSlideData.clickTargets}
                    tips={currentSlideData.tips}
                  />
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
            <Button
              onClick={prevSlide}
              variant="outline"
              size="sm"
              disabled={currentSlide === 0}
              className="gap-1 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40"
              data-testid="button-prev-slide"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Previous</span>
            </Button>

            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full" data-testid="text-slide-counter">
                {currentSlide + 1} / {slides.length}
              </span>
              {/* Download only available for image slides */}
              {currentSlideData.type === 'image' && (
                <Button
                  onClick={handleDownload}
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-teal-600"
                  data-testid="button-download-slide"
                >
                  <Download className="h-4 w-4" />
                </Button>
              )}
            </div>

            <Button
              onClick={nextSlide}
              variant="outline"
              size="sm"
              disabled={currentSlide === slides.length - 1}
              className="gap-1 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40"
              data-testid="button-next-slide"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Slide Indicators */}
          <div className="flex justify-center gap-2 mt-4">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  currentSlide === index
                    ? "w-8 bg-gradient-to-r from-teal-500 to-blue-500"
                    : "w-2 bg-gray-300 dark:bg-gray-600 hover:bg-teal-300 dark:hover:bg-teal-700"
                )}
                aria-label={`Go to slide ${index + 1}`}
                data-testid={`button-slide-indicator-${index}`}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Thumbnail Navigation (for image slides in mixed or pure decks) */}
      {slides.length > 3 && slides.some(s => s.type === 'image') && (
        <div className="mt-6 grid grid-cols-5 gap-3">
          {slides.map((slide, index) => {
            // Only render thumbnails for image slides
            if (slide.type !== 'image') return null;
            return (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={cn(
                  "relative rounded-lg overflow-hidden border-2 transition-all",
                  currentSlide === index
                    ? "border-teal-500 ring-2 ring-teal-500 ring-offset-2"
                    : "border-gray-200 dark:border-gray-700 hover:border-teal-400"
                )}
                data-testid={`button-thumbnail-${index}`}
              >
                <img
                  src={slide.image}
                  alt={slide.alt}
                  className="w-full h-16 object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white text-xs py-1 text-center font-medium">
                  {index + 1}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
