import React from 'react';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  completedSteps: number;
  onStepClick: (step: number) => void;
}

const STEPS = [
  'Purpose & Type',
  'Property Details',
  'Location',
  'Pricing',
  'Amenities',
  'Photos & Media',
  'Review & Submit',
];

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, onStepClick }) => {
  return (
    <div className="w-full py-4 border-b border-gray-200 overflow-x-auto">
      <div className="max-w-5xl mx-auto flex items-center justify-between min-w-[650px] px-4">
        {STEPS.map((label, index) => {
          const stepNumber = index + 1;
          const isCurrent = currentStep === stepNumber;
          const isCompleted = currentStep > stepNumber;

          return (
            <React.Fragment key={stepNumber}>
              <div
                onClick={() => isCompleted && onStepClick(stepNumber)}
                className={`flex items-center space-x-2 cursor-pointer transition ${
                  isCompleted ? 'hover:text-brand-primary' : 'cursor-default'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                    isCurrent
                      ? 'bg-brand-primary text-white ring-4 ring-brand-100'
                      : isCompleted
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : stepNumber}
                </div>
                <span
                  className={`text-xs font-semibold whitespace-nowrap ${
                    isCurrent ? 'text-brand-primary font-bold' : isCompleted ? 'text-gray-800' : 'text-gray-400'
                  }`}
                >
                  {label}
                </span>
              </div>

              {index < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 transition ${
                    stepNumber < currentStep ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
