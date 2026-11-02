import React, { useEffect, useState } from 'react';
import { brokerService } from '../services/brokerService';
import { User, Check } from 'lucide-react';

interface BrokerProfileRecord {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  developerMemberships?: Array<{
    developerOrganization?: { companyName?: string };
  }>;
}

export const BrokerProfileSettingsPage: React.FC = () => {
  const [profile, setProfile] = useState<BrokerProfileRecord | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [agencyName, setAgencyName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    brokerService.getMyBrokerProfile().then((res) => {
      const p = res as BrokerProfileRecord;
      setProfile(p || null);
      if (p) {
        setFirstName(p.firstName || '');
        setLastName(p.lastName || '');
        setPhone(p.phone || '');
        setAgencyName(p.developerMemberships?.[0]?.developerOrganization?.companyName || '');
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    try {
      await brokerService.updateMyBrokerProfile({
        firstName,
        lastName,
        phone,
        agencyName,
      });
      setSaved(true);
    } catch {
      alert('Failed to update broker profile');
    } finally {
      setSaving(false);
    }
  };

  if (!profile) {
    return <div className="p-8 text-center text-gray-400">Loading broker profile...</div>;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex items-center space-x-3 border-b border-gray-100 pb-4">
        <User className="w-6 h-6 text-brand-primary" />
        <div>
          <h1 className="text-xl font-black text-gray-900">Broker Agency Profile</h1>
          <p className="text-xs text-gray-500 font-medium">Manage your professional agent contact details and agency information</p>
        </div>
      </div>

      {saved && (
        <div className="p-3.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center space-x-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Broker profile updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs max-w-lg">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-gray-700 mb-1">First Name</label>
            <input
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-brand-primary font-semibold"
            />
          </div>
          <div>
            <label className="block font-bold text-gray-700 mb-1">Last Name</label>
            <input
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-brand-primary font-semibold"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-gray-700 mb-1">Phone Number</label>
          <input
            type="text"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-brand-primary font-semibold"
          />
        </div>

        <div>
          <label className="block font-bold text-gray-700 mb-1">Agency / Company Name</label>
          <input
            type="text"
            value={agencyName}
            onChange={(e) => setAgencyName(e.target.value)}
            placeholder="e.g. Apex Realty Partners"
            className="w-full p-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-brand-primary font-semibold"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-brand-primary hover:bg-brand-hover text-white font-bold px-6 py-2.5 rounded-xl transition shadow-sm disabled:opacity-50"
        >
          {saving ? 'Saving Changes...' : 'Save Profile Changes'}
        </button>
      </form>
    </div>
  );
};
