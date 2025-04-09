import { useState } from "react";

export default function useSessionStorage<T>(key: string, initialValue: T): [T, (value: T) => void, () => void] {
    const [storedValue, setStoredValue] = useState<T>(() => {
      try {
        const item = sessionStorage.getItem(key);
        return item ? (JSON.parse(item) as T) : initialValue;
      } catch (error) {
        console.error(`Error reading sessionStorage key “${key}”:`, error);
        return initialValue;
      }
    });
  
    const setValue = (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        sessionStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(`Error setting sessionStorage key “${key}”:`, error);
      }
    };
  
    const clearValue = () => {
      try {
        setStoredValue(initialValue);
        sessionStorage.removeItem(key);
      } catch (error) {
        console.error(`Error clearing sessionStorage key “${key}”:`, error);
      }
    };
  
    return [storedValue, setValue, clearValue];
  }