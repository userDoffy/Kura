import { useState } from 'react';

const useForm = (initialState) => {
  const [formData, setFormData] = useState(initialState);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (Array.isArray(formData)) {
      const index = parseInt(name);
      const newArray = [...formData];
      newArray[index] = value;
      setFormData(newArray);
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  return { formData, handleChange, setFormData };
};

export default useForm;
