import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { QRCodeCanvas } from 'qrcode.react';
import { Share2, Download, Lock, X } from 'lucide-react';
import { encryptData } from '../../lib/encryption';

interface QRCodeGeneratorProps {
  member: any;
  prescriptions: any[];
  onClose: () => void;
}

export default function QRCodeGenerator({ member, prescriptions, onClose }: QRCodeGeneratorProps) {
  const [generated, setGenerated] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const activePrescriptions = prescriptions.filter(p => p.status === 'active');

  const healthData = {
    id: member.id,
    name: member.name,
    nickname: member.nickname,
    mobile: member.mobile,
    age: member.age || 'N/A',
    bloodType: member.bloodType || 'Unknown',
    allergies: member.allergies || [],
    emergencyContact: member.mobile,
    currentMedications: activePrescriptions.map(p => ({
      hospital: p.hospitalName,
      doctor: p.doctorName,
      medicines: p.medicines.map((m: any) => ({
        name: m.name,
        dosage: m.dosage,
        frequency: `${m.frequencyPerDay}x daily`,
      })),
      startDate: p.uploadDate,
    })),
    lastUpdated: new Date().toISOString(),
    generatedAt: new Date().toLocaleString(),
  };

  const encryptedData = encryptData(healthData);

  const handleGenerate = () => {
    setGenerated(true);
  };

  const handleDownload = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${member.nickname}-health-qr.png`;
      link.href = url;
      link.click();
    }
  };

  const handleShare = async () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (canvas) {
      canvas.toBlob(async (blob) => {
        if (blob && navigator.share) {
          try {
            await navigator.share({
              files: [new File([blob], `${member.nickname}-health-qr.png`, { type: 'image/png' })],
              title: 'Emergency Health QR Code',
              text: `Emergency health QR for ${member.nickname}`,
            });
          } catch (err) {
            console.error('Share failed:', err);
            alert('Sharing not supported. Use download instead.');
          }
        }
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold mb-2 dark:text-white">
                Emergency Health QR
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                For {member.nickname}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <X size={24} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {!generated ? (
            <div className="space-y-6">
              {/* Information Preview */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6">
                <h3 className="font-semibold mb-4 dark:text-white">QR Code Will Include:</h3>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400">✓</span>
                    <span>Personal info: {member.name}, {member.mobile}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400">✓</span>
                    <span>{activePrescriptions.length} active prescription(s)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400">✓</span>
                    <span>Current medications and dosages</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400">✓</span>
                    <span>Allergies and emergency contact</span>
                  </li>
                </ul>
              </div>

              {/* Security Notice */}
              <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <Lock size={20} className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-800 dark:text-green-300 mb-1">
                      AES-256 Encrypted
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-400">
                      All data is encrypted before being encoded in the QR code. Only authorized medical personnel can decrypt it.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleGenerate}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity"
              >
                Generate Secure QR Code
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* QR Code Display */}
              <div ref={qrRef} className="bg-white p-8 rounded-2xl flex items-center justify-center">
                <QRCodeCanvas
                  value={encryptedData}
                  size={256}
                  level="H"
                  includeMargin={true}
                  imageSettings={{
                    src: '/favicon.ico',
                    height: 40,
                    width: 40,
                    excavate: true,
                  }}
                />
              </div>

              {/* Member Info */}
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-1 dark:text-white">{member.nickname}</h3>
                <p className="text-gray-600 dark:text-gray-400">{member.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  Generated: {new Date().toLocaleString()}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleDownload}
                  className="bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  Download
                </button>

                <button
                  onClick={handleShare}
                  className="bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Share2 size={20} />
                  Share
                </button>
              </div>

              {/* Usage Instructions */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                <h4 className="font-semibold mb-2 text-sm dark:text-white">How to Use:</h4>
                <ol className="text-xs text-gray-600 dark:text-gray-300 space-y-1 list-decimal list-inside">
                  <li>Print this QR code or save it to your phone</li>
                  <li>Keep it in your wallet or emergency contacts</li>
                  <li>In emergencies, medical staff can scan to access health info</li>
                  <li>Data is encrypted for privacy and security</li>
                </ol>
              </div>

              <button
                onClick={() => setGenerated(false)}
                className="w-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-3 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Generate New QR Code
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
