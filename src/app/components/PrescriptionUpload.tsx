import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, Loader, Plus, Trash2 } from 'lucide-react';
import Tesseract from 'tesseract.js';
import { API_BASE, getAuthHeaders } from '../../lib/supabase';
import ThemeToggle from './ThemeToggle';

interface Medicine {
  name: string;
  dosage: string;
  frequencyPerDay: number;
  days: number;
  timings: string[];
}

interface OCRData {
  hospitalName: string;
  doctorName: string;
  patientName: string;
  age: string;
  ageUnit: 'years' | 'months';
  medicines: Medicine[];
}

interface PrescriptionUploadProps {
  memberId: string;
  memberName: string;
  onBack: () => void;
  onSuccess: () => void;
}
const [detailModal, setDetailModal] = useState(null);
export default function PrescriptionUpload({
  memberId,
  memberName,
  onBack,
  onSuccess,
}: PrescriptionUploadProps) {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [ocrData, setOcrData] = useState<OCRData>({
    hospitalName: '',
    doctorName: '',
    patientName: '',
    age: '',
    ageUnit: 'years',
    medicines: [],
  });
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const processOCR = async () => {
    if (!image) return;

    setProcessing(true);

    try {
      // Step 1: Preprocess image for better OCR accuracy
      console.log('Step 1: Preprocessing image...');
      const { preprocessImage } = await import('../../lib/imagePreprocessing');
      const preprocessedBase64 = await preprocessImage(image);

      // Convert base64 back to File for OCR
      const preprocessedBlob = await fetch(preprocessedBase64).then(r => r.blob());
      const preprocessedFile = new File([preprocessedBlob], image.name, { type: image.type });

      // Step 2: Run primary OCR (Tesseract) with enhanced configuration
      console.log('Step 2: Running Tesseract OCR...');
      const result = await Tesseract.recognize(preprocessedFile, 'eng', {
        logger: (m: unknown) => console.log(m),
        tessedit_pageseg_mode: Tesseract.PSM.AUTO,
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,:-/ ()[]',
        tessjs_create_hocr: '1',
        tessjs_create_tsv: '1',
      } as any);

      let finalText = result.data.text;
      console.log('Tesseract OCR Text:', finalText);
      console.log('Tesseract Confidence:', result.data.confidence);

      // Step 3: Try Google Vision API as fallback/merge (if configured)
      const googleApiKey = localStorage.getItem('GOOGLE_VISION_API_KEY');
      if (googleApiKey && result.data.confidence < 85) {
        try {
          console.log('Step 3: Running Google Vision OCR (low confidence fallback)...');
          const { dualOCRStrategy } = await import('../../lib/googleVisionOCR');
          finalText = await dualOCRStrategy(
            { text: result.data.text, confidence: result.data.confidence },
            image
          );
          console.log('Merged OCR Text:', finalText);
        } catch (visionError) {
          console.warn('Google Vision fallback failed:', visionError);
        }
      }

      // Step 4: AI-powered cleanup and structuring
      console.log('Step 4: Cleaning OCR text with AI...');
      const { cleanOCRWithAI } = await import('../../lib/aiOCRCleanup');
      const cleaned = await cleanOCRWithAI(finalText);

      console.log('AI Cleaned Data:', cleaned);

      // Validate age limit
      if (cleaned.age) {
        const ageNum = parseInt(cleaned.age);
        if (ageNum > 120) {
          cleaned.age = ''; // Invalid age, leave blank
        }
      }

      setOcrData({
        hospitalName: cleaned.hospitalName || '',
        doctorName: cleaned.doctorName || '',
        patientName: cleaned.patientName || '',
        age: cleaned.age || '',
        ageUnit: cleaned.ageUnit || 'years',
        medicines: cleaned.medicines.length > 0 ? cleaned.medicines : [{
          name: '',
          dosage: '',
          frequencyPerDay: 2,
          days: 7,
          timings: ['09:00', '21:00'],
        }],
      });

      console.log('✅ OCR processing complete!');
    } catch (error) {
      console.error('OCR Error:', error);
      alert('Failed to process image. Please enter details manually.');
    } finally {
      setProcessing(false);
    }
  };

  const addMedicine = () => {
    setOcrData({
      ...ocrData,
      medicines: [
        ...ocrData.medicines,
        {
          name: '',
          dosage: '',
          frequencyPerDay: 1,
          days: 7,
          timings: ['09:00'],
        },
      ],
    });
  };

  const updateMedicine = (index: number, field: keyof Medicine, value: any) => {
    const updated = [...ocrData.medicines];
    updated[index] = { ...updated[index], [field]: value };

    // Auto-adjust timings when frequency changes
    if (field === 'frequencyPerDay') {
      const freq = parseInt(value);
      const defaultTimings = ['09:00', '14:00', '20:00', '22:00'];
      updated[index].timings = defaultTimings.slice(0, freq);
    }

    setOcrData({ ...ocrData, medicines: updated });
  };

  const updateTiming = (medIndex: number, timeIndex: number, value: string) => {
    const updated = [...ocrData.medicines];
    updated[medIndex].timings[timeIndex] = value;
    setOcrData({ ...ocrData, medicines: updated });
  };

  const removeMedicine = (index: number) => {
    setOcrData({
      ...ocrData,
      medicines: ocrData.medicines.filter((_, i) => i !== index),
    });
  };

  const handleSave = async () => {
    if (ocrData.medicines.length === 0) {
      alert('Please add at least one medicine');
      return;
    }

    const invalidMeds = ocrData.medicines.some(m => !m.name || !m.dosage);
    if (invalidMeds) {
      alert('Please fill in medicine name and dosage for all medications');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`${API_BASE}/prescription/save`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          memberId,
          ocrData,
          imageUrl: imagePreview,
          startDate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save prescription');
      }

      alert('Prescription saved successfully!');
      onSuccess();
    } catch (error: any) {
      console.error('Save error:', error);
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <ThemeToggle />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
        >
          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Upload Prescription
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">For: {memberName}</p>

          {/* Image Upload */}
          {!imagePreview ? (
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-12 text-center mb-6">
              <Upload className="mx-auto mb-4 text-gray-400 dark:text-gray-500" size={48} />
              <p className="text-gray-600 dark:text-gray-400 mb-4">Upload prescription image</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="imageUpload"
              />
              <label
                htmlFor="imageUpload"
                className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg cursor-pointer hover:opacity-90"
              >
                Choose Image
              </label>
            </div>
          ) : (
            <div className="mb-6">
              <img
                src={imagePreview}
                alt="Prescription"
                className="max-h-64 mx-auto rounded-lg shadow-lg mb-4"
              />
              <div className="flex gap-3 justify-center">
                <button
                  onClick={processOCR}
                  disabled={processing}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
                >
                  {processing ? (
                    <>
                      <Loader className="animate-spin" size={16} />
                      Processing...
                    </>
                  ) : (
                    'Extract Text (OCR)'
                  )}
                </button>
                <button
                  onClick={() => {
                    setImage(null);
                    setImagePreview('');
                  }}
                  className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Change Image
                </button>
              </div>
            </div>
          )}

          {/* Prescription Details */}
          <div className="space-y-4 mb-6">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Prescription Details</h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Hospital Name</label>
                <input
                  type="text"
                  value={ocrData.hospitalName}
                  onChange={(e) => setOcrData({ ...ocrData, hospitalName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Hospital name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Doctor Name</label>
                <input
                  type="text"
                  value={ocrData.doctorName}
                  onChange={(e) => setOcrData({ ...ocrData, doctorName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Dr. Name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Patient Name</label>
                <input
                  type="text"
                  value={ocrData.patientName}
                  onChange={(e) => setOcrData({ ...ocrData, patientName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Patient name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Age (Max 120)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    max="120"
                    value={ocrData.age}
                    onChange={(e) => {
                      const value = e.target.value;
                      const num = parseInt(value);
                      if (value === '' || (num >= 0 && num <= 120)) {
                        setOcrData({ ...ocrData, age: value });
                      }
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Age"
                  />
                  <select
  aria-label="Age Unit"
  value={ocrData.ageUnit}
  onChange={(e) =>
    setOcrData({
      ...ocrData,
      ageUnit: e.target.value as "years" | "months",
    })
  }
  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
>
                    <option value="years">Years</option>
                    <option value="months">Months</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Start Date</label>
                <input
  type="date"
  aria-label="Start Date"
  value={startDate}
  onChange={(e) => setStartDate(e.target.value)}
  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
/>
              </div>
            </div>
          </div>

          {/* Medicines */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Medicines</h3>
              <button
                onClick={addMedicine}
                className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
              >
                <Plus size={20} />
                Add Medicine
              </button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {ocrData.medicines.map((med, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 bg-white dark:bg-gray-800">
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="font-bold text-lg text-gray-900 dark:text-white">Medicine {index + 1}</h4>
                    {ocrData.medicines.length > 1 && (
                      <button
  onClick={() => setDetailModal(null)}
  aria-label="Close"
  className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 p-2 rounded-full hover:bg-white dark:hover:bg-gray-700 transition-colors"
>
  ✕
</button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {/* Medicine Name */}
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                        Medicine Name *
                      </label>
                      <input
                        type="text"
                        value={med.name}
                        onChange={(e) => updateMedicine(index, 'name', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder="e.g., Paracetamol, Amoxicillin"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-3">
                      {/* Dosage */}
                      <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                          Dosage per Intake *
                        </label>
                        <input
                          type="text"
                          value={med.dosage}
                          onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                          placeholder="e.g., 500mg, 1 tablet"
                        />
                      </div>

                      {/* Frequency */}
                      <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                          Times per Day *
                        </label>
                        <input
  type="number"
  min="1"
  max="4"
  value={med.frequencyPerDay}
  onChange={(e) =>
    updateMedicine(index, 'frequencyPerDay', parseInt(e.target.value))
  }
  aria-label="Times per day"
  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
/>
                      </div>
                    </div>

                    {/* Duration */}
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                        Duration (Number of Days) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={med.days}
                        onChange={(e) => updateMedicine(index, 'days', parseInt(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="e.g., 7, 14, 30"
                      />
                    </div>

                    {/* Intake Times */}
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                        Intake Times
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {med.timings.map((time, tIndex) => (
                        <input
  type="time"
  value={time}
  onChange={(e) => updateTiming(index, tIndex, e.target.value)}
  aria-label={`Medicine ${index + 1} time ${tIndex + 1}`}
  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
/>
                        ))}
                      </div>
                    </div>

                    {/* Summary */}
                    {med.name && med.dosage && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          <span className="font-semibold">Summary:</span> Take {med.dosage} of {med.name}, {med.frequencyPerDay} {med.frequencyPerDay === 1 ? 'time' : 'times'} daily for {med.days} {med.days === 1 ? 'day' : 'days'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Prescription'}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
