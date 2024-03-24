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
import { getToken, removeToken } from "../../services/LocalStorageService";
const drawerWidth = 220;

const Sidebar = ({ open, userData }) => {
  const theme = useTheme();
  const location = useLocation();
  const [openSubLinks, setOpenSubLinks] = useState({});
  const { access_token } = getToken();
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
  const renderListItem = (item) => (
    <ListItem
      button
      onClick={() => (item.subLinks ? toggleSubLinks(item.title) : null)}
      style={{
        padding: "10px",
        backgroundColor: isActive(item.path)
          ? theme.palette.action.selected
          : "transparent", // Change background color if active
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
  );

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
          backgroundColor: theme.palette.appBarColor,
        },
      }}
    >
      <Toolbar
        sx={{
          m: 2,
          backgroundColor: theme.palette.background.paper,
          borderRadius: "12px",
        }}
      >
        <img
          src="/assets/icons/logo/logo.svg"
          alt="Logo"
          style={{ height: "40px" }}
        />
        <Box>
          <Typography variant="subtitle2">
            {userData.first_name} {userData.last_name}
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
                      <ListItem
                        button
                        style={{
                          paddingLeft: "20px",
                          backgroundColor: isActive(subLink.path)
                            ? theme.palette.action.selected
                            : "transparent",
                        }}
                      >
                        <ListItemIcon>
                          <subLink.Icon />
                        </ListItemIcon>
                        <ListItemText primary={subLink.title} />
                      </ListItem>
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
