interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  frequencyPerDay: number;
  days: number;
  timings: string[];
}

interface ParsedPrescription {
  hospitalName: string;
  doctorName: string;
  patientName: string;
  age: string;
  date: string;
  medicines: Medicine[];
}

// Common medicine name patterns
const MEDICINE_PATTERNS = [
  /([A-Z][a-z]+(?:mycin|cillin|prazole|tadine|olol|pine|done|dryl|fen|zole|line))/gi,
  /([A-Z][a-z]+\s+\d+\s*mg)/gi,
];

// Dosage patterns
const DOSAGE_PATTERNS = [
  /(\d+\s*(?:mg|ml|mcg|g|tablet|capsule|syrup))/gi,
  /(\d+\s*x\s*\d+\s*(?:mg|ml))/gi,
];

// Frequency patterns
const FREQUENCY_PATTERNS = [
  /(?:once|twice|thrice|\d+\s*times?).*?(?:daily|day|per day)/gi,
  /(?:morning|afternoon|evening|night|bedtime)/gi,
  /(?:before|after|with)\s+(?:food|meal|breakfast|lunch|dinner)/gi,
];

// Duration patterns
const DURATION_PATTERNS = [
  /(\d+)\s*(?:days?|weeks?|months?)/gi,
];

export function parseOCRText(text: string): ParsedPrescription {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  const result: ParsedPrescription = {
    hospitalName: extractHospitalName(lines, text),
    doctorName: extractDoctorName(lines, text),
    patientName: extractPatientName(lines, text),
    age: extractAge(lines, text),
    date: extractDate(lines, text),
    medicines: extractMedicines(lines, text),
  };

  return result;
}

function extractHospitalName(lines: string[], text: string): string {
  const hospitalKeywords = ['hospital', 'clinic', 'medical', 'healthcare', 'health center'];

  for (const line of lines.slice(0, 5)) {
    const lowerLine = line.toLowerCase();
    if (hospitalKeywords.some(keyword => lowerLine.includes(keyword))) {
      return line.replace(/[^a-zA-Z0-9\s]/g, '').trim();
    }
  }

  // Try to find hospital in brackets or specific format
  const hospitalMatch = text.match(/\[([^\]]*(?:hospital|clinic)[^\]]*)\]/i);
  if (hospitalMatch) return hospitalMatch[1].trim();

  return '';
}

function extractDoctorName(lines: string[], text: string): string {
  const drPatterns = [
    /Dr\.?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
    /Doctor\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
    /Physician\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
  ];

  for (const pattern of drPatterns) {
    const match = text.match(pattern);
    if (match) return match[0].trim();
  }

  // Look for lines with "Dr" or "Doctor"
  for (const line of lines) {
    if (/dr\.?|doctor|physician/i.test(line)) {
      return line.replace(/[^a-zA-Z\s.]/g, '').trim();
    }
  }

  return '';
}

function extractPatientName(_lines: string[], text: string): string {
  const namePatterns = [
    /Patient\s*:?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
    /Name\s*:?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
  ];

  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match) return match[1].trim();
  }

  return '';
}

function extractAge(_lines: string[], text: string): string {
  const agePatterns = [
    /Age\s*:?\s*(\d+)/i,
    /(\d+)\s*(?:years?|yrs?|y)/i,
  ];

  for (const pattern of agePatterns) {
    const match = text.match(pattern);
    if (match) return match[1];
  }

  return '';
}

function extractDate(_lines: string[], text: string): string {
  const datePatterns = [
    /(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/,
    /(\d{4}[/-]\d{1,2}[/-]\d{1,2})/,
    /(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})/i,
  ];

  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) return match[1];
  }

  return new Date().toISOString().split('T')[0];
}

function extractMedicines(lines: string[], _text: string): Medicine[] {
  const medicines: Medicine[] = [];

  // Find medicine section
  const medicineStartIdx = lines.findIndex(line =>
    /(?:rx|prescription|medicine|medication|drugs?)[\s:]/i.test(line)
  );

  const relevantLines = medicineStartIdx >= 0 ? lines.slice(medicineStartIdx) : lines;

  // Group lines that might belong to same medicine
  let currentMedicine: Partial<Medicine> | null = null;

  for (const line of relevantLines) {
    // Skip headers
    if (/(?:prescription|medicine|medication|signature|date)/i.test(line) && line.length < 30) {
      continue;
    }

    // Try to extract medicine info from line
    const medicineName = extractMedicineName(line);
    if (medicineName) {
      // Save previous medicine if exists
      if (currentMedicine && currentMedicine.name) {
        medicines.push(completeMedicine(currentMedicine));
      }

      // Start new medicine
      currentMedicine = {
        name: medicineName,
        dosage: extractDosage(line) || '500mg',
        frequency: extractFrequency(line) || 'twice daily',
        frequencyPerDay: extractFrequencyNumber(line) || 2,
        days: extractDuration(line) || 7,
        timings: generateTimings(extractFrequencyNumber(line) || 2),
      };
    } else if (currentMedicine) {
      // Add info to current medicine
      if (!currentMedicine.dosage) {
        currentMedicine.dosage = extractDosage(line) || currentMedicine.dosage;
      }
      if (!currentMedicine.frequency) {
        currentMedicine.frequency = extractFrequency(line) || currentMedicine.frequency;
      }
      if (!currentMedicine.days || currentMedicine.days === 7) {
        currentMedicine.days = extractDuration(line) || currentMedicine.days;
      }
    }
  }

  // Add last medicine
  if (currentMedicine && currentMedicine.name) {
    medicines.push(completeMedicine(currentMedicine));
  }

  // If no medicines found, create a blank template
  if (medicines.length === 0) {
    medicines.push({
      name: '',
      dosage: '',
      frequency: 'twice daily',
      frequencyPerDay: 2,
      days: 7,
      timings: ['09:00', '21:00'],
    });
  }

  return medicines;
}

function extractMedicineName(line: string): string {
  // Try multiple patterns
  for (const pattern of MEDICINE_PATTERNS) {
    const match = line.match(pattern);
    if (match) return match[0].trim();
  }

  // Look for capitalized words followed by numbers (likely medicine + dosage)
  const capsMatch = line.match(/\b([A-Z][a-z]+(?:[A-Z][a-z]+)*)\s*\d/);
  if (capsMatch) return capsMatch[1];

  // Look for words ending in common medicine suffixes
  const suffixMatch = line.match(/\b([A-Za-z]+(?:mycin|cillin|prazole|tadine|olol|pine))\b/i);
  if (suffixMatch) return suffixMatch[1];

  return '';
}

function extractDosage(line: string): string {
  for (const pattern of DOSAGE_PATTERNS) {
    const match = line.match(pattern);
    if (match) return match[0].trim();
  }
  return '';
}

function extractFrequency(line: string): string {
  for (const pattern of FREQUENCY_PATTERNS) {
    const match = line.match(pattern);
    if (match) return match[0].trim();
  }
  return '';
}

function extractFrequencyNumber(line: string): number {
  const freqMap: { [key: string]: number } = {
    'once': 1,
    'twice': 2,
    'thrice': 3,
    'four': 4,
  };

  const lowerLine = line.toLowerCase();
  for (const [word, num] of Object.entries(freqMap)) {
    if (lowerLine.includes(word)) return num;
  }

  // Try to find number followed by "times"
  const match = line.match(/(\d+)\s*times?/i);
  if (match) return parseInt(match[1]);

  return 2; // default
}

function extractDuration(line: string): number {
  for (const pattern of DURATION_PATTERNS) {
    const match = line.match(pattern);
    if (match) {
      const num = parseInt(match[1]);
      if (line.toLowerCase().includes('week')) return num * 7;
      if (line.toLowerCase().includes('month')) return num * 30;
      return num; // days
    }
  }
  return 7; // default
}

function generateTimings(frequency: number): string[] {
  const timings: string[] = [];
  const hours = [8, 12, 16, 20]; // 8 AM, 12 PM, 4 PM, 8 PM

  for (let i = 0; i < Math.min(frequency, 4); i++) {
    timings.push(`${String(hours[i]).padStart(2, '0')}:00`);
  }

  return timings;
}

function completeMedicine(partial: Partial<Medicine>): Medicine {
  return {
    name: partial.name || '',
    dosage: partial.dosage || '500mg',
    frequency: partial.frequency || 'twice daily',
    frequencyPerDay: partial.frequencyPerDay || 2,
    days: partial.days || 7,
    timings: partial.timings || ['09:00', '21:00'],
  };
}
