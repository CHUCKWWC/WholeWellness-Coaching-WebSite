import { motion } from 'framer-motion';
import { Check, Clock, Sparkles } from 'lucide-react';

interface StepInfo {
  title: string;
  estimatedMinutes: number;
}

interface EnhancedProgressBarProps {
  currentStep: number;
  steps: StepInfo[];
  userName?: string;
}

export default function EnhancedProgressBar({ currentStep, steps, userName }: EnhancedProgressBarProps) {
  const totalSteps = steps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;
  
  const remainingMinutes = steps
    .slice(currentStep)
    .reduce((sum, step) => sum + step.estimatedMinutes, 0);

  const completedMinutes = steps
    .slice(0, currentStep)
    .reduce((sum, step) => sum + step.estimatedMinutes, 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {userName ? `${userName}'s Progress` : 'Your Progress'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Step {currentStep + 1} of {totalSteps}: {steps[currentStep]?.title}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-purple-500" />
          <span className="text-gray-600 dark:text-gray-300">
            ~{remainingMinutes} min left
          </span>
        </div>
      </div>

      <div className="relative h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-4">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-600 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-white/30 to-transparent rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      <div className="flex justify-between items-center">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          
          return (
            <div
              key={index}
              className="flex flex-col items-center"
              style={{ width: `${100 / totalSteps}%` }}
            >
              <motion.div
                initial={false}
                animate={{
                  scale: isCurrent ? 1.2 : 1,
                  backgroundColor: isCompleted 
                    ? '#9333ea' 
                    : isCurrent 
                      ? '#3b82f6' 
                      : '#e5e7eb'
                }}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                  isCompleted || isCurrent ? 'text-white' : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                {isCompleted ? (
                  <Check className="h-3 w-3" />
                ) : isCurrent ? (
                  <Sparkles className="h-3 w-3" />
                ) : (
                  index + 1
                )}
              </motion.div>
              <span className={`mt-1 text-[10px] text-center hidden sm:block ${
                isCurrent 
                  ? 'text-purple-600 dark:text-purple-400 font-medium' 
                  : 'text-gray-400 dark:text-gray-500'
              }`}>
                {step.title.split(' ')[0]}
              </span>
            </div>
          );
        })}
      </div>

      {currentStep > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700"
        >
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            {completedMinutes > 0 && (
              <span className="text-green-600 dark:text-green-400">
                You've completed {completedMinutes} minutes of your journey! 
              </span>
            )}
            {' '}Keep going - you're doing great!
          </p>
        </motion.div>
      )}
    </div>
  );
}
