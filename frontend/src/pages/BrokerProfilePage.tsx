import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BrokerDetail, ContactBrokerInput } from '@housing-clone/shared';
import { brokerService } from '../services/brokerService';
import { useAuthStore } from '../store/useAuthStore';
import { PropertyCard } from '../components/property/PropertyCard';
import {
  MapPin,
  CheckCircle2,
  Star,
  Building2,
  PhoneCall,
  ChevronLeft,
  Send,
  Loader2,
  AlertCircle,
  ShieldAlert,
  Briefcase,
  UserCheck,
} from 'lucide-react';

export const BrokerProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { user, isAuthenticated } = useAuthStore();

  const [broker, setBroker] = useState<BrokerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Enquiry form state
  const [contactName, setContactName] = useState(user?.firstName ? `${user.firstName} ${user.lastName}` : '');
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [contactPhone, setContactPhone] = useState(user?.phone || '');
  const [contactMessage, setContactMessage] = useState('I am interested in your property listings. Please share further details.');
  const [submitting, setSubmitting] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);

  const fetchBrokerDetail = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await brokerService.getBrokerById(id);
      setBroker(data);
      document.title = `${data.firstName} ${data.lastName} - Verified Real Estate Broker | Housing Clone`;
    } catch {
      setError('Broker profile not found or unavailable');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBrokerDetail();
  }, [fetchBrokerDetail]);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    if (!isAuthenticated) {
      setContactError('Please log in to contact this broker.');
      return;
    }

    try {
      setSubmitting(true);
      setContactError(null);

      const payload: ContactBrokerInput = {
        name: contactName,
        email: contactEmail,
        phone: contactPhone,
        message: contactMessage,
      };

      await brokerService.contactBroker(id, payload);
      setContactSuccess(true);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const resErr = (err as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error;
        setContactError(resErr?.message || 'Failed to send enquiry');
      } else {
        setContactError('Connection error. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-primary mx-auto" />
          <p className="text-sm font-semibold text-gray-600">Loading broker profile...</p>
        </div>
      </div>
    );
  }

  if (error || !broker) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-200 text-center space-y-4 max-w-md w-full">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold text-gray-900">Broker Not Found</h2>
          <p className="text-sm text-gray-600">{error || 'The requested broker profile does not exist.'}</p>
          <button
            onClick={() => navigate('/brokers')}
            className="w-full bg-brand-primary hover:bg-brand-hover text-white py-2.5 rounded-xl font-semibold text-sm transition"
          >
            Back to Broker Directory
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Back Navigation Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <button
            onClick={() => navigate('/brokers')}
            className="inline-flex items-center space-x-1 text-xs font-bold text-gray-500 hover:text-brand-primary transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Brokers Directory</span>
          </button>
        </div>
      </div>

      {/* Main Profile Header Banner */}
      <div className="bg-white border-b border-gray-200 py-8 shadow-sm">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Left: Avatar & Basic Info */}
            <div className="flex items-start space-x-5">
              <div className="relative shrink-0">
                {broker.avatarUrl ? (
                  <img
                    src={broker.avatarUrl}
                    alt={`${broker.firstName} ${broker.lastName}`}
                    className="w-24 h-24 rounded-2xl object-cover border-2 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-red-500 to-brand-primary text-white font-extrabold text-3xl flex items-center justify-center shadow-lg">
                    {broker.firstName[0]}
                    {broker.lastName[0]}
                  </div>
                )}
                {broker.verified && (
                  <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1 rounded-full shadow">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                    {broker.firstName} {broker.lastName}
                  </h1>
                  {broker.verified && (
                    <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 inline-flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Verified Partner</span>
                    </span>
                  )}
                </div>

                <p className="text-sm font-semibold text-gray-600">
                  {broker.agencyName ? `${broker.agencyName} • ` : ''}
                  <span className="capitalize">{broker.role}</span>
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    <span className="font-semibold text-gray-700">{broker.city}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                    <span>{broker.experienceYears} Years Experience</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center space-x-1 text-amber-600 font-bold">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{broker.rating} ({broker.reviewCount} reviews)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Quick Stats & CTA */}
            <div className="flex items-center space-x-4 shrink-0">
              <div className="bg-red-50 border border-red-100 p-3 rounded-2xl text-center min-w-[100px]">
                <p className="text-xs text-brand-primary font-bold uppercase">Listings</p>
                <p className="text-2xl font-extrabold text-brand-primary">{broker.activeListingCount}</p>
              </div>
              <a
                href="#contact-section"
                className="bg-brand-primary hover:bg-brand-hover text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md transition flex items-center space-x-2"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Contact Broker</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Page Layout */}
      <div className="max-w-6xl mx-auto px-4 pt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 cols): About, Areas Served, Active Listings */}
        <div className="lg:col-span-2 space-y-8">
          {/* About Section */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-3">
            <h2 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
              <UserCheck className="w-5 h-5 text-brand-primary" />
              <span>About {broker.firstName}</span>
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">{broker.about}</p>

            <div className="pt-4 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <p className="text-gray-400 font-medium">Areas Served</p>
                <p className="font-bold text-gray-900 mt-0.5">{broker.areasServed.join(', ')}</p>
              </div>
              <div>
                <p className="text-gray-400 font-medium">Property Types</p>
                <p className="font-bold text-gray-900 mt-0.5">{broker.propertyTypesServed.join(', ')}</p>
              </div>
              <div>
                <p className="text-gray-400 font-medium">Specialization</p>
                <p className="font-bold text-gray-900 mt-0.5">{broker.specialization}</p>
              </div>
            </div>
          </div>

          {/* Active Listings Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-brand-primary" />
                <span>Active Listings ({broker.activeProperties.length})</span>
              </h2>
            </div>

            {broker.activeProperties.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center space-y-2 text-gray-500 text-sm">
                <p>No active property listings available for this broker at the moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {broker.activeProperties.map((prop) => (
                  <PropertyCard key={prop.id} property={prop} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 col): Contact Box */}
        <div className="space-y-6" id="contact-section">
          <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 space-y-4 sticky top-6">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-gray-900">Enquire with {broker.firstName}</h3>
              <p className="text-xs text-gray-500">Send a direct message to discuss properties or schedule visits</p>
            </div>

            {contactSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="font-bold text-sm">Enquiry Sent Successfully!</p>
                <p className="text-xs text-emerald-700">
                  {broker.firstName} has been notified and will get in touch with you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-3">
                {contactError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center space-x-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{contactError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Rahul Sharma"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-brand-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Your Email</label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="rahul@example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-brand-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Your Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-brand-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Message</label>
                  <textarea
                    rows={3}
                    required
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-brand-primary outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-brand-primary hover:bg-brand-hover text-white py-3 rounded-xl font-bold text-xs shadow transition flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending Message...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Enquiry</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
