// src/hooks/useFormValidation.ts

import { useState, useMemo } from "react";

type ValidationRule<T> = (value: T) => string | null;

interface UseFormValidationOptions<T> {
  initialValues: T;
  validationRules: Partial<Record<keyof T, ValidationRule<any>[]>>;
}

export function useFormValidation<T extends Record<string, any>>({
  initialValues,
  validationRules,
}: UseFormValidationOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [touched, setTouched] = useState<Record<keyof T, boolean>>(
    {} as Record<keyof T, boolean>
  );

  const errors = useMemo(() => {
    const newErrors: Partial<Record<keyof T, string>> = {};

    Object.keys(validationRules).forEach((field) => {
      const fieldKey = field as keyof T;
      const rules = validationRules[fieldKey];
      const value = values[fieldKey];

      if (rules && touched[fieldKey]) {
        for (const rule of rules) {
          const error = rule(value);
          if (error) {
            newErrors[fieldKey] = error;
            break;
          }
        }
      }
    });

    return newErrors;
  }, [values, touched, validationRules]);

  const setValue = (field: keyof T, value: any) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const setFieldTouched = (field: keyof T, isTouched: boolean = true) => {
    setTouched((prev) => ({ ...prev, [field]: isTouched }));
  };

  const validateField = (field: keyof T) => {
    setFieldTouched(field);
    const rules = validationRules[field];
    const value = values[field];

    if (rules) {
      for (const rule of rules) {
        const error = rule(value);
        if (error) return error;
      }
    }
    return null;
  };

  const validateAll = () => {
    const allFields = Object.keys(validationRules) as (keyof T)[];
    allFields.forEach((field) => setFieldTouched(field));

    return Object.keys(errors).length === 0;
  };

  const reset = () => {
    setValues(initialValues);
    setTouched({} as Record<keyof T, boolean>);
  };

  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    errors,
    touched,
    isValid,
    setValue,
    setFieldTouched,
    validateField,
    validateAll,
    reset,
  };
}
