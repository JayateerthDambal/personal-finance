import React, { useState } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Toolbar,
  Typography,
  Box,
  Divider,
  Tooltip,
  IconButton,
} from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { useTheme } from "@emotion/react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import config from "./config";
import { Logout } from "@mui/icons-material";
import { useDispatch } from "react-redux";
import { unSetUserToken } from "../../features/authSlice";
import { removeToken } from "../../services/LocalStorageService";
import { motion } from "framer-motion";

const drawerWidth = 220;

const listItemVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300 } },
};

const Sidebar = ({ open, userData }) => {
  const theme = useTheme();
  const location = useLocation();
  const [openSubLinks, setOpenSubLinks] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toggleSubLinks = (title) => {
    setOpenSubLinks({ ...openSubLinks, [title]: !openSubLinks[title] });
  };

  const isActive = (path) => location.pathname === path; // Function to check if the tab is active

  const handleLogout = () => {
    dispatch(unSetUserToken({ access_token: null }));
    removeToken();
    navigate("/auth/login");
  };
  const renderListItem = (item) => {
    const bgColor = isActive(item.path)
      ? theme.palette.listItemColor
      : "transparent";

    return (
      <motion.li
        variants={listItemVariants}
        initial="hidden"
        animate="visible"
        whileHover={{
          scale: 1.05,
          backgroundColor: theme.palette.listItemColor,
        }}
        whileTap={{
          scale: 0.95,
          backgroundColor: theme.palette.listItemColor,
        }}
        transition={{ duration: 0.2 }}
        style={{ borderRadius: "12px", marginTop: "5px" }}
      >
        <ListItem
          button
          onClick={() => (item.subLinks ? toggleSubLinks(item.title) : null)}
          sx={{
            padding: "10px",
            backgroundColor: bgColor,
            borderRadius: "12px",
            "&:hover": {
              backgroundColor: theme.palette.listItemColor,
            },
          }}
        >
          <ListItemIcon>
            <item.Icon />
          </ListItemIcon>
          <ListItemText primary={item.title} />
          {item.subLinks ? (
            openSubLinks[item.title] ? (
              <ExpandLess />
            ) : (
              <ExpandMore />
            )
          ) : null}
        </ListItem>
      </motion.li>
    );
  };

  return (
    <Drawer
      variant="persistent"
      open={open}
      anchor="left"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: "border-box",
          backgroundColor: theme.palette.background.default,
        },
      }}
    >
      <Toolbar
        sx={{
          m: 2,
          backgroundColor: theme.palette.background.coldSteel,
          borderRadius: "12px",
        }}
      >
        <img
          src="/assets/ArthaLogoSvg.svg"
          alt="Logo"
          style={{ height: "40px" }}
        />
        <Box>
          <Typography variant="h5">
            Artha
          </Typography>
        </Box>
      </Toolbar>
      <Divider variant="middle" />
      <List
        sx={{
          padding: "10px",
        }}
      >
        {config.map((item) => (
          <React.Fragment key={item.title}>
            {item.subLinks ? (
              renderListItem(item)
            ) : (
              <Link
                to={item.path}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                {renderListItem(item)}
              </Link>
            )}
            {item.subLinks && (
              <Collapse
                in={openSubLinks[item.title]}
                timeout="auto"
                unmountOnExit
              >
                <List component="div" disablePadding>
                  {item.subLinks.map((subLink) => (
                    <Link
                      to={subLink.path}
                      style={{ textDecoration: "none", color: "inherit" }}
                      key={subLink.title}
                    >
                      <motion.li
                        variants={listItemVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <ListItem
                          button
                          style={{
                            paddingLeft: "20px",
                            backgroundColor: isActive(subLink.path)
                              ? theme.palette.buttonColor
                              : "transparent",
                            borderRadius: "8px",
                            marginTop: "5px",
                          }}
                        >
                          <ListItemIcon>
                            <subLink.Icon />
                          </ListItemIcon>
                          <ListItemText primary={subLink.title} />
                        </ListItem>
                      </motion.li>
                    </Link>
                  ))}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        ))}
      </List>
      <Box sx={{ m: 9, alignSelf: "center" }}>
        <Tooltip title="Logout">
          <IconButton color="primary" onClick={handleLogout}>
            <Logout />
          </IconButton>
        </Tooltip>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
