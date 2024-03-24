import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Divider,
  Link,
  useMediaQuery,
  useTheme,
  Snackbar,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { CustomField, AnimatedButton } from "../../components";
import { setUserToken } from "../../features/authSlice";
import { useDispatch } from "react-redux";
import MuiAlert from "@mui/material/Alert";
import {
  store_user_tokens,
  getToken,
} from "../../services/LocalStorageService";
import { useLoginUserMutation } from "../../services/userAuthAPI";
import axios from "axios";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});
const LoginPage = () => {
  const navigate = useNavigate();
  const [cookies] = useCookies(["csrftoken"]);
  const csrftoken = cookies.csrftoken;
  axios.defaults.headers.common["X-CSRFToken"] = csrftoken;

  const [loginUser] = useLoginUserMutation();
  const [serverError, setServerError] = useState([]);
  const dispatch = useDispatch();
  const [errorOpen, setErrorOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleClose = (event, reason) => {
    setErrorOpen(false);
    // setOpen(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form_data = new FormData(event.currentTarget);
    form_data.append("csrfmiddlewaretoken", csrftoken);
    const user_login_data = {
      email: form_data.get("email"),
      password: form_data.get("password"),
    };

    const res = await loginUser(user_login_data);
    if (res.error) {
      console.log(res);
      setErrorOpen(true);
      setServerError(res.error.data.errors);
    } else if (res.data) {
      store_user_tokens(res.data.token);
      let { access_token } = getToken();
      dispatch(setUserToken({ access_token: access_token }));
      navigate("/app");
    }
  };

  let { access_token } = getToken();
  useEffect(() => {
    dispatch(setUserToken({ access_token: access_token }));
  }, [access_token, dispatch]);

  const loginPageStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(to right, #6e8efb, #a777e3)", // Elegant gradient background
    padding: "30px",
    borderRadius: "22px",
  };

  const paperStyle = {
    padding: "40px",
    borderRadius: "15px",
    width: isMobile ? "90%" : "500px", // Responsive width
    margin: "auto",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    backdropFilter: "blur(10px)",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
  };

  const titleStyle = {
    marginBottom: "20px",
    fontWeight: "bold",
    fontSize: "24px",
    color: "#333333",
    textAlign: "center",
  };

  return (
    <div style={loginPageStyle}>
      <Paper elevation={3} style={paperStyle}>
        <Typography variant="h4" style={titleStyle}>
          Login
        </Typography>
        <Divider style={{ marginBottom: "20px", width: "100%" }} />
        <Box
          component="form"
          noValidate
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          id="login-form"
        >
          <CustomField
            label="Email Address"
            id="email"
            name="email"
            type="email"
            required
          />
          <CustomField
            label="Password"
            id="password"
            name="password"
            type="password"
            required
          />
          <Button
            variant="outlined"
            sx={{
              width: "50%",
              alignSelf: "center",
            }}
            type="submit"
          >
            Login
          </Button>
          <Link style={{ marginTop: "10px" }} color="primary">
            Forgot Password?
          </Link>
          {serverError ? (
            <Snackbar
              open={errorOpen}
              autoHideDuration={6000}
              onClose={handleClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
              {serverError.password ? (
                <Alert
                  onClose={handleClose}
                  severity="error"
                  sx={{ width: "100%" }}
                >
                  {serverError.password}
                </Alert>
              ) : (
                <Alert
                  onClose={handleClose}
                  severity="error"
                  sx={{ width: "100%" }}
                >
                  {serverError}
                </Alert>
              )}
            </Snackbar>
          ) : (
            ""
          )}
        </Box>
      </Paper>
    </div>
  );
};

export default LoginPage;
