import React, { createContext, useState, useEffect } from "react";

// Create the context
export const SavedOutfitsContext = createContext();

// Provider component
export const SavedOutfitsProvider = ({ children }) => {
  const [savedOutfits, setSavedOutfits] = useState([]);

  // Load saved outfits from localStorage on mount
  useEffect(() => {
    const storedOutfits = JSON.parse(localStorage.getItem("savedOutfits"));
    if (storedOutfits) setSavedOutfits(storedOutfits);
  }, []);

  // Save to localStorage whenever savedOutfits changes
  useEffect(() => {
    localStorage.setItem("savedOutfits", JSON.stringify(savedOutfits));
  }, [savedOutfits]);

  // Function to add a new outfit
  const addOutfit = (outfit) => {
    setSavedOutfits((prev) => [...prev, outfit]);
  };

  // Function to remove an outfit by id
  const removeOutfit = (id) => {
    setSavedOutfits((prev) => prev.filter((o) => o.id !== id));
  };

  return (
    <SavedOutfitsContext.Provider
      value={{ savedOutfits, addOutfit, removeOutfit }}
    >
      {children}
    </SavedOutfitsContext.Provider>
  );
};
