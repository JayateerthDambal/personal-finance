import { createTheme } from '@mui/material/styles';
const generateShades = (mainColor) => ({
    light: mainColor + '33',
    lighter: mainColor + '66',
    main: mainColor,
    dark: mainColor + '99',
    darker: mainColor + 'CC'
});

const lightPalette = {
    primary: generateShades('#1976d2'), // Blue
    secondary: generateShades('#dc004e'), // Pink
    error: generateShades('#f44336'), // Red
    warning: generateShades('#ffa726'), // Orange
    info: generateShades('#2196f3'), // Light Blue
    success: generateShades('#4caf50'), // Green
    grey: generateShades('#9e9e9e'), // Grey
    text: {
        primary: '#333', // Dark color for light mode
        secondary: '#555', // Lighter color for light mode
        disabled: '#aaa', // Disabled text color for light mode
    },
    background: { default: '#fff', paper: '#f5f5f5', coldSteel: '#e3edf8' },
    appBarColor: "#fff",
    buttonColor: "#ADA2FF",
    listItemColor: "#ADA2FF"
};

const darkPalette = {
    primary: generateShades('#90caf9'), // Light Blue
    secondary: generateShades('#f48fb1'), // Light Pink
    error: generateShades('#e57373'), // Light Red
    warning: generateShades('#ffb74d'), // Light Orange
    info: generateShades('#64b5f6'), // Lighter Blue
    success: generateShades('#81c784'), // Light Green
    grey: generateShades('#bdbdbd'), // Light Grey
    text: {
        primary: '#eee', // Light color for dark mode
        secondary: '#bbb', // Darker color for dark mode
        disabled: '#666', // Disabled text color for dark mode
    },
    background: { default: '#303030', paper: '#424242' },
    appBarColor: "#303030",
    buttonColor: "#5755FE"
};

// const typography = {
//     fontFamily: [
//         'Montserrat',
//         'Poppins',
//         'sans-serif',
//     ].join(','),
//     h1: {
//         fontFamily: 'Montserrat',
//         fontWeight: 700,
//     },
//     h2: {
//         fontFamily: 'Montserrat',
//         fontWeight: 700,
//     },
// };

const createModeTheme = (mode) => createTheme({
    palette: mode === 'light' ? lightPalette : darkPalette,
    typography: {
        allVariants: {
            fontFamily: 'Montserrat',
            color: mode === 'light' ? lightPalette.text.primary : darkPalette.text.primary
        },

    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    color: 'white',
                    backgroundColor: mode === 'light' ? '#5755FE' : '#5755FE',
                    '&:hover': {
                        backgroundColor: mode === 'light' ? '#5755FF' : '#648dae',
                    },
                },
            },
        },
        MuiIconButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    margin: "3px",
                    color: mode === 'light' ? "#35374B" : "#F3F8FF",
                    '&:hover': {
                        backgroundColor: mode === 'light' ? '#CAEDFF' : '#7742FE',
                        boxShadow: "3px 3px 8px -7px rgba(0,0,0,0.75)"
                    },
                },
            },
        },
        MuiListItemButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    color: "#F3F8FF",
                    '&:hover': {
                        backgroundColor: mode === 'light' ? '#9681EB' : '#7742FE',
                    },
                },
            },
        },
        MuiAccordionSummary: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    color: "#F3F8FF",
                    '&:hover': {
                        backgroundColor: mode === 'light' ? '#9681EB' : '#7742FE',
                    },
                },
            },
        },
        MuiListItemIcon: {
            styleOverrides: {
                root: {
                    color: mode === 'light' ? "#200E3A" : "#F3F8FF",
                }
            }
        },

    },
});

export default createModeTheme;
