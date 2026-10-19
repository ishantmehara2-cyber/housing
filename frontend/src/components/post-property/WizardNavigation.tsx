import React from 'react';
import { ArrowLeft, ArrowRight, Loader2, Send } from 'lucide-react';

interface WizardNavigationProps {
  currentStep: number;
  totalSteps?: number;
  onBack: () => void;
  onNext: () => void;
  onSubmit?: () => void;
  isSubmitting?: boolean;
  canProceed?: boolean;
}

export const WizardNavigation: React.FC<WizardNavigationProps> = ({
  currentStep,
  totalSteps = 7,
  onBack,
  onNext,
  onSubmit,
  isSubmitting = false,
  canProceed = true,
}) => {
  const isLastStep = currentStep === totalSteps;

  return (
    <div className="flex items-center justify-between pt-6 border-t border-gray-200 mt-8">
      {currentStep > 1 ? (
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="inline-flex items-center space-x-2 border border-gray-300 hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-semibold transition disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      ) : (
        <div />
      )}

      {isLastStep ? (
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting || !canProceed}
          className="inline-flex items-center space-x-2 bg-brand-primary hover:bg-brand-hover text-white px-7 py-2.5 rounded-lg text-sm font-semibold transition shadow-md disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Submitting Listing...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Submit Property Listing</span>
            </>
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={onNext}
          disabled={isSubmitting || !canProceed}
          className="inline-flex items-center space-x-2 bg-brand-primary hover:bg-brand-hover text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition shadow-md disabled:opacity-50"
        >
          <span>Save & Continue</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
