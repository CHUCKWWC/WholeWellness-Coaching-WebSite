import { useState, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Download, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { HtmlTutorialSlide } from "./HtmlTutorialSlide";

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
    <div className="w-full max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h2>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            data-testid="button-close-tutorial"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <Card className="bg-white dark:bg-gray-800 shadow-lg">
        <CardContent className="p-8">
          {/* Main Slide Display - Conditional rendering based on type */}
          {currentSlideData.type === 'image' ? (
            <>
              <div className="relative mb-6">
                <img
                  src={currentSlideData.image}
                  alt={currentSlideData.alt}
                  className="w-full rounded-lg shadow-md"
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

          {/* Navigation Controls */}
          <div className="flex items-center justify-between mb-4">
            <Button
              onClick={prevSlide}
              variant="outline"
              size="sm"
              disabled={currentSlide === 0}
              data-testid="button-prev-slide"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400" data-testid="text-slide-counter">
                {currentSlide + 1} of {slides.length}
              </span>
              {/* Download only available for image slides */}
              {currentSlideData.type === 'image' && (
                <Button
                  onClick={handleDownload}
                  variant="ghost"
                  size="sm"
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
              data-testid="button-next-slide"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          {/* Slide Indicators */}
          <div className="flex justify-center gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={cn(
                  "h-2 rounded-full transition-all",
                  currentSlide === index
                    ? "w-8 bg-purple-600"
                    : "w-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
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
                    ? "border-purple-600 ring-2 ring-purple-600 ring-offset-2"
                    : "border-gray-200 dark:border-gray-700 hover:border-purple-400"
                )}
                data-testid={`button-thumbnail-${index}`}
              >
                <img
                  src={slide.image}
                  alt={slide.alt}
                  className="w-full h-16 object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs py-1 text-center">
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
