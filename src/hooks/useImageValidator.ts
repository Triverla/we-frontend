import { useCallback } from "react";

type ValidationResult = {
  isValid: boolean;
  reason?: string;
};

export const useImageValidator = () => {
  const validateImageBeforeUpload = useCallback(
    (file: File): Promise<ValidationResult> => {
      const acceptedFormats = ["image/jpeg", "image/png", "image/webp"];

      return new Promise((resolve) => {
        if (!acceptedFormats.includes(file.type)) {
          return resolve({
            isValid: false,
            reason: `${file.name}: Unsupported format. Allowed formats are JPEG, PNG, WebP.`,
          });
        }

        const img = new Image();
        const objectUrl = URL.createObjectURL(file);

        img.onload = () => {
          if (img.width <= img.height) {
            URL.revokeObjectURL(objectUrl);
            return resolve({
              isValid: false,
              reason: `${file.name}: Image must be landscape (width > height).`,
            });
          }

          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            URL.revokeObjectURL(objectUrl);
            return resolve({
              isValid: false,
              reason: `${file.name}: Could not process image.`,
            });
          }

          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;

          let brightnessSum = 0;
          let contrastSum = 0;

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
            brightnessSum += brightness;

            contrastSum += Math.abs(brightness - 128);
          }

          const numPixels = data.length / 4;
          const avgBrightness = brightnessSum / numPixels;
          const avgContrast = contrastSum / numPixels;

          const isTooDarkOrBright = avgBrightness < 30 || avgBrightness > 225;
          const isTooBlurry = avgContrast < 15;

          if (isTooDarkOrBright) {
            URL.revokeObjectURL(objectUrl);
            return resolve({
              isValid: false,
              reason: `${file.name}: Image is too dark or too bright (poor lighting).`,
            });
          }

          if (isTooBlurry) {
            URL.revokeObjectURL(objectUrl);
            return resolve({
              isValid: false,
              reason: `${file.name}: Image appears blurry or low quality.`,
            });
          }

          URL.revokeObjectURL(objectUrl);
          return resolve({ isValid: true });
        };

        img.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          return resolve({
            isValid: false,
            reason: `${file.name}: Failed to load image.`,
          });
        };

        img.src = objectUrl;
      });
    },
    []
  );

  return { validateImageBeforeUpload };
};
