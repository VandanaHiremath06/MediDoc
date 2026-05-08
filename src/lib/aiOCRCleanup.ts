interface CleanedOCRData {
  hospitalName: string;
  doctorName: string;
  patientName: string;
  age: string;
  ageUnit: 'years' | 'months';
  medicines: {
    name: string;
    dosage: string;
    frequencyPerDay: number;
    days: number;
    timings: string[];
  }[];
}

// Common medicine names database for fuzzy matching
const COMMON_MEDICINES = [
  'Paracetamol', 'Ibuprofen', 'Amoxicillin', 'Azithromycin', 'Ciprofloxacin',
  'Metformin', 'Omeprazole', 'Amlodipine', 'Atorvastatin', 'Levothyroxine',
  'Lisinopril', 'Metoprolol', 'Albuterol', 'Gabapentin', 'Hydrochlorothiazide',
  'Aspirin', 'Clopidogrel', 'Warfarin', 'Insulin', 'Dolo', 'Crocin', 'Calpol',
  'Augmentin', 'Combiflam', 'Allegra', 'Cetirizine', 'Montelukast', 'Pantoprazole',
  'Ranitidine', 'Domperidone', 'Ondansetron', 'Diclofenac', 'Tramadol', 'Codeine',
];

/**
 * Clean OCR text using AI/pattern matching
 */
export async function cleanOCRWithAI(ocrText: string): Promise<CleanedOCRData> {
  console.log('AI Cleanup - Input OCR text:', ocrText);

  // Try using GPT-style API if available (requires API key)
  const apiKey = localStorage.getItem('OPENAI_API_KEY') || '';

  if (apiKey) {
    try {
      return await cleanWithGPT(ocrText, apiKey);
    } catch (error) {
      console.warn('GPT cleanup failed, falling back to pattern matching:', error);
    }
  }

  // Fallback to advanced pattern matching
  return cleanWithPatterns(ocrText);
}

/**
 * Clean using GPT API
 */
async function cleanWithGPT(ocrText: string, apiKey: string): Promise<CleanedOCRData> {
  const prompt = `You are a medical prescription OCR cleanup assistant. Extract structured data from this messy OCR text.

OCR Text:
${ocrText}

Extract and return ONLY valid JSON in this exact format:
{
  "hospitalName": "string or empty",
  "doctorName": "string or empty",
  "patientName": "string or empty",
  "age": "number or empty",
  "ageUnit": "years or months",
  "medicines": [
    {
      "name": "medicine name",
      "dosage": "e.g., 500mg, 1 tablet",
      "frequencyPerDay": number,
      "days": number,
      "timings": ["09:00", "21:00"]
    }
  ]
}

Rules:
- If a field is not found, use empty string ""
- Age must be a number or empty, max 120
- Correct common medicine name spelling (e.g., "Paracetmol" → "Paracetamol")
- Extract dosage with units (mg, tablets, ml, etc.)
- Frequency is times per day (1-4)
- Default timings: [09:00] for 1x, [09:00, 21:00] for 2x, [09:00, 14:00, 21:00] for 3x
- Return ONLY the JSON, no explanations`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    throw new Error(`GPT API error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content || '{}';

  // Extract JSON from response (may have markdown code blocks)
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON found in GPT response');
  }

  const cleaned = JSON.parse(jsonMatch[0]);
  console.log('GPT cleaned data:', cleaned);

  return validateAndNormalize(cleaned);
}

/**
 * Clean using advanced pattern matching
 */
function cleanWithPatterns(ocrText: string): Promise<CleanedOCRData> {
  const lines = ocrText.split('\n').map(l => l.trim()).filter(l => l);

  const result: CleanedOCRData = {
    hospitalName: '',
    doctorName: '',
    patientName: '',
    age: '',
    ageUnit: 'years',
    medicines: [],
  };

  // Extract hospital
  const hospitalPatterns = [
    /hospital[:\s]*(.+)/i,
    /clinic[:\s]*(.+)/i,
    /medical\s+center[:\s]*(.+)/i,
  ];
  for (const pattern of hospitalPatterns) {
    for (const line of lines) {
      const match = line.match(pattern);
      if (match) {
        result.hospitalName = match[1].trim();
        break;
      }
    }
    if (result.hospitalName) break;
  }

  // Extract doctor
  const doctorPatterns = [
    /dr\.?\s+([a-z\s]+)/i,
    /doctor[:\s]*([a-z\s]+)/i,
    /physician[:\s]*([a-z\s]+)/i,
  ];
  for (const pattern of doctorPatterns) {
    for (const line of lines) {
      const match = line.match(pattern);
      if (match) {
        result.doctorName = 'Dr. ' + match[1].trim();
        break;
      }
    }
    if (result.doctorName) break;
  }

  // Extract patient
  const patientPatterns = [
    /patient[:\s]*([a-z\s]+)/i,
    /name[:\s]*([a-z\s]+)/i,
  ];
  for (const pattern of patientPatterns) {
    for (const line of lines) {
      const match = line.match(pattern);
      if (match && match[1].length > 2 && match[1].length < 50) {
        result.patientName = match[1].trim();
        break;
      }
    }
    if (result.patientName) break;
  }

  // Extract age
  const agePatterns = [
    /age[:\s]*(\d+)\s*(years?|months?|yrs?|mos?)?/i,
    /(\d+)\s*(years?|months?|yrs?|mos?)\s+old/i,
    /(\d+)\/([MF])/i, // Format: 25/M
  ];
  for (const pattern of agePatterns) {
    for (const line of lines) {
      const match = line.match(pattern);
      if (match) {
        const ageNum = parseInt(match[1]);
        if (ageNum > 0 && ageNum <= 120) {
          result.age = ageNum.toString();
          const unit = match[2]?.toLowerCase() || '';
          if (unit.includes('month') || unit.includes('mo')) {
            result.ageUnit = 'months';
          } else {
            result.ageUnit = 'years';
          }
          break;
        }
      }
    }
    if (result.age) break;
  }

  // Extract medicines - use fuzzy matching
  result.medicines = extractMedicines(ocrText);

  console.log('Pattern-based cleaned data:', result);
  return Promise.resolve(result);
}

/**
 * Extract medicines with fuzzy matching
 */
function extractMedicines(text: string): CleanedOCRData['medicines'] {
  const medicines: CleanedOCRData['medicines'] = [];
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);

  // Look for medicine-like patterns
  const medicinePatterns = [
    /([A-Za-z]+(?:cillin|zole|prazole|mycin|xacin|olol|pine|statin|formin))\s+(\d+\s*(?:mg|tablet|ml|g))/i,
    /Tab\.?\s+([A-Za-z]+)\s+(\d+\s*(?:mg|tablet))/i,
    /Cap\.?\s+([A-Za-z]+)\s+(\d+\s*(?:mg|capsule))/i,
    /Syp\.?\s+([A-Za-z]+)\s+(\d+\s*(?:ml|mg))/i,
  ];

  for (const line of lines) {
    for (const pattern of medicinePatterns) {
      const match = line.match(pattern);
      if (match) {
        const rawName = match[1];
        const dosage = match[2];

        // Fuzzy match to common medicine names
        const correctedName = findClosestMedicine(rawName);

        // Extract frequency
        const freqMatch = line.match(/(\d+)\s*(?:times?|x)\s*(?:per|a)?\s*day/i);
        const frequency = freqMatch ? Math.min(4, parseInt(freqMatch[1])) : 2;

        // Extract duration
        const daysMatch = line.match(/(?:for\s+)?(\d+)\s*days?/i);
        const days = daysMatch ? parseInt(daysMatch[1]) : 7;

        // Generate default timings
        const timings = generateDefaultTimings(frequency);

        medicines.push({
          name: correctedName,
          dosage: dosage.trim(),
          frequencyPerDay: frequency,
          days,
          timings,
        });
      }
    }
  }

  // If no medicines found, return one empty template
  if (medicines.length === 0) {
    medicines.push({
      name: '',
      dosage: '',
      frequencyPerDay: 2,
      days: 7,
      timings: ['09:00', '21:00'],
    });
  }

  return medicines;
}

/**
 * Find closest medicine name using Levenshtein distance
 */
function findClosestMedicine(input: string): string {
  const inputLower = input.toLowerCase();

  let bestMatch = input;
  let bestDistance = Infinity;

  for (const medicine of COMMON_MEDICINES) {
    const distance = levenshteinDistance(inputLower, medicine.toLowerCase());
    const threshold = Math.max(2, medicine.length * 0.3); // 30% tolerance

    if (distance < threshold && distance < bestDistance) {
      bestDistance = distance;
      bestMatch = medicine;
    }
  }

  return bestMatch;
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[a.length][b.length];
}

/**
 * Generate default timings based on frequency
 */
function generateDefaultTimings(frequency: number): string[] {
  const timings: { [key: number]: string[] } = {
    1: ['09:00'],
    2: ['09:00', '21:00'],
    3: ['09:00', '14:00', '21:00'],
    4: ['09:00', '13:00', '17:00', '21:00'],
  };

  return timings[Math.min(4, frequency)] || timings[2];
}

/**
 * Validate and normalize cleaned data
 */
function validateAndNormalize(data: any): CleanedOCRData {
  // Ensure age is within limits
  if (data.age) {
    const ageNum = parseInt(data.age);
    if (isNaN(ageNum) || ageNum < 0 || ageNum > 120) {
      data.age = '';
    }
  }

  // Ensure age unit is valid
  if (data.ageUnit !== 'years' && data.ageUnit !== 'months') {
    data.ageUnit = 'years';
  }

  // Ensure medicines is an array
  if (!Array.isArray(data.medicines)) {
    data.medicines = [];
  }

  // Validate each medicine
  data.medicines = data.medicines.map((med: any) => ({
    name: med.name || '',
    dosage: med.dosage || '',
    frequencyPerDay: Math.min(4, Math.max(1, parseInt(med.frequencyPerDay) || 2)),
    days: Math.max(1, parseInt(med.days) || 7),
    timings: Array.isArray(med.timings) && med.timings.length > 0
      ? med.timings
      : generateDefaultTimings(med.frequencyPerDay || 2),
  }));

  return data as CleanedOCRData;
}
