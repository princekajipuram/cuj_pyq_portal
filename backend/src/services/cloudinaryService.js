import cloudinary from '../config/cloudinary.js';
import path from 'path';

/**
 * Uploads a file buffer to Cloudinary.
 * Supports PDFs and images.
 * @param {Buffer} fileBuffer - The file buffer from multer.
 * @param {string} folder - The destination folder in Cloudinary.
 * @param {string} resourceType - 'auto', 'raw', or 'image'.
 * @param {string} originalName - The original filename.
 * @returns {Promise<object>} - Resolves with the Cloudinary upload response.
 */
export const uploadToCloudinary = (fileBuffer, folder = 'pyq_portal', resourceType = 'auto', originalName = '') => {
  return new Promise((resolve, reject) => {
    const options = {
      folder,
      resource_type: resourceType,
      access_mode: 'public'
    };

    if (originalName) {
      const ext = path.extname(originalName);
      const base = path.basename(originalName, ext);
      const cleanBase = base.replace(/[^a-zA-Z0-9-_]/g, '_');
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      options.public_id = `${cleanBase}-${uniqueSuffix}${ext}`;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) {
          console.error(`[CloudinaryService] Upload error: ${error.message}`);
          return reject(error);
        }
        resolve(result);
      }
    );

    uploadStream.end(fileBuffer);
  });
};

/**
 * Deletes an asset from Cloudinary.
 * @param {string} publicId - The Cloudinary public ID of the asset.
 * @param {string} resourceType - 'image', 'video', or 'raw'.
 * @returns {Promise<object>} - Resolves with Cloudinary deletion confirmation.
 */
export const deleteFromCloudinary = async (publicId, resourceType = 'auto') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });
    return result;
  } catch (error) {
    console.error(`[CloudinaryService] Delete error: ${error.message}`);
    throw error;
  }
};
