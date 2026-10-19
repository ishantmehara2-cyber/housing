import React from 'react';
import { PropertyDetail } from '@housing-clone/shared';
import { Edit2, Building2, MapPin, Tag, CheckCircle2, ShieldCheck } from 'lucide-react';

interface Step7ReviewProps {
  draft: PropertyDetail;
  onEditStep: (step: number) => void;
}

export const Step7Review: React.FC<Step7ReviewProps> = ({ draft, onEditStep }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Review & Submit Listing</h2>
        <p className="text-sm text-gray-500">
          Verify all details before submitting your property for moderation.
        </p>
      </div>

      {/* Primary Banner */}
      <div className="p-4 bg-brand-50 border border-brand-200 rounded-xl flex items-start space-x-3">
        <ShieldCheck className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
        <div className="text-xs text-brand-dark">
          <p className="font-bold">Moderation Assurance</p>
          <p>
            Your listing will be reviewed by our moderation team within 2 hours. Once verified, it will be published to active property searches.
          </p>
        </div>
      </div>

      {/* Section 1: Purpose & Type */}
      <div className="p-5 bg-white border border-gray-200 rounded-xl space-y-2 relative">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900 flex items-center space-x-2 text-sm">
            <Tag className="w-4 h-4 text-brand-primary" />
            <span>1. Listing Purpose & Property Type</span>
          </h3>
          <button
            type="button"
            onClick={() => onEditStep(1)}
            className="text-xs font-semibold text-brand-primary hover:underline flex items-center space-x-1"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
        </div>
        <p className="text-sm text-gray-700">
          <span className="font-semibold">{draft.listingPurpose}</span> ({draft.propertyCategory}) —{' '}
          <span className="font-semibold text-brand-primary">{draft.propertyType.name}</span>
        </p>
      </div>

      {/* Section 2: Details */}
      <div className="p-5 bg-white border border-gray-200 rounded-xl space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900 flex items-center space-x-2 text-sm">
            <Building2 className="w-4 h-4 text-brand-primary" />
            <span>2. Property Specifications</span>
          </h3>
          <button
            type="button"
            onClick={() => onEditStep(2)}
            className="text-xs font-semibold text-brand-primary hover:underline flex items-center space-x-1"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-gray-600">
          <div><span className="font-semibold text-gray-800">BHK:</span> {draft.bhk || 'N/A'}</div>
          <div><span className="font-semibold text-gray-800">Carpet Area:</span> {draft.carpetArea} {draft.areaUnit}</div>
          <div><span className="font-semibold text-gray-800">Furnishing:</span> {draft.furnishing}</div>
          <div><span className="font-semibold text-gray-800">Floor:</span> {draft.floorNumber ?? 'N/A'} / {draft.totalFloors ?? 'N/A'}</div>
        </div>
      </div>

      {/* Section 3: Location */}
      <div className="p-5 bg-white border border-gray-200 rounded-xl space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900 flex items-center space-x-2 text-sm">
            <MapPin className="w-4 h-4 text-brand-primary" />
            <span>3. Property Location</span>
          </h3>
          <button
            type="button"
            onClick={() => onEditStep(3)}
            className="text-xs font-semibold text-brand-primary hover:underline flex items-center space-x-1"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
        </div>
        <p className="text-sm text-gray-700">
          {draft.address}, {draft.locality.name}, {draft.city.name} {draft.pincode ? `(${draft.pincode})` : ''}
        </p>
      </div>

      {/* Section 4: Pricing */}
      <div className="p-5 bg-white border border-gray-200 rounded-xl space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900 flex items-center space-x-2 text-sm">
            <span>4. Financial Terms</span>
          </h3>
          <button
            type="button"
            onClick={() => onEditStep(4)}
            className="text-xs font-semibold text-brand-primary hover:underline flex items-center space-x-1"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
        </div>
        <p className="text-sm font-bold text-brand-primary">
          {draft.price ? `₹ ${draft.price.toLocaleString('en-IN')}` : draft.rent ? `₹ ${draft.rent.toLocaleString('en-IN')} / month` : 'Contact for Price'}
        </p>
      </div>

      {/* Section 5 & 6: Amenities & Photos */}
      <div className="p-5 bg-white border border-gray-200 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900 flex items-center space-x-2 text-sm">
            <span>5 & 6. Amenities & Media ({draft.media.length} photos)</span>
          </h3>
          <button
            type="button"
            onClick={() => onEditStep(6)}
            className="text-xs font-semibold text-brand-primary hover:underline flex items-center space-x-1"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
        </div>
        {draft.media.length > 0 && (
          <div className="flex items-center space-x-2 overflow-x-auto pb-1">
            {draft.media.slice(0, 4).map((m) => (
              <img key={m.id} src={m.thumbnailUrl || m.url} alt="Gallery" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
            ))}
          </div>
        )}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {draft.amenities.map((a) => (
            <span key={a.id} className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md text-xs font-medium flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3 text-green-600" />
              <span>{a.name}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
