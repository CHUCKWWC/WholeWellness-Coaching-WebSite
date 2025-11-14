import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ClickTarget {
  selector: string;
  label: string;
  description: string;
  number: number;
  color?: string;
}

interface HtmlTutorialSlideProps {
  title: string;
  description: string;
  htmlContent: string;
  clickTargets: ClickTarget[];
  tips?: string[];
}

export function HtmlTutorialSlide({
  title,
  description,
  htmlContent,
  clickTargets,
  tips = []
}: HtmlTutorialSlideProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          {title}
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          {description}
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* HTML Preview with Highlights */}
        <Card className="p-4 bg-white dark:bg-gray-800 border-2">
          <div className="relative">
            <div 
              className="prose dark:prose-invert max-w-none text-sm scale-75 origin-top-left"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
              style={{ 
                pointerEvents: 'none',
                height: '400px',
                overflow: 'hidden'
              }}
            />
            {/* Overlay with click target highlights */}
            <div className="absolute inset-0 pointer-events-none">
              {clickTargets.map((target, index) => (
                <div
                  key={index}
                  className={`absolute rounded-lg border-4 ${
                    target.color || 'border-purple-500'
                  } animate-pulse`}
                  style={{
                    /* Position would be calculated based on selector */
                    top: `${20 + index * 80}px`,
                    left: '20px',
                    width: '200px',
                    height: '40px'
                  }}
                >
                  <div className="absolute -top-3 -left-3 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">
                    {target.number}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Click Target Instructions */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            What to Click
          </h3>
          <div className="space-y-3">
            {clickTargets.map((target) => (
              <Card
                key={target.number}
                className="p-4 bg-gradient-to-r from-purple-50 to-white dark:from-purple-900/20 dark:to-gray-800"
              >
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">
                      {target.number}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {target.label}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {target.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {tips.length > 0 && (
            <div className="mt-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                💡 Pro Tips
              </h4>
              <ul className="space-y-2">
                {tips.map((tip, index) => (
                  <li
                    key={index}
                    className="flex gap-2 text-sm text-gray-600 dark:text-gray-400"
                  >
                    <Badge variant="secondary" className="flex-shrink-0">
                      {index + 1}
                    </Badge>
                    <span>{tip}</span>
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
