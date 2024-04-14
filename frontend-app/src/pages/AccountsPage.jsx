import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  capitalize,
} from "@mui/material";
import { getToken } from "../services/LocalStorageService";
import { useTheme } from "@emotion/react";
import { UploadBankStatementDialog } from "../components";
const AccountsPage = () => {
  const [bankAccounts, setBankAccounts] = useState([]);
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
  const { access_token } = getToken();
  const theme = useTheme();
  const [dialogOpen, setDialogOpen] = useState(false);

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

  const handleDelete = (accountId) => {
    // Implement delete functionality
    console.log("Delete account", accountId);
  };

  const handleEdit = (accountId) => {
    // Implement edit navigation or functionality
    console.log("Edit account", accountId);
  };

  return (
    <>
      <TableContainer component={Paper}>
        <Table
          sx={{
            minWidth: 650,
            backgroundColor: theme.palette.background.coldSteel,
          }}
          aria-label="simple table"
        >
          <TableHead>
            <TableRow>
              <TableCell>Account Name</TableCell>
              <TableCell align="right">Account Type</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bankAccounts.map((account) => (
              <TableRow
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
                  <Button
                    onClick={() => handleEdit(account.id)}
                    color="primary"
                  >
                    Edit
                  </Button>
                  <Button onClick={handleOpenDialog} color="secondary">
                    Upload
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <UploadBankStatementDialog
        open={dialogOpen}
        handleClose={handleCloseDialog}
      />
    </>
  );
};

export default AccountsPage;
