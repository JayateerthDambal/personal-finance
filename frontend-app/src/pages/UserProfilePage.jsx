import React, { useState, useEffect } from "react";
import { getToken, removeToken } from "../services/LocalStorageService";
import { useGetLoggedUserQuery } from "../services/userAuthAPI";
import { setUserToken, unSetUserToken } from "../features/authSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Box, Grid, Paper } from "@mui/material";
import { useTheme } from "@emotion/react";

const UserProfilePage = () => {
  const { access_token } = getToken();
  const { data, isSuccess, isError } = useGetLoggedUserQuery(access_token);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  let [userData, setUserData] = useState([
    {
      email: "",
      first_name: "",
      last_name: "",
    },
  ]);

  useEffect(() => {
    if (data && isSuccess) {
      setUserData({
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
      });
    } else if (isError) {
      console.log("error");
      dispatch(unSetUserToken({ access_token: null }));
      removeToken();
      navigate("/login");
    }
  }, [data, isSuccess, isError]);
  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <Box
              sx={{
                backgroundColor: theme.palette.background.coldSteel,
                height: "150px",
                borderRadius: "8px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                padding: "8px",
              }}
            >
              <Paper
                sx={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "50%",
                  // backgroundImage:,
                }}
                elevation={3}
              ></Paper>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default UserProfilePage;
