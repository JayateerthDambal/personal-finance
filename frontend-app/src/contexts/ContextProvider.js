import React, { createContext, useContext, useState } from 'react';

const StateContext = createContext();

const initialState = {
    chat: false,
    cart: false,
    userProfile: false,
    notification: false,
};

export const ContextProvider = ({ children }) => {
    const [screenSize, setScreenSize] = useState(undefined);
    const [themeSettings, setThemeSettings] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isClicked, setIsClicked] = useState(initialState);


    const handleClick = (clicked) => setIsClicked({ ...initialState, [clicked]: true });

    return (
        // eslint-disable-next-line react/jsx-no-constructed-context-values
        <StateContext.Provider value={{ isSidebarOpen, screenSize, setScreenSize, handleClick, isClicked, initialState, setIsClicked, setIsSidebarOpen, themeSettings, setThemeSettings }}>
            {children}
        </StateContext.Provider>
    );
};

export const useStateContext = () => useContext(StateContext);