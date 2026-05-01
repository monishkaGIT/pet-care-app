/**
 * uploadImage.js — Cloudinary upload utility
 *
 * Uploads images to Cloudinary using unsigned upload preset.
 */

const CLOUDINARY_CLOUD_NAME = 'djuouhvha';
const CLOUDINARY_UPLOAD_PRESET = 'petcare_preset';

/**
 * Uploads a base64 image to Cloudinary and returns the secure URL.
 *
 * @param {string} base64Image - base64 data URI, e.g. "data:image/jpeg;base64,/9j/..."
 * @returns {Promise<string>} - Cloudinary secure URL
 */
export async function uploadToCloudinary(base64Image) {
    if (!base64Image) return '';

    // If it already looks like a Cloudinary URL (e.g. previously uploaded), return as-is
    if (base64Image.startsWith('https://res.cloudinary.com')) return base64Image;

    const body = new FormData();
    body.append('file', base64Image);
    body.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body }
    );

    if (!response.ok) {
        throw new Error('Cloudinary upload failed');
    }

    const data = await response.json();
    return data.secure_url;
}
