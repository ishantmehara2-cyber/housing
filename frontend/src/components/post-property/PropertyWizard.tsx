import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ListingPurpose,
  PropertyCategory,
  PropertyDetail,
  AreaUnit,
  Furnishing,
  Facing,
  PropertyAge,
  PossessionStatus,
  PropertyMediaSummary,
  Role,
} from '@housing-clone/shared';
import { draftService } from '../../services/draftService';
import { useAuthStore } from '../../store/useAuthStore';
import { StepIndicator } from './StepIndicator';
import { DraftSaveIndicator, SaveStatus } from './DraftSaveIndicator';
import { WizardNavigation } from './WizardNavigation';
import { Step1Purpose } from './Step1Purpose';
import { Step2Details } from './Step2Details';
import { Step3Location } from './Step3Location';
import { Step4Pricing } from './Step4Pricing';
import { Step5Amenities } from './Step5Amenities';
import { Step6Media } from './Step6Media';
import { Step7Review } from './Step7Review';
import { AlertCircle, CheckCircle2, Lock, ShieldAlert, RefreshCw } from 'lucide-react';

type InitStatus = 'initializing' | 'success' | 'auth_error' | 'forbidden_error' | 'error' | 'timeout_error';

export const PropertyWizard: React.FC = () => {
  const navigate = useNavigate();
  const isInitializing = useAuthStore((state) => state.isInitializing);

  const [draft, setDraft] = useState<PropertyDetail | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const [initStatus, setInitStatus] = useState<InitStatus>('initializing');
  const [initError, setInitError] = useState<string | null>(null);

  const initRef = useRef(false);

  const initDraft = useCallback(async () => {
    setInitStatus('initializing');
    setInitError(null);

    // Wait for auth store initialization if in progress
    if (useAuthStore.getState().isInitializing) {
      return;
    }

    const currentUser = useAuthStore.getState().user;
    const isAuth = useAuthStore.getState().isAuthenticated;

    if (!isAuth || !currentUser) {
      setInitStatus('auth_error');
      setInitError('Authentication required. Please log in to post a property.');
      return;
    }

    if (currentUser.role === Role.TENANT_BUYER || currentUser.role === Role.VISITOR) {
      setInitStatus('forbidden_error');
      setInitError('Tenant and Buyer accounts cannot create property listings. Please register or log in as an Owner, Agent, or Developer.');
      return;
    }

    try {
      // 10s network timeout safety for draft initialization
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('NETWORK_TIMEOUT')), 10000)
      );

      const fetchOrCreatePromise = (async () => {
        const existingDrafts = await draftService.getDrafts();
        if (existingDrafts.length > 0) {
          return existingDrafts[0];
        } else {
          return await draftService.createDraft({
            listingPurpose: ListingPurpose.BUY,
            propertyCategory: PropertyCategory.RESIDENTIAL,
            propertyTypeId: 'apartment',
          });
        }
      })();

      const activeDraft = await Promise.race([fetchOrCreatePromise, timeoutPromise]);
      setDraft(activeDraft);
      setCurrentStep(activeDraft.completedStep || 1);
      setInitStatus('success');
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'NETWORK_TIMEOUT') {
        setInitStatus('timeout_error');
        setInitError('Request timed out while connecting to the server. Please check your network connection and try again.');
        return;
      }

      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { status?: number; data?: { error?: { code?: string; message?: string } } } };
        const status = axiosErr.response?.status;
        const resErr = axiosErr.response?.data?.error;
        const msg = resErr?.message || 'Failed to initialize draft listing';

        if (status === 401 || resErr?.code === 'UNAUTHORIZED') {
          setInitStatus('auth_error');
          setInitError('Your session has expired or you are not logged in. Please log in to continue.');
        } else if (status === 403 || resErr?.code === 'FORBIDDEN') {
          setInitStatus('forbidden_error');
          setInitError(msg || 'Tenant and Buyer accounts cannot create property listings.');
        } else {
          setInitStatus('error');
          setInitError(msg);
        }
      } else {
        setInitStatus('error');
        setInitError('Server connection error. Unable to initialize Post Property wizard.');
      }
    }
  }, []);

  useEffect(() => {
    if (!isInitializing && !initRef.current) {
      initRef.current = true;
      initDraft();
    }
  }, [isInitializing, initDraft]);

  const handleRetryInit = () => {
    initRef.current = false;
    initDraft();
  };

  // Debounced Autosave handler
  const triggerAutosave = useCallback(
    async (updatedFields: Record<string, unknown>, targetStep?: number) => {
      if (!draft) return;
      setSaveStatus('saving');
      setErrorMsg(null);

      try {
        const nextStep = targetStep || currentStep;
        const updated = await draftService.updateDraft(draft.id, {
          ...updatedFields,
          completedStep: Math.max(draft.completedStep || 1, nextStep),
        });
        setDraft(updated);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch {
        setSaveStatus('error');
      }
    },
    [draft, currentStep]
  );

  const handleNext = async () => {
    if (!draft) return;
    setErrorMsg(null);

    // Step Validation
    if (currentStep === 1 && !draft.propertyType?.id) {
      setErrorMsg('Please select a property type to proceed');
      return;
    }

    if (currentStep === 2 && (!draft.carpetArea || draft.carpetArea <= 0)) {
      setErrorMsg('Please enter a valid carpet area');
      return;
    }

    if (currentStep === 3 && (!draft.address || !draft.city?.id || !draft.locality?.id)) {
      setErrorMsg('Please enter street address, city, and locality');
      return;
    }

    if (currentStep === 4) {
      if (draft.listingPurpose === ListingPurpose.RENT && (!draft.rent || draft.rent <= 0)) {
        setErrorMsg('Please enter a valid monthly rent amount');
        return;
      }
      if (draft.listingPurpose === ListingPurpose.BUY && (!draft.price || draft.price <= 0)) {
        setErrorMsg('Please enter a valid total sale price');
        return;
      }
    }

    if (currentStep === 6 && draft.media.length === 0) {
      setErrorMsg('Please upload at least one property photograph before proceeding to review');
      return;
    }

    const nextStep = Math.min(currentStep + 1, 7);
    setCurrentStep(nextStep);
    await triggerAutosave({}, nextStep);
  };

  const handleBack = () => {
    setErrorMsg(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!draft) return;
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await draftService.submitDraft(draft.id);
      setSubmittedSuccess(true);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const resErr = (err as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error;
        setErrorMsg(resErr?.message || 'Failed to submit property listing');
      } else {
        setErrorMsg('Submission error. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedSuccess) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white rounded-2xl shadow-xl border border-gray-100 text-center space-y-4">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
        <h1 className="text-3xl font-bold text-gray-900">Property Submitted Successfully!</h1>
        <p className="text-gray-600 text-sm max-w-md mx-auto">
          Your property listing has been submitted for moderation. You can track its approval status in your Owner Dashboard.
        </p>
        <div className="pt-4 flex justify-center space-x-4">
          <button
            onClick={() => navigate('/dashboard/owner')}
            className="bg-brand-primary hover:bg-brand-hover text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition"
          >
            Go to Owner Dashboard
          </button>
          <button
            onClick={() => navigate('/search')}
            className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2.5 rounded-lg font-semibold text-sm transition"
          >
            Browse Properties
          </button>
        </div>
      </div>
    );
  }

  if (initStatus === 'auth_error') {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl shadow-xl border border-gray-100 text-center space-y-4">
        <Lock className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold text-gray-900">Authentication Required</h2>
        <p className="text-sm text-gray-600">{initError || 'Please log in to your account to post a property listing.'}</p>
        <div className="pt-2">
          <button
            onClick={() => navigate('/auth/login')}
            className="w-full bg-brand-primary hover:bg-brand-hover text-white py-2.5 rounded-lg font-semibold text-sm transition"
          >
            Log In to Continue
          </button>
        </div>
      </div>
    );
  }

  if (initStatus === 'forbidden_error') {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl shadow-xl border border-gray-100 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-gray-900">Listing Creation Restricted</h2>
        <p className="text-sm text-gray-600">{initError}</p>
        <div className="pt-2 flex flex-col space-y-2">
          <button
            onClick={() => navigate('/dashboard/tenant')}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2.5 rounded-lg font-semibold text-sm transition"
          >
            Go to Tenant Dashboard
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 py-2.5 rounded-lg font-semibold text-sm transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (initStatus === 'error' || initStatus === 'timeout_error') {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl shadow-xl border border-gray-100 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-gray-900">
          {initStatus === 'timeout_error' ? 'Connection Timeout' : 'Initialization Failed'}
        </h2>
        <p className="text-sm text-gray-600">{initError || 'An unexpected error occurred while loading the wizard.'}</p>
        <div className="pt-2">
          <button
            onClick={handleRetryInit}
            className="w-full bg-brand-primary hover:bg-brand-hover text-white py-2.5 rounded-lg font-semibold text-sm transition flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry Loading Wizard</span>
          </button>
        </div>
      </div>
    );
  }

  if (initStatus === 'initializing' || isInitializing || !draft) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-primary mx-auto" />
          <p className="text-sm font-semibold text-gray-700">Preparing your property listing...</p>
          <p className="text-xs text-gray-400">Loading existing draft details</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-[85vh] pb-12">
      <StepIndicator currentStep={currentStep} completedSteps={draft.completedStep || 1} onStepClick={setCurrentStep} />

      <div className="max-w-4xl mx-auto px-4 pt-6">
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Step {currentStep} of 7</span>
          <DraftSaveIndicator status={saveStatus} />
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Step Views */}
        {currentStep === 1 && (
          <Step1Purpose
            listingPurpose={draft.listingPurpose}
            propertyCategory={draft.propertyCategory}
            propertyTypeId={draft.propertyType.id}
            onChange={(data) => {
              setDraft({ ...draft, ...data, propertyType: { ...draft.propertyType, id: data.propertyTypeId } });
              triggerAutosave(data);
            }}
          />
        )}

        {currentStep === 2 && (
          <Step2Details
            bhk={draft.bhk}
            bedrooms={draft.bedrooms}
            bathrooms={draft.bathrooms}
            balconies={draft.balconies}
            carpetArea={draft.carpetArea}
            builtUpArea={draft.builtUpArea}
            areaUnit={draft.areaUnit as AreaUnit}
            furnishing={draft.furnishing as Furnishing}
            floorNumber={draft.floorNumber}
            totalFloors={draft.totalFloors}
            facing={draft.facing as Facing}
            propertyAge={draft.propertyAge as PropertyAge}
            possessionStatus={draft.possessionStatus as PossessionStatus}
            onChange={(data) => {
              setDraft({ ...draft, ...data } as PropertyDetail);
              triggerAutosave(data);
            }}
          />
        )}

        {currentStep === 3 && (
          <Step3Location
            cityId={draft.city.id}
            localityId={draft.locality.id}
            subLocalityId={draft.subLocality?.id || null}
            address={draft.address}
            landmark={draft.landmark}
            pincode={draft.pincode}
            latitude={draft.latitude}
            longitude={draft.longitude}
            onChange={(data) => {
              setDraft({ ...draft, ...data } as PropertyDetail);
              triggerAutosave(data);
            }}
          />
        )}

        {currentStep === 4 && (
          <Step4Pricing
            listingPurpose={draft.listingPurpose}
            price={draft.price}
            rent={draft.rent}
            securityDeposit={draft.securityDeposit}
            maintenanceFee={draft.maintenanceFee}
            possessionDate={draft.possessionDate}
            onChange={(data) => {
              setDraft({ ...draft, ...data } as PropertyDetail);
              triggerAutosave(data);
            }}
          />
        )}

        {currentStep === 5 && (
          <Step5Amenities
            selectedAmenityIds={draft.amenities.map((a) => a.id)}
            onChange={(amenityIds) => {
              triggerAutosave({ amenityIds });
            }}
          />
        )}

        {currentStep === 6 && (
          <Step6Media
            propertyId={draft.id}
            media={draft.media as PropertyMediaSummary[]}
            onChange={(newMedia) => {
              setDraft({ ...draft, media: newMedia });
            }}
          />
        )}

        {currentStep === 7 && <Step7Review draft={draft} onEditStep={setCurrentStep} />}

        {/* Bottom Wizard Navigation */}
        <WizardNavigation
          currentStep={currentStep}
          onBack={handleBack}
          onNext={handleNext}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
};
