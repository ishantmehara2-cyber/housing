import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { paymentService, PackageRecord } from '../services/paymentService';
import { useAuthStore } from '../store/useAuthStore';
import { Check, Sparkles, Loader2 } from 'lucide-react';

export const PackagesPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [packages, setPackages] = useState<PackageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  useEffect(() => {
    paymentService
      .getPackages()
      .then((data) => setPackages(data))
      .finally(() => setLoading(false));
  }, []);

  const handleSelectPackage = async (pkg: PackageRecord) => {
    if (!isAuthenticated) {
      navigate('/auth/login');
      return;
    }

    setPurchasingId(pkg.id);
    try {
      const order = await paymentService.createOrder(pkg.id);

      // Simulate provider verification flow (HMAC signature verification)
      await paymentService.verifyPayment(order.transactionId, {
        providerOrderId: order.providerOrderId,
        providerPaymentId: `pay_rzp_${Date.now()}`,
        providerSignature: 'dummy_verified_hmac_signature',
      });

      alert(`Payment verified! Subscription activated for ${pkg.name}.`);
      navigate('/dashboard/billing');
    } catch {
      alert('Payment processing failed. Please try again.');
    } finally {
      setPurchasingId(null);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="bg-brand-50 text-brand-primary text-xs font-bold px-3 py-1 rounded-full uppercase border border-brand-200">
            Marketplace Monetization Plans
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900">Choose a Seller Package</h1>
          <p className="text-xs text-gray-500 font-medium">
            Unlock premium property listings, featured placement, and direct buyer leads with zero brokerage.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-96 bg-gray-200 animate-pulse rounded-3xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`bg-white rounded-3xl p-6 border transition shadow-sm hover:shadow-xl flex flex-col justify-between space-y-6 relative ${
                  pkg.featuredListingsCount > 0 ? 'border-brand-primary ring-2 ring-brand-primary/20' : 'border-gray-200'
                }`}
              >
                {pkg.featuredListingsCount > 0 && (
                  <span className="absolute -top-3 right-6 bg-brand-primary text-white text-[10px] font-black px-3 py-0.5 rounded-full uppercase flex items-center space-x-1 shadow-sm">
                    <Sparkles className="w-3 h-3" />
                    <span>Popular</span>
                  </span>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{pkg.name}</h3>
                    <p className="text-xs text-gray-400 font-medium">Designed for {pkg.targetRole}</p>
                  </div>

                  <div className="flex items-baseline space-x-1">
                    <span className="text-3xl font-black text-brand-primary">₹ {pkg.price.toLocaleString('en-IN')}</span>
                    <span className="text-xs text-gray-400 font-medium">/ {pkg.validityDays} Days</span>
                  </div>

                  <ul className="space-y-2.5 text-xs text-gray-700 font-semibold pt-4 border-t border-gray-100">
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{pkg.maxListings} Property Listings</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{pkg.featuredListingsCount} Featured Listing Boosts</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Instant Direct Buyer Enquiries & Leads</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Full {pkg.validityDays}-Day Validity Period</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => handleSelectPackage(pkg)}
                  disabled={purchasingId === pkg.id}
                  className="w-full bg-brand-primary hover:bg-brand-hover text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center space-x-2 transition shadow-md disabled:opacity-50"
                >
                  {purchasingId === pkg.id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing Order...</span>
                    </>
                  ) : (
                    <span>Choose Plan</span>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
