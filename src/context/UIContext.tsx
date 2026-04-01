import React, { createContext, useContext, useState } from "react";

const UIContext = createContext<any>(null);

export const UIProvider = ({ children }: any) => {
  const [lowStimulus, setLowStimulus] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [fontScale, setFontScale] = useState(1);

  return (
    <UIContext.Provider
      value={{
        lowStimulus,
        setLowStimulus,
        reduceMotion,
        setReduceMotion,
        highContrast,
        setHighContrast,
        fontScale,
        setFontScale,
      }}
    >
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => useContext(UIContext);