export async function preprocessImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Set canvas size to image size
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw original image
        ctx.drawImage(img, 0, 0);

        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Apply preprocessing steps
        convertToGrayscale(data);
        increaseContrast(data, 1.5);
        sharpenImage(imageData, canvas.width, canvas.height);

        // Put processed image back
        ctx.putImageData(imageData, 0, 0);

        // Convert to base64
        resolve(canvas.toDataURL('image/png'));
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Convert image to grayscale
 */
function convertToGrayscale(data: Uint8ClampedArray) {
  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    data[i] = avg;     // R
    data[i + 1] = avg; // G
    data[i + 2] = avg; // B
    // Alpha (data[i + 3]) remains unchanged
  }
}

/**
 * Increase image contrast
 */
function increaseContrast(data: Uint8ClampedArray, factor: number) {
  const intercept = 128 * (1 - factor);

  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, Math.max(0, data[i] * factor + intercept));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] * factor + intercept));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] * factor + intercept));
  }
}

/**
 * Sharpen image using convolution
 */
function sharpenImage(imageData: ImageData, width: number, height: number) {
  const data = imageData.data;
  const kernel = [
    0, -1, 0,
    -1, 5, -1,
    0, -1, 0
  ];

  const tempData = new Uint8ClampedArray(data);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;

      for (let c = 0; c < 3; c++) { // RGB channels
        let sum = 0;

        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const kernelIdx = (ky + 1) * 3 + (kx + 1);
            const pixelIdx = ((y + ky) * width + (x + kx)) * 4 + c;
            sum += tempData[pixelIdx] * kernel[kernelIdx];
          }
        }

        data[idx + c] = Math.min(255, Math.max(0, sum));
      }
    }
  }
}

/**
 * Auto-adjust brightness and remove noise
 */
export function autoAdjustImage(imageData: ImageData): ImageData {
  const data = imageData.data;

  // Calculate histogram
  const histogram = new Array(256).fill(0);
  for (let i = 0; i < data.length; i += 4) {
    const gray = Math.round((data[i] + data[i + 1] + data[i + 2]) / 3);
    histogram[gray]++;
  }

  // Find min and max used values
  let min = 0, max = 255;
  for (let i = 0; i < 256; i++) {
    if (histogram[i] > 0) {
      min = i;
      break;
    }
  }
  for (let i = 255; i >= 0; i--) {
    if (histogram[i] > 0) {
      max = i;
      break;
    }
  }

  // Stretch contrast
  const range = max - min;
  if (range > 0) {
    for (let i = 0; i < data.length; i += 4) {
      for (let c = 0; c < 3; c++) {
        data[i + c] = Math.round(((data[i + c] - min) / range) * 255);
      }
    }
  }

  return imageData;
}
