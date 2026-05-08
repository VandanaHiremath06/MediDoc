import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeCanvas } from 'qrcode.react';
import { X, Download, Share2, Copy, CheckCircle } from 'lucide-react';
import { encryptData } from '../../lib/encryption';

interface QRCodeModalProps {
  member: any;
  prescriptions: any[];
  isOpen: boolean;
  onClose: () => void;
}

export default function QRCodeModal({ member, prescriptions, isOpen, onClose }: QRCodeModalProps) {
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLCanvasElement>(null);

  // Prepare health data for QR code
  const healthData = {
    id: member.id,
    name: member.name,
    nickname: member.nickname,
    age: member.age || 'N/A',
    mobile: member.mobile || '',
    bloodType: member.bloodType || 'Unknown',
    allergies: member.allergies || [],
    currentMedications: prescriptions
      .filter(p => p.status === 'active')
      .map(p => ({
        hospitalName: p.hospitalName,
        doctorName: p.doctorName,
        medicines: p.medicines.map((m: any) => ({
          name: m.name,
          dosage: m.dosage,
          frequency: `${m.frequencyPerDay}x daily`,
        })),
        startDate: p.startDate,
      })),
    emergencyContact: member.mobile || '',
    lastUpdated: new Date().toISOString(),
    generatedBy: 'MediDoc',
  };

  // Encrypt the data
  const encryptedData = encryptData(healthData);

  const downloadQR = () => {
    const canvas = qrRef.current;
    if (!canvas) return;

    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${member.nickname}-health-qr.png`;
    link.href = url;
    link.click();
  };

  const shareQR = async () => {
    const canvas = qrRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;

        const file = new File([blob], `${member.nickname}-health-qr.png`, { type: 'image/png' });

        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `${member.nickname}'s Health QR Code`,
            text: 'Emergency health information - scan in case of emergency',
          });
        } else {
          // Fallback: download
          downloadQR();
        }
      });
    } catch (err) {
      console.error('Share failed:', err);
      downloadQR();
    }
  };

  const copyData = () => {
    navigator.clipboard.writeText(encryptedData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold dark:text-white">Emergency QR Code</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{member.nickname}</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X size={24} className="dark:text-white" />
                </button>
              </div>

              {/* QR Code */}
              <div className="bg-white p-6 rounded-2xl shadow-inner mb-6 flex justify-center">
                <QRCodeCanvas
                  ref={qrRef}
                  value={encryptedData}
                  size={256}
                  level="H"
                  includeMargin={true}
                  imageSettings={{
                    src: '/medidoc-icon.png',
                    height: 40,
                    width: 40,
                    excavate: true,
                  }}
                />
              </div>

              {/* Info */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-6">
                <p className="text-sm text-blue-900 dark:text-blue-200">
                  <strong>🔒 Encrypted & Secure</strong><br />
                  This QR code contains encrypted health information. Scan it with MediDoc app in emergency situations.
                </p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 mb-6">
                <p className="text-xs text-green-900 dark:text-green-200">
                  ✓ AES-256 encrypted<br />
                  ✓ Contains: Current medications, allergies, emergency contact<br />
                  ✓ Last updated: {new Date().toLocaleDateString()}
                </p>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={downloadQR}
                  className="flex flex-col items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-xl hover:opacity-90 transition-opacity"
                >
                  <Download size={24} />
                  <span className="text-xs font-medium">Download</span>
                </button>

                <button
                  onClick={shareQR}
                  className="flex flex-col items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 rounded-xl hover:opacity-90 transition-opacity"
                >
                  <Share2 size={24} />
                  <span className="text-xs font-medium">Share</span>
                </button>

                <button
                  onClick={copyData}
                  className="flex flex-col items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white p-4 rounded-xl hover:opacity-90 transition-opacity"
                >
                  {copied ? <CheckCircle size={24} /> : <Copy size={24} />}
                  <span className="text-xs font-medium">{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              {/* Warning */}
              <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-6">
                Keep this QR code accessible for emergency situations
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
