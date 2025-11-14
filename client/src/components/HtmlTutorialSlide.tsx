import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ReactNode } from 'react';

interface ClickTarget {
  number: number;
  label: string;
  description: string;
  top?: string;
  left?: string;
  width?: string;
  height?: string;
}

interface HtmlTutorialSlideProps {
  title: string;
  description: string;
  mockup: ReactNode;  // Visual mockup component
  clickTargets: ClickTarget[];
  tips?: string[];
}

export function HtmlTutorialSlide({
  title,
  description,
  mockup,
  clickTargets,
  tips = []
}: HtmlTutorialSlideProps) {
  return (
    <div className="space-y-6" data-testid="html-tutorial-slide">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          {title}
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          {description}
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Visual Mockup with Highlights */}
        <Card className="p-4 bg-gray-50 dark:bg-gray-900 border-2">
          <div className="relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-inner">
            {mockup}
            
            {/* Numbered overlays for click targets */}
            {clickTargets.map((target) => (
              <div
                key={target.number}
                className="absolute pointer-events-none"
                style={{
                  top: target.top,
                  left: target.left,
                  width: target.width,
                  height: target.height
                }}
              >
                <div className="relative w-full h-full">
                  <div className="absolute inset-0 bg-purple-500/20 border-4 border-purple-500 rounded-lg animate-pulse" />
                  <div className="absolute -top-4 -left-4 w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg z-10">
                    {target.number}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Click Target Instructions */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            What to Click
          </h3>
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {clickTargets.map((target) => (
              <Card
                key={target.number}
                className="p-4 bg-gradient-to-r from-purple-50 to-white dark:from-purple-900/20 dark:to-gray-800 border-l-4 border-purple-500"
                data-testid={`click-target-${target.number}`}
              >
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md">
                      {target.number}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {target.label}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {target.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {tips && tips.length > 0 && (
            <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span>💡</span> Pro Tips
              </h4>
              <ul className="space-y-2">
                {tips.map((tip, index) => (
                  <li
                    key={index}
                    className="flex gap-2 text-sm text-gray-700 dark:text-gray-300"
                  >
                    <Badge variant="secondary" className="flex-shrink-0 h-6">
                      {index + 1}
                    </Badge>
                    <span className="flex-1">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
