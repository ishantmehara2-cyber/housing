import React from 'react';
import { PropertyMediaSummary, MediaType } from '@housing-clone/shared';
import { MediaUploader } from '../media/MediaUploader';

interface Step6MediaProps {
  propertyId: string;
  media: PropertyMediaSummary[];
  onChange: (media: PropertyMediaSummary[]) => void;
}

export const Step6Media: React.FC<Step6MediaProps> = ({ propertyId, media, onChange }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Property Photographs & Media</h2>
        <p className="text-sm text-gray-500">
          Listings with photos receive 5x more enquiries. Upload high-quality property images.
        </p>
      </div>

      <MediaUploader
        resourceType="PROPERTY"
        resourceId={propertyId}
        mediaType={MediaType.IMAGE}
        uploadedMedia={media}
        onMediaChanged={onChange}
        maxFiles={15}
      />
    </div>
  );
};
