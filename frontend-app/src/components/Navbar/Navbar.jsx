import React from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { useColorMode } from "../../contexts/ColorModeContext";
import NightsStayIcon from "@mui/icons-material/NightsStay";

const Navbar = ({ onSidebarToggle, isSidebarOpen }) => {
  const theme = useTheme();
  const { mode, toggleColorMode } = useColorMode();
  const drawerWidth = 220;

  return (
    <AppBar
      position="fixed"
      sx={{
        width: isSidebarOpen ? `calc(100% - ${drawerWidth}px)` : "100%",
        marginLeft: isSidebarOpen ? `${drawerWidth}px` : 0,
        mr: isSidebarOpen ? 0 : 0,
        transition: theme.transitions.create(["margin", "width"], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        backgroundColor: theme.palette.appBarColor,
        // borderBottomStyle: "solid",
        // borderBottomColor: "#000"
      }}
      elevation={0}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onSidebarToggle}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          Personal Finance
        </Typography>
        <IconButton color="inherit" onClick={toggleColorMode}>
          {mode === "dark" ? <Brightness7Icon /> : <NightsStayIcon />}
        </IconButton>
        <IconButton color="inherit">
          <AccountCircleIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;