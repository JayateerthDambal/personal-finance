import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  capitalize,
  IconButton,
  styled,
  Toolbar,
  Typography,
  Box,
} from "@mui/material";
import { getToken } from "../services/LocalStorageService";
import { useTheme } from "@emotion/react";
import { UploadBankStatementDialog } from "../components";
import { FiEdit2 } from "react-icons/fi";
import { FiUpload } from "react-icons/fi";
import { MdAddCircle } from "react-icons/md";

const AccountsPage = () => {
  const [bankAccounts, setBankAccounts] = useState([]);
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
  const { access_token } = getToken();
  const theme = useTheme();
  const [dialogOpen, setDialogOpen] = useState(false);

  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    backgroundColor: theme.palette.primary.light, // Light yellow for headers
    color: theme.palette.success.contrastText, // Suitable contrasting text color
    fontWeight: "bold",
  }));

  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    // hover effects for rows
    "&:hover": {
      backgroundColor: theme.palette.background.coldSteel, // Darker when hovered
    },
  }));

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const fetchBankAccounts = async () => {
    const response = await fetch(`${BACKEND_URL}/get-accounts/`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    if (!response.ok) throw new Error("Failed to fetch");
    return await response.json();
  };

  useEffect(() => {
    fetchBankAccounts().then((data) => setBankAccounts(data));
  }, []);

  const handleEdit = (accountId) => {
    // Implement edit navigation or functionality
    console.log("Edit account", accountId);
  };

  return (
    <>
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          padding: 1,
        }}
      >
        <Typography variant="h6">Bank Accounts</Typography>
        <IconButton
          color="primary"
          onClick={() => console.log("Add bank account")}
        >
          <MdAddCircle />
        </IconButton>
      </Toolbar>
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <TableContainer component={Paper} sx={{ width: "95%" }}>
          <Table
            sx={{
              minWidth: 650,
              backgroundColor: theme.palette.background.coldSteel,
            }}
            aria-label="simple table"
          >
            <TableHead>
              <TableRow>
                <StyledTableCell>Account Name</StyledTableCell>
                <StyledTableCell align="right">Account Type</StyledTableCell>
                <StyledTableCell align="right">Actions</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bankAccounts.map((account) => (
                <StyledTableRow
                  key={account.id}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {account.reference_name}
                  </TableCell>
                  <TableCell align="right">
                    {capitalize(account.account_type)}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={() => handleEdit(account.id)}
                      color="primary"
                      size="small"
                    >
                      <FiEdit2 />
                    </IconButton>
                    <IconButton
                      onClick={handleOpenDialog}
                      color="secondary"
                      size="small"
                    >
                      <FiUpload />
                    </IconButton>
                  </TableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <UploadBankStatementDialog
        open={dialogOpen}
        handleClose={handleCloseDialog}
      />
    </>
  );
};

export default AccountsPage;
