import React, { createContext, useContext, useState, useEffect } from 'react';

const ColorModeContext = createContext();

export const useColorMode = () => useContext(ColorModeContext);

export const ColorModeProvider = ({ children }) => {
    const [mode, setMode] = useState('light');
    useEffect(() => {
        const storedMode = localStorage.getItem('colorMode');
        if (storedMode) {
            setMode(storedMode);
        }
    }, []);

    const toggleColorMode = () => {
        const newMode = mode === 'light' ? 'dark' : 'light';
        setMode(newMode);
        localStorage.setItem('colorMode', newMode);
    };

    return (
        <ColorModeContext.Provider value={{ mode, toggleColorMode }}>
            {children}
        </ColorModeContext.Provider>
    );
};
