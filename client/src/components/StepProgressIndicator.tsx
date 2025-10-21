import { CheckCircle, Circle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: string;
  title: string;
  description?: string;
  status: 'completed' | 'current' | 'upcoming';
}

interface StepProgressIndicatorProps {
  steps: Step[];
  currentStep: number;
  orientation?: 'horizontal' | 'vertical';
  showDescriptions?: boolean;
  className?: string;
}

/**
 * StepProgressIndicator - Visual progress component for multi-step flows
 * 
 * Features:
 * - Shows current position with visual milestones
 * - Displays completed, current, and upcoming steps
 * - Supports horizontal and vertical orientations
 * - Optional step descriptions
 */
export default function StepProgressIndicator({
  steps,
  currentStep,
  orientation = 'horizontal',
  showDescriptions = false,
  className
}: StepProgressIndicatorProps) {
  const isHorizontal = orientation === 'horizontal';

  return (
    <div
      className={cn(
        isHorizontal ? 'flex items-center' : 'flex flex-col',
        className
      )}
      data-testid="step-progress-indicator"
    >
      {steps.map((step, index) => {
        const isCompleted = step.status === 'completed' || index < currentStep;
        const isCurrent = step.status === 'current' || index === currentStep;
        const isUpcoming = step.status === 'upcoming' || index > currentStep;
        const isLast = index === steps.length - 1;

        return (
          <div
            key={step.id}
            className={cn(
              'flex',
              isHorizontal ? 'flex-col items-center flex-1' : 'flex-row items-start',
              !isLast && (isHorizontal ? 'relative' : 'pb-8')
            )}
            data-testid={`step-${index}`}
          >
            {/* Step Circle and Content */}
            <div className={cn(
              'flex items-center',
              isHorizontal ? 'flex-col' : 'flex-row gap-3'
            )}>
              {/* Circle Icon */}
              <div
                className={cn(
                  'relative z-10 flex items-center justify-center rounded-full transition-all duration-300',
                  isCompleted && 'bg-green-500 text-white',
                  isCurrent && 'bg-purple-600 text-white ring-4 ring-purple-100 dark:ring-purple-900/50',
                  isUpcoming && 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500',
                  isCurrent ? 'h-10 w-10' : 'h-8 w-8'
                )}
                data-testid={`step-circle-${index}`}
              >
                {isCompleted ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <Circle className={cn(
                    isCurrent ? 'h-5 w-5' : 'h-4 w-4',
                    isCurrent && 'fill-current'
                  )} />
                )}
              </div>

              {/* Step Title and Description */}
              <div className={cn(
                'text-center',
                isHorizontal ? 'mt-2' : 'flex-1'
              )}>
                <p
                  className={cn(
                    'text-sm font-medium transition-colors',
                    isCompleted && 'text-gray-700 dark:text-gray-300',
                    isCurrent && 'text-purple-700 dark:text-purple-400 font-semibold',
                    isUpcoming && 'text-gray-500 dark:text-gray-400'
                  )}
                  data-testid={`step-title-${index}`}
                >
                  {step.title}
                </p>
                {showDescriptions && step.description && (
                  <p className={cn(
                    'text-xs mt-1',
                    isCompleted && 'text-gray-600 dark:text-gray-400',
                    isCurrent && 'text-purple-600 dark:text-purple-400',
                    isUpcoming && 'text-gray-400 dark:text-gray-500'
                  )}>
                    {step.description}
                  </p>
                )}
              </div>
            </div>

            {/* Connector Line */}
            {!isLast && (
              <div className={cn(
                'transition-colors duration-300',
                isHorizontal ? 'absolute left-1/2 top-4 h-0.5 w-full' : 'absolute left-4 top-10 h-full w-0.5',
                isCompleted ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
              )}>
                {isHorizontal && (
                  <ChevronRight className={cn(
                    'absolute -right-2 -top-2 h-4 w-4',
                    isCompleted ? 'text-green-500' : 'text-gray-300 dark:text-gray-600'
                  )} />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * CompactProgressIndicator - Simplified progress bar with step count
 * For use in tight spaces or as a supplementary indicator
 */
export function CompactProgressIndicator({
  currentStep,
  totalSteps,
  label,
  className
}: {
  currentStep: number;
  totalSteps: number;
  label?: string;
  className?: string;
}) {
  const percentage = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className={cn('space-y-2', className)} data-testid="compact-progress-indicator">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-400">
          {label || 'Progress'}
        </span>
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {currentStep + 1} of {totalSteps}
        </span>
      </div>
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
          data-testid="progress-bar"
        />
      </div>
    </div>
  );
}

/**
 * MilestoneProgressIndicator - Progress with milestone markers
 * Shows key milestones in a journey with labels
 */
export function MilestoneProgressIndicator({
  milestones,
  currentMilestone,
  className
}: {
  milestones: { id: string; label: string; icon?: React.ReactNode }[];
  currentMilestone: number;
  className?: string;
}) {
  return (
    <div className={cn('relative', className)} data-testid="milestone-progress-indicator">
      {/* Progress Line */}
      <div className="absolute left-0 right-0 top-4 h-1 bg-gray-200 dark:bg-gray-700">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
          style={{ width: `${(currentMilestone / (milestones.length - 1)) * 100}%` }}
        />
      </div>

      {/* Milestone Markers */}
      <div className="relative flex justify-between">
        {milestones.map((milestone, index) => {
          const isCompleted = index < currentMilestone;
          const isCurrent = index === currentMilestone;
          const isUpcoming = index > currentMilestone;

          return (
            <div
              key={milestone.id}
              className="flex flex-col items-center"
              data-testid={`milestone-${index}`}
            >
              <div
                className={cn(
                  'flex items-center justify-center rounded-full transition-all duration-300 mb-2',
                  isCompleted && 'bg-green-500 text-white h-8 w-8',
                  isCurrent && 'bg-purple-600 text-white h-10 w-10 ring-4 ring-purple-100 dark:ring-purple-900/50',
                  isUpcoming && 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 h-8 w-8'
                )}
              >
                {milestone.icon || (
                  isCompleted ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <span className="text-xs font-bold">{index + 1}</span>
                  )
                )}
              </div>
              <span
                className={cn(
                  'text-xs text-center max-w-[80px]',
                  isCompleted && 'text-gray-600 dark:text-gray-400',
                  isCurrent && 'text-purple-700 dark:text-purple-400 font-semibold',
                  isUpcoming && 'text-gray-400 dark:text-gray-500'
                )}
              >
                {milestone.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
