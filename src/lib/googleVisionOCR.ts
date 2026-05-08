
export interface GoogleVisionResult {
  text: string;
  confidence: number;
}

/**
 * Perform OCR using Google Cloud Vision API
 */
export async function performGoogleVisionOCR(imageFile: File): Promise<GoogleVisionResult> {
  const apiKey = localStorage.getItem('GOOGLE_VISION_API_KEY') || '';

  if (!apiKey) {
    throw new Error('Google Vision API key not configured');
  }

  // Convert file to base64
  const base64Image = await fileToBase64(imageFile);
  const base64Content = base64Image.split(',')[1]; // Remove data:image/... prefix

  const requestBody = {
    requests: [
      {
        image: {
          content: base64Content,
        },
        features: [
          {
            type: 'DOCUMENT_TEXT_DETECTION',
            maxResults: 1,
          },
        ],
        imageContext: {
          languageHints: ['en'], // English language hint
        },
      },
    ],
  };

  const response = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Google Vision API error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const textAnnotations = data.responses[0]?.textAnnotations;

  if (!textAnnotations || textAnnotations.length === 0) {
    throw new Error('No text found in image');
  }

  // First annotation contains full text
  const fullText = textAnnotations[0].description;
  const confidence = textAnnotations[0].confidence || 0.8;

  return {
    text: fullText,
    confidence,
  };
}

/**
 * Convert File to base64 string
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Merge results from multiple OCR engines
 * Implements smart word-level merging based on confidence
 */
export function mergeOCRResults(
  result1: { text: string; confidence: number },
  result2: { text: string; confidence: number }
): string {
  const words1 = result1.text.split(/\s+/);
  const words2 = result2.text.split(/\s+/);

  // If one result is significantly longer, prefer it
  if (words1.length < words2.length * 0.5) {
    return result2.text;
  }
  if (words2.length < words1.length * 0.5) {
    return result1.text;
  }

  // Word-by-word merging
  const merged: string[] = [];
  const maxLength = Math.max(words1.length, words2.length);

  for (let i = 0; i < maxLength; i++) {
    const word1 = words1[i] || '';
    const word2 = words2[i] || '';

    if (!word1 && word2) {
      merged.push(word2);
    } else if (word1 && !word2) {
      merged.push(word1);
    } else if (word1 === word2) {
      merged.push(word1);
    } else {
      // Choose longer word if length differs significantly
      if (word1.length > word2.length * 1.5) {
        merged.push(word1);
      } else if (word2.length > word1.length * 1.5) {
        merged.push(word2);
      } else {
        // Use confidence scores if available
        merged.push(result1.confidence >= result2.confidence ? word1 : word2);
      }
    }
  }

  return merged.join(' ');
}

/**
 * Dual OCR strategy: Run both engines and merge results
 */
export async function dualOCRStrategy(
  tesseractResult: { text: string; confidence: number },
  imageFile: File
): Promise<string> {
  try {
    console.log('Running Google Vision OCR as fallback...');
    const googleResult = await performGoogleVisionOCR(imageFile);
    console.log('Google Vision result:', googleResult);

    // Merge the two results
    const mergedText = mergeOCRResults(tesseractResult, googleResult);
    console.log('Merged OCR text:', mergedText);

    return mergedText;
  } catch (error) {
    console.warn('Google Vision OCR failed, using Tesseract only:', error);
    return tesseractResult.text;
  }
}
