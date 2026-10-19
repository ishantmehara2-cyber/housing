import { ListingPurpose } from '@housing-clone/shared';

interface Step4PricingProps {
  listingPurpose: ListingPurpose;
  price: number | null;
  rent: number | null;
  securityDeposit: number | null;
  maintenanceFee: number | null;
  possessionDate: string | null;
  onChange: (data: Partial<Step4PricingProps>) => void;
}

export const Step4Pricing: React.FC<Step4PricingProps> = ({
  listingPurpose,
  price,
  rent,
  securityDeposit,
  maintenanceFee,
  possessionDate,
  onChange,
}) => {
  const isRentOrPg = listingPurpose === ListingPurpose.RENT || listingPurpose === ListingPurpose.PG_COLIVING;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Pricing & Financial Terms</h2>
        <p className="text-sm text-gray-500">Set competitive pricing for your property listing</p>
      </div>

      {isRentOrPg ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Monthly Rent (₹) *</label>
            <input
              type="number"
              value={rent ?? ''}
              onChange={(e) => onChange({ rent: Math.max(0, Number(e.target.value)) })}
              placeholder="e.g. 35000"
              className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Security Deposit (₹)</label>
            <input
              type="number"
              value={securityDeposit ?? ''}
              onChange={(e) => onChange({ securityDeposit: Math.max(0, Number(e.target.value)) })}
              placeholder="e.g. 100000"
              className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Monthly Maintenance (₹)</label>
            <input
              type="number"
              value={maintenanceFee ?? ''}
              onChange={(e) => onChange({ maintenanceFee: Math.max(0, Number(e.target.value)) })}
              placeholder="e.g. 3000"
              className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary outline-none"
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Total Sale Price (₹) *</label>
            <input
              type="number"
              value={price ?? ''}
              onChange={(e) => onChange({ price: Math.max(0, Number(e.target.value)) })}
              placeholder="e.g. 15000000"
              className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Monthly Maintenance (₹)</label>
            <input
              type="number"
              value={maintenanceFee ?? ''}
              onChange={(e) => onChange({ maintenanceFee: Math.max(0, Number(e.target.value)) })}
              placeholder="e.g. 5000"
              className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary outline-none"
            />
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Available / Possession Date</label>
        <input
          type="date"
          value={possessionDate ? possessionDate.split('T')[0] : ''}
          onChange={(e) => onChange({ possessionDate: e.target.value ? new Date(e.target.value).toISOString() : null })}
          className="w-full max-w-xs p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary outline-none"
        />
      </div>
    </div>
  );
};
