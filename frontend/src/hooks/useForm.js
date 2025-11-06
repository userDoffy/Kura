// src/hooks/useForm.js
import { useState } from "react";

const useForm = (initialState) => {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});

  const validate = (name, value, updatedFormData = formData) => {
    let message = "";

    // --- Username ---
    if (name === "username") {
      const trimmedStart = value.trimStart();
      if (trimmedStart.length < 3) {
        message = "Username must be at least 3 characters long";
      } else if (!/^[A-Za-z][A-Za-z0-9_ ]{2,}$/.test(trimmedStart)) {
        message =
          "Username must start with a letter and can include letters, numbers, underscores, and spaces";
      }
    }

    // --- Email ---
    if (name === "email") {
      const trimmedValue = value.trim();
      if (
        !/^[a-zA-Z0-9](\.?[a-zA-Z0-9_-])*@[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+$/i.test(
          trimmedValue
        )
      ) {
        message = "Invalid email format. Example: user@example.com";
      }
    }

    // --- Password ---
    if (name === "password") {
      if (value.length < 8) {
        message = "Password must be at least 8 characters long";
      } else if (!/[0-9]/.test(value)) {
        message = "Password must contain at least one number";
      } else if (!/[^A-Za-z0-9]/.test(value)) {
        message = "Password must contain at least one special character";
      }
    }

    // --- Confirm Password ---
    if (name === "confirmPassword") {
      if (value !== updatedFormData.password) {
        message = "Passwords do not match";
      }
    }

    // --- Cross-field validation (when password changes, check confirmPassword) ---
    if (name === "password" && updatedFormData.confirmPassword) {
      if (updatedFormData.confirmPassword !== value) {
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
    }

    // --- Standard error update ---
    setErrors((prev) => ({
      ...prev,
      [name]: message,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const processedValue = name === "username" ? value.trimStart() : value;

    const updatedFormData = { ...formData, [name]: processedValue };
    setFormData(updatedFormData);
    validate(name, processedValue, updatedFormData);
  };

  const isFormValid = () => {
    return (
      Object.values(errors).every((err) => !err) &&
      Object.values(formData).every((field) => field !== "")
    );
  };

  return { formData, handleChange, setFormData, errors, isFormValid };
};

export default useForm;
