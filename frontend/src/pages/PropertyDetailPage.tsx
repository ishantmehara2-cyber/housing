import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PropertyDetail } from '@housing-clone/shared';
import { propertyService } from '../services/propertyService';
import { recentlyViewedService } from '../services/recentlyViewedService';
import { useAuthStore } from '../store/useAuthStore';
import { PropertyGallery } from '../components/property/PropertyGallery';
import { PropertySummary } from '../components/property/PropertySummary';
import { PropertyAmenities } from '../components/property/PropertyAmenities';
import { PropertyLocation } from '../components/property/PropertyLocation';
import { PropertyContactCard } from '../components/property/PropertyContactCard';
import { SimilarProperties } from '../components/property/SimilarProperties';
import { EnquiryModal } from '../components/property/EnquiryModal';
import { ScheduleVisitModal } from '../components/property/ScheduleVisitModal';
import { Building2, AlertCircle, ArrowLeft, ShieldCheck } from 'lucide-react';

export const PropertyDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated } = useAuthStore();
  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);
  const [visitModalOpen, setVisitModalOpen] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setErrorMsg(null);

    propertyService
      .getPropertyBySlug(slug)
      .then((data) => {
        setProperty(data);
        document.title = `${data.title} | Housing.clone Marketplace`;

        if (isAuthenticated) {
          recentlyViewedService.recordView(data.id);
        }
      })
      .catch((err: unknown) => {
        if (err && typeof err === 'object' && 'response' in err) {
          const resErr = (err as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error;
          setErrorMsg(resErr?.message || 'Property not found');
        } else {
          setErrorMsg('Property not found or unavailable');
        }
      })
      .finally(() => setLoading(false));
  }, [slug, isAuthenticated]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-6 animate-pulse">
        <div className="h-96 bg-gray-200 rounded-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-32 bg-gray-200 rounded-2xl" />
            <div className="h-48 bg-gray-200 rounded-2xl" />
          </div>
          <div className="h-64 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (errorMsg || !property) {
    return (
      <div className="max-w-2xl mx-auto my-16 p-8 bg-white border border-gray-200 rounded-3xl shadow-sm text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h1 className="text-2xl font-bold text-gray-900">Property Not Found</h1>
        <p className="text-gray-500 text-xs">{errorMsg || 'The property listing you are looking for does not exist or has been removed.'}</p>
        <Link
          to="/search"
          className="inline-flex items-center space-x-2 bg-brand-primary text-white px-6 py-2.5 rounded-xl font-bold text-xs hover:bg-brand-hover transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Property Search</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      {/* Enquiry Modal */}
      <EnquiryModal
        isOpen={enquiryModalOpen}
        onClose={() => setEnquiryModalOpen(false)}
        propertyId={property.id}
        propertyTitle={property.title}
      />

      {/* Schedule Visit Modal */}
      <ScheduleVisitModal
        isOpen={visitModalOpen}
        onClose={() => setVisitModalOpen(false)}
        propertyId={property.id}
        propertyTitle={property.title}
      />

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Photo & Media Gallery */}
        <PropertyGallery media={property.media} title={property.title} />

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <PropertySummary property={property} />

            {/* Description Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-3">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">Property Overview</h2>
              <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">{property.description}</p>
            </div>

            {/* Amenities Section */}
            <PropertyAmenities amenities={property.amenities} />

            {/* Location Section */}
            <PropertyLocation
              address={property.address}
              landmark={property.landmark}
              pincode={property.pincode}
              city={property.city}
              locality={property.locality}
              latitude={property.latitude}
              longitude={property.longitude}
            />

            {/* Project Banner if present */}
            {property.project && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-5 h-5 text-brand-primary" />
                    <h2 className="text-lg font-bold text-gray-900">Project: {property.project.name}</h2>
                  </div>
                  {property.project.reraId && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>RERA: {property.project.reraId}</span>
                    </span>
                  )}
                </div>
                {property.project.description && (
                  <p className="text-xs text-gray-600 leading-relaxed">{property.project.description}</p>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Contact Sidebar */}
          <div>
            <PropertyContactCard
              postedByUser={property.postedByUser}
              onEnquireClick={() => {
                if (!isAuthenticated) {
                  window.location.href = '/auth/login';
                  return;
                }
                setEnquiryModalOpen(true);
              }}
            />
          </div>
        </div>

        {/* Similar Property Recommendations */}
        <SimilarProperties
          currentPropertyId={property.id}
          citySlug={property.city.slug}
          listingPurpose={property.listingPurpose}
        />
      </div>
    </div>
  );
};
