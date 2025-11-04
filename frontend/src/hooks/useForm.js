// src/hooks/useForm.js
import { useState } from "react";

const useForm = (initialState) => {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});

  const validate = (name, value) => {
    let message = "";

    if (name === "username") {
      if (!/^[A-Za-z][A-Za-z0-9_]{2,}$/.test(value)) {
        message =
          "Username must start with a letter & be at least 3 characters";
      }
    }

    if (name === "email") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        message = "Invalid email format";
      }
    }

    if (name === "password") {
      if (value.length < 6) {
        message = "Password must be at least 6 characters long";
      } else if (!/[0-9]/.test(value)) {
        message = "Password must contain at least one number";
      } else if (!/[^A-Za-z0-9]/.test(value)) {
        message = "Password must contain at least one special character";
      }
    }

    // ✅ Confirm Password Check (return early — no override)
    if (name === "confirmPassword") {
      if (value !== formData.password) {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: "Passwords do not match",
        }));
      } else {
        setErrors((prev) => {
          const { confirmPassword, ...rest } = prev;
          return rest;
        });
      }
      return; 
    }

    // ✅ Standard validation error update
    setErrors((prev) => ({
      ...prev,
      [name]: message,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    validate(name, value);
  };

  return { formData, handleChange, setFormData, errors };
};

export default useForm;
