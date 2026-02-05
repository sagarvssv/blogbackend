import cloudinary from "../config/cloudinary.js";

export const uploadToCloudinary = async (fileOrUrl, folder = "blog") => {
  try {
    const path = fileOrUrl.path || fileorUrl.url;
    const result = await cloudinary.uploader.upload(path, {
      folder,
      resource_type: "auto",
    });

    return {
      url: result.secure_url,
      public_id: result.public_id,
    };

  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Failed to upload image to Cloudinary");
  }
};

export const deleteFromCloudinary = async (public_id) => {
  try {
    return await cloudinary.uploader.destroy(public_id);
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    throw new Error("Failed to delete image from Cloudinary");
  }
};
