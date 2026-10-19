import React, { useState } from 'react';
import { Upload, X, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { MediaType, PropertyMediaSummary } from '@housing-clone/shared';
import { mediaService } from '../../services/mediaService';

interface MediaUploaderProps {
  resourceType: 'PROPERTY' | 'PROJECT';
  resourceId: string;
  mediaType: MediaType;
  uploadedMedia: PropertyMediaSummary[];
  onMediaChanged: (media: PropertyMediaSummary[]) => void;
  maxFiles?: number;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  resourceType,
  resourceId,
  mediaType,
  uploadedMedia,
  onMediaChanged,
  maxFiles = 10,
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (uploadedMedia.length + files.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const file = files[0];
    setError(null);
    setUploading(true);
    setProgress(0);

    try {
      // 1. Request presigned URL from backend
      const presign = await mediaService.requestPresignedUpload({
        resourceType,
        resourceId,
        mediaType,
        fileName: file.name,
        contentType: file.type,
        fileSize: file.size,
      });

      // 2. Direct binary upload to Storage
      await mediaService.uploadDirectToStorage(presign.uploadUrl, file, (pct) => setProgress(pct));

      // 3. Determine final public image URL
      let finalUrl = presign.uploadUrl.split('?')[0];
      if (presign.uploadUrl.includes('/upload-local')) {
        const port = window.location.port || '5000';
        const host = window.location.hostname || 'localhost';
        finalUrl = `http://${host}:${port === '5173' || port === '5174' ? '5000' : port}/uploads/${presign.objectKey}`;
      }

      // 4. Complete upload & persist metadata in MySQL
      const newMedia = await mediaService.completeUpload({
        resourceType,
        resourceId,
        mediaType,
        objectKey: presign.objectKey,
        url: finalUrl,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      } as unknown as Parameters<typeof mediaService.completeUpload>[0]);

      onMediaChanged([...uploadedMedia, newMedia as PropertyMediaSummary]);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const resErr = (err as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error;
        setError(resErr?.message || 'Property image storage is currently unavailable. Please try again.');
      } else {
        setError('Property image storage is currently unavailable. Please try again.');
      }
    } finally {
      setUploading(false);
      setProgress(0);
      e.target.value = '';
    }
  };

  const handleDelete = async (mediaId: string) => {
    try {
      await mediaService.deleteMedia(mediaId);
      onMediaChanged(uploadedMedia.filter((m) => m.id !== mediaId));
    } catch {
      setError('Failed to delete media item');
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 hover:border-brand-primary rounded-xl p-6 text-center bg-gray-50 transition cursor-pointer relative">
        <input
          type="file"
          onChange={handleFileSelect}
          disabled={uploading || uploadedMedia.length >= maxFiles}
          accept={
            mediaType === 'IMAGE'
              ? 'image/jpeg,image/png,image/webp'
              : mediaType === 'DOCUMENT_PDF'
              ? 'application/pdf'
              : 'image/jpeg,image/png,image/webp,application/pdf'
          }
          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer disabled:cursor-not-allowed"
        />
        <div className="flex flex-col items-center space-y-2">
          {uploading ? (
            <>
              <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
              <p className="text-sm font-semibold text-gray-700">Uploading to Storage ({progress}%)...</p>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 text-gray-400" />
              <p className="text-sm font-medium text-gray-700">
                Click or drag & drop {mediaType.toLowerCase().replace('_', ' ')} files here
              </p>
              <p className="text-xs text-gray-500">
                Max {maxFiles} files (Images up to 10MB, PDFs up to 20MB)
              </p>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {uploadedMedia.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {uploadedMedia.map((media) => (
            <div key={media.id} className="relative group rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm">
              {media.mediaType === 'IMAGE' ? (
                <img src={media.thumbnailUrl || media.url} alt={media.caption || 'Media'} className="w-full h-24 object-cover" />
              ) : (
                <div className="w-full h-24 flex items-center justify-center bg-gray-100 text-gray-600">
                  <FileText className="w-8 h-8" />
                </div>
              )}
              <button
                onClick={() => handleDelete(media.id)}
                className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full opacity-80 hover:opacity-100 transition"
                title="Delete"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <div className="p-1.5 text-xs text-gray-600 truncate flex items-center space-x-1">
                <CheckCircle className="w-3 h-3 text-green-500 shrink-0" />
                <span className="truncate">{media.caption || 'Uploaded'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
