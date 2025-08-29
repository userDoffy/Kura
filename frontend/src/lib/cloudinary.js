import axios from "axios";

export async function uploadToCloudinary(file) {
  const cloudName = "dtow9mcgz";
  const uploadPreset = "kura_uploads";

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const { data } = await axios.post(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    formData
  );

  return data.secure_url;
}
