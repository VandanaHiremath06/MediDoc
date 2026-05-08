import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, Upload, X } from 'lucide-react';

interface ProfileImageUploadProps {
  currentImage?: string;
  onImageChange: (imageData: string) => void;
  memberName: string;
}

export default function ProfileImageUpload({
  currentImage,
  onImageChange,
  memberName,
}: ProfileImageUploadProps) {
  const [preview, setPreview] = useState<string>(currentImage || '');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      setUploading(true);

      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreview(base64String);
        onImageChange(base64String);
        setUploading(false);
      };
      reader.onerror = () => {
        alert('Failed to read file');
        setUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setPreview('');
    onImageChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Image Preview */}
      <div className="relative">
        {preview ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative"
          >
            <img
              src={preview}
              alt={memberName}
              className="w-32 h-32 rounded-full object-cover border-4 border-blue-500 shadow-xl"
            />
            <button
  onClick={handleRemoveImage}
  aria-label="Remove image"
  className="absolute -top-2 -right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
>
  <X size={16} />
</button>
          </motion.div>
        ) : (
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white text-4xl font-bold shadow-xl">
            {memberName.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Upload Button Overlay */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="absolute bottom-0 right-0 bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-colors shadow-lg disabled:opacity-50"
        >
          {uploading ? (
            <div className="animate-spin">⏳</div>
          ) : (
            <Camera size={20} />
          )}
        </button>
      </div>

      {/* File Input (Hidden) */}
      <input
  ref={fileInputRef}
  type="file"
  accept="image/*"
  onChange={handleFileSelect}
  className="hidden"
  aria-label="Upload image file"
/>

      {/* Upload Instructions */}
      <div className="text-center">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {preview ? 'Profile photo uploaded' : 'Add profile photo'}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          JPG, PNG or GIF (max 5MB)
        </p>
      </div>

      {/* Alternative Upload Button */}
      {!preview && (
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Upload size={18} />
          <span>Choose Photo</span>
        </button>
      )}
    </div>
  );
}
