import React from 'react';
import { Furnishing, Facing, PropertyAge, PossessionStatus, AreaUnit } from '@housing-clone/shared';

interface Step2DetailsProps {
  bhk: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  balconies: number | null;
  carpetArea: number;
  builtUpArea: number | null;
  areaUnit: AreaUnit;
  furnishing: Furnishing;
  floorNumber: number | null;
  totalFloors: number | null;
  facing: Facing | null;
  propertyAge: PropertyAge | null;
  possessionStatus: PossessionStatus | null;
  onChange: (data: Partial<Step2DetailsProps>) => void;
}

export const Step2Details: React.FC<Step2DetailsProps> = ({
  bhk,
  bathrooms,
  balconies,
  carpetArea,
  builtUpArea,
  areaUnit,
  furnishing,
  floorNumber,
  totalFloors,
  facing,
  propertyAge,
  possessionStatus,
  onChange,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Property Specifications & Area</h2>
        <p className="text-sm text-gray-500">Provide dimensions, layout and furnishing details</p>
      </div>

      {/* BHK Options */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">BHK Configuration</label>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => onChange({ bhk: num, bedrooms: num })}
              className={`px-4 py-2 rounded-lg border text-sm font-semibold transition ${
                bhk === num
                  ? 'border-brand-primary bg-brand-primary text-white shadow-sm'
                  : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {num} BHK
            </button>
          ))}
        </div>
      </div>

      {/* Bathrooms & Balconies */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Bathrooms</label>
          <select
            value={bathrooms || 1}
            onChange={(e) => onChange({ bathrooms: Number(e.target.value) })}
            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary outline-none"
          >
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <option key={num} value={num}>
                {num} {num === 1 ? 'Bathroom' : 'Bathrooms'}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Balconies</label>
          <select
            value={balconies || 0}
            onChange={(e) => onChange({ balconies: Number(e.target.value) })}
            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary outline-none"
          >
            {[0, 1, 2, 3, 4].map((num) => (
              <option key={num} value={num}>
                {num} {num === 1 ? 'Balcony' : 'Balconies'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Area Dimensions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Carpet Area *</label>
          <input
            type="number"
            value={carpetArea || ''}
            onChange={(e) => onChange({ carpetArea: Math.max(0, Number(e.target.value)) })}
            placeholder="e.g. 1200"
            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Built-up Area</label>
          <input
            type="number"
            value={builtUpArea || ''}
            onChange={(e) => onChange({ builtUpArea: Math.max(0, Number(e.target.value)) })}
            placeholder="e.g. 1500"
            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Area Unit</label>
          <select
            value={areaUnit}
            onChange={(e) => onChange({ areaUnit: e.target.value as AreaUnit })}
            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary outline-none"
          >
            <option value={AreaUnit.SQFT}>Sq. Ft.</option>
            <option value={AreaUnit.SQYD}>Sq. Yd.</option>
            <option value={AreaUnit.ACRE}>Acre</option>
          </select>
        </div>
      </div>

      {/* Furnishing */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Furnishing Status</label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: Furnishing.UNFURNISHED, label: 'Unfurnished' },
            { id: Furnishing.SEMI_FURNISHED, label: 'Semi-Furnished' },
            { id: Furnishing.FULLY_FURNISHED, label: 'Fully Furnished' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange({ furnishing: item.id })}
              className={`p-3 rounded-lg border text-sm font-semibold text-center transition ${
                furnishing === item.id
                  ? 'border-brand-primary bg-brand-50 text-brand-primary'
                  : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Floor & Total Floors */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Property Floor</label>
          <input
            type="number"
            value={floorNumber ?? ''}
            onChange={(e) => onChange({ floorNumber: Number(e.target.value) })}
            placeholder="e.g. 5"
            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Total Floors</label>
          <input
            type="number"
            value={totalFloors ?? ''}
            onChange={(e) => onChange({ totalFloors: Number(e.target.value) })}
            placeholder="e.g. 14"
            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary outline-none"
          />
        </div>
      </div>

      {/* Facing & Possession */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Facing Direction</label>
          <select
            value={facing || ''}
            onChange={(e) => onChange({ facing: (e.target.value as Facing) || null })}
            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary outline-none"
          >
            <option value="">Select Direction</option>
            <option value={Facing.EAST}>East</option>
            <option value={Facing.WEST}>West</option>
            <option value={Facing.NORTH}>North</option>
            <option value={Facing.SOUTH}>South</option>
            <option value={Facing.NORTH_EAST}>North East</option>
            <option value={Facing.NORTH_WEST}>North West</option>
            <option value={Facing.SOUTH_EAST}>South East</option>
            <option value={Facing.SOUTH_WEST}>South West</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Property Age</label>
          <select
            value={propertyAge || ''}
            onChange={(e) => onChange({ propertyAge: (e.target.value as PropertyAge) || null })}
            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary outline-none"
          >
            <option value="">Select Age</option>
            <option value={PropertyAge.NEW_CONSTRUCTION}>New Construction</option>
            <option value={PropertyAge.LESS_THAN_1_YEAR}>Under 1 Year</option>
            <option value={PropertyAge.ONE_TO_5_YEARS}>1 to 5 Years</option>
            <option value={PropertyAge.FIVE_TO_10_YEARS}>5 to 10 Years</option>
            <option value={PropertyAge.TEN_PLUS_YEARS}>10+ Years</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Possession Status</label>
          <select
            value={possessionStatus || ''}
            onChange={(e) => onChange({ possessionStatus: (e.target.value as PossessionStatus) || null })}
            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary outline-none"
          >
            <option value="">Select Status</option>
            <option value={PossessionStatus.READY_TO_MOVE}>Ready to Move</option>
            <option value={PossessionStatus.UNDER_CONSTRUCTION}>Under Construction</option>
          </select>
        </div>
      </div>
    </div>
  );
};
