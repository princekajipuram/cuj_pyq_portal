import cloudinary from '../config/cloudinary.js';

/**
 * Uploads a file buffer to Cloudinary.
 * Supports PDFs and images.
 * @param {Buffer} fileBuffer - The file buffer from multer.
 * @param {string} folder - The destination folder in Cloudinary.
 * @param {string} resourceType - 'auto', 'raw', or 'image'.
 * @returns {Promise<object>} - Resolves with the Cloudinary upload response.
 */
export const uploadToCloudinary = (fileBuffer, folder = 'pyq_portal', resourceType = 'auto') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        access_mode: 'public'
      },
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
