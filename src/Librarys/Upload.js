import axios from "axios";

// Replace with your Cloudinary details
const cloudName = "dlvoo8f4b";     
const uploadPreset = "chat_uploads";   

const upload = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      formData
    );

    console.log("✅ Upload success:", response.data);
    return response.data.secure_url;
  } catch (error) {
    console.error("❌ Cloudinary upload error:", error.response?.data || error.message);
    return null;
  }
};

export default upload;
