import React, { useEffect, useState } from "react";
import { getToken } from "../services/LocalStorageService";
import { useTheme } from "@emotion/react";
import {
  Autocomplete,
  TextField,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  InputAdornment,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

import axios from "axios";

const TransactionsPage = () => {
  const { access_token } = getToken();
  const [accounts, setAccounts] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    // Fetch bank accounts
    const fetchAccounts = async () => {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/get-accounts/`,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );
      setAccounts(response.data);
      if (response.data.length > 0) {
        fetchTransactions(response.data[0].id);
      }
    };

    fetchAccounts();
  }, []);
  const handleSearchChange = (event, value) => {
    setSearchText(value);
    const lowercasedFilter = value.toLowerCase();
    const filteredData = transactions.filter((entry) =>
      Object.keys(entry).some(
        (key) =>
          entry[key] &&
          entry[key].toString().toLowerCase().includes(lowercasedFilter)
      )
    );
    setFilteredTransactions(filteredData);
  };
  const fetchTransactions = async (accountId) => {
    const response = await axios.get(
      `${process.env.REACT_APP_BACKEND_URL}/analysis/get-transactions/${accountId}/`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    setTransactions(response.data);
    setFilteredTransactions(response.data);
  };

  const handleChangeTab = (event, newValue) => {
    setSelectedTab(newValue);
    fetchTransactions(accounts[newValue].id);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <div>
      <Tabs
        value={selectedTab}
        onChange={handleChangeTab}
        aria-label="Bank accounts tabs"
      >
        {accounts.map((account, index) => (
          <Tab label={account.reference_name} key={account.id} />
        ))}
      </Tabs>
      <Autocomplete
        freeSolo
        size="small"
        sx={{
          width: "25%",
          marginTop: "12px",
        }}
        options={transactions.map((option) => option.description)}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Search Transactions"
            InputProps={{
              ...params.InputProps,
              type: "search",
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton>
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        )}
        onInputChange={handleSearchChange}
      />
      <TableContainer
        component={Paper}
        sx={{
          marginTop: "12px",
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Balance</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTransactions
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.date}</TableCell>
                  <TableCell>{row.description}</TableCell>
                  <TableCell>{`${row.amount}`}</TableCell>
                  <TableCell>{row.transaction_type}</TableCell>
                  <TableCell>{row.balance}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredTransactions.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </div>
  );
};

export default TransactionsPage;
