import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, MousePointer } from 'lucide-react';

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
  mockup: ReactNode;
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
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-3"
      >
        <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
          {title}
        </h2>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          {description}
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Visual Mockup with Highlights - Takes more space */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-3"
        >
          <Card className="p-3 sm:p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
            <div className="relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-inner border border-gray-100 dark:border-gray-700">
              {mockup}
              
              {/* Professional numbered overlays for click targets */}
              {clickTargets.map((target, index) => (
                <motion.div
                  key={target.number}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="absolute pointer-events-none"
                  style={{
                    top: target.top,
                    left: target.left,
                    width: target.width,
                    height: target.height
                  }}
                >
                  <div className="relative w-full h-full">
                    {/* Refined highlight border */}
                    <div className="absolute inset-0 border-2 border-teal-500 dark:border-teal-400 rounded-lg bg-teal-500/10 dark:bg-teal-400/10 shadow-[0_0_0_1px_rgba(20,184,166,0.3)]" />
                    
                    {/* Professional number badge */}
                    <div className="absolute -top-3 -left-3 w-7 h-7 bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-full flex items-center justify-center font-semibold text-sm shadow-lg ring-2 ring-white dark:ring-gray-800 z-10">
                      {target.number}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Click Target Instructions */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 space-y-4"
        >
          <div className="flex items-center gap-2 text-gray-900 dark:text-white">
            <MousePointer className="h-5 w-5 text-teal-600" />
            <h3 className="text-lg font-semibold">
              Interactive Guide
            </h3>
          </div>
          
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin">
            {clickTargets.map((target, index) => (
              <motion.div
                key={target.number}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.08 }}
              >
                <Card
                  className="p-3 sm:p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-600 transition-colors shadow-sm"
                  data-testid={`click-target-${target.number}`}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-full flex items-center justify-center font-semibold text-sm shadow-md">
                        {target.number}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                        {target.label}
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {target.description}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {tips && tips.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-br from-blue-50 to-teal-50 dark:from-blue-900/20 dark:to-teal-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/50"
            >
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                Pro Tips
              </h4>
              <ul className="space-y-2">
                {tips.map((tip, index) => (
                  <li
                    key={index}
                    className="flex gap-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300"
                  >
                    <span className="text-teal-500 font-medium flex-shrink-0">•</span>
                    <span className="flex-1">{tip}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
