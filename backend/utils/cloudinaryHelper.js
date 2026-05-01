const { cloudinary, isCloudinaryConfigured } = require("../config/cloudinary");

/**
 * Upload a file buffer or base64 string to Cloudinary
 * @param {Buffer|String} fileData - The file buffer or base64 string
 * @param {String} folder - The target folder in Cloudinary
 * @returns {Promise<Object>} - Cloudinary upload result
 */
const uploadToCloudinary = (fileData, folder = "petcare") => {
    return new Promise((resolve, reject) => {
        if (!isCloudinaryConfigured) {
            return reject(new Error("Cloudinary is not configured"));
        }

        const options = {
            folder,
            resource_type: "image",
            transformation: [
                { width: 800, height: 800, crop: "limit" },
                { quality: "auto" },
                { fetch_format: "auto" },
            ],
        };

        if (typeof fileData === "string" && fileData.startsWith("data:image")) {
            // It's a base64 string
            cloudinary.uploader.upload(fileData, options, (error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
        } else if (Buffer.isBuffer(fileData)) {
            // It's a file buffer (e.g. from multer)
            const stream = cloudinary.uploader.upload_stream(
                options,
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            stream.end(fileData);
        } else {
            reject(new Error("Invalid file data type. Expected Base64 string or Buffer."));
        }
    });
};

/**
 * Delete an image from Cloudinary
 * @param {String} publicId - The Cloudinary public ID or URL
 */
const deleteFromCloudinary = async (publicId) => {
    if (publicId && isCloudinaryConfigured) {
        try {
            // If the user passes a full URL by mistake, try to extract the public ID
            let idToDelete = publicId;
            if (publicId.startsWith('http')) {
                const parts = publicId.split('/');
                const filename = parts[parts.length - 1];
                const nameWithoutExt = filename.split('.')[0];
                const folderPart = parts[parts.length - 2];
                // basic extraction assuming folder/filename
                if (folderPart !== 'upload') {
                    idToDelete = `${folderPart}/${nameWithoutExt}`;
                } else {
                    idToDelete = nameWithoutExt;
                }
            }
            await cloudinary.uploader.destroy(idToDelete);
        } catch (error) {
            console.error("Cloudinary deletion error:", error.message);
        }
    }
};

module.exports = {
    uploadToCloudinary,
    deleteFromCloudinary
};
