import React, { useEffect, useState } from "react";
import { getToken } from "../services/LocalStorageService";
import { useTheme } from "@emotion/react";
import {
  Autocomplete,
  TextField,
  styled,
  Box,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
  FormControlLabel,
  Switch,
  Grid,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import axios from "axios";
import { motion, transform } from "framer-motion";
const TransactionsPage = () => {
  const { access_token } = getToken();
  const [accounts, setAccounts] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [transactionTypeFilter, setTransactionTypeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [viewUncategorized, setViewUncategorized] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);

  const [searchText, setSearchText] = useState("");

  const StyledCard = styled(Card)(({ theme }) => ({
    background: "linear-gradient(135deg, #ebf4f5, #f5f5f5)",
    transition: "background 0.3s ease", // Smooth transition on hover
    backgroundSize: "300% 300%", // Expand the gradient to enable movement
    backgroundPosition: "center",
    borderRadius: "12px",
    "&:hover": {
      background: "linear-gradient(90deg, #ebf4f5, #f5f5f5)",
      boxShadow: "0 0 2px 2px rgba(0, 0, 0, 0.2)",
    },
  }));
  const cardVariants = {
    initial: {
      opacity: 0,
      backgroundSize: "150%", // Start with an expanded background
      backgroundPosition: "center",
    },
    animate: {
      opacity: 1,
      backgroundSize: "100%", // Contract to normal size for a splash effect
      transition: { duration: 0.5 }, // Adjust the duration as needed
    },
    hover: {
      backgroundPosition: "left", // Shift the gradient on hover
      transition: { duration: 0.3 },
    },
  };
  const [summary, setSummary] = useState({
    totalCredits: 0,
    totalDebits: 0,
    categorizedCount: 0,
    uncategorizedCount: 0,
  });

  const catergorizeTransactions = async (account_id) => {
    const response = await axios.get(
      `${process.env.REACT_APP_BACKEND_URL}/analysis/${account_id}/categorize-transactions/`,
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );
  };

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

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/get-accounts/`,
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          }
        );
        if (response.data.length > 0) {
          setAccounts(response.data);
          setSelectedAccount(response.data[0]);
          setSelectedTab(response.data[0].id);
          fetchTransactions(response.data[0].id);
          catergorizeTransactions(response.data[0].id);
        }
      } catch (error) {
        console.error("Error fetching accounts:", error);
      }
    };
    fetchAccounts();
  }, [access_token]);

  const updateSummary = (transactions) => {
    const totalCredits = transactions.reduce(
      (acc, transaction) =>
        transaction.transaction_type === "Credit"
          ? acc + parseFloat(transaction.amount)
          : acc,
      0
    );
    const totalDebits = transactions.reduce(
      (acc, transaction) =>
        transaction.transaction_type === "Debit"
          ? acc + parseFloat(transaction.amount)
          : acc,
      0
    );
    const categorizedCount = transactions.filter(
      (transaction) => transaction.category
    ).length;
    const uncategorizedCount = transactions.filter(
      (transaction) => !transaction.category
    ).length;

    setSummary({
      totalCredits,
      totalDebits,
      categorizedCount,
      uncategorizedCount,
    });
  };
  const extractCategories = (transactions) => {
    const categories = new Set();
    transactions.forEach((transaction) => {
      if (transaction.category && transaction.category.trim() !== "") {
        categories.add(transaction.category);
      }
    });
    return Array.from(categories);
  };

  useEffect(() => {
    setCategoryOptions(extractCategories(transactions));
  }, [transactions]);

  // Whenever filters are applied, update category options
  // useEffect(() => {
  //   setCategoryOptions(extractCategories(filteredTransactions));
  // }, [filteredTransactions]);

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
    updateSummary(response.data);
  };

  const handleChangeTab = (event, newValue) => {
    setSelectedTab(newValue);
    const newAccount = accounts.find((account) => account.id === newValue);
    if (newAccount) {
      setSelectedAccount(newAccount);
      fetchTransactions(newAccount.id);
      catergorizeTransactions(newAccount.id);
    } else {
      console.error("Selected account not found");
    }
  };
  console.log(selectedTab);
  const applyFilters = () => {
    let newFilteredTransactions = transactions.filter((transaction) => {
      const matchesDate =
        (!startDate || new Date(transaction.date) >= startDate) &&
        (!endDate || new Date(transaction.date) <= endDate);
      const matchesCategory =
        categoryFilter === "All" || transaction.category === categoryFilter;
      const matchesUncategorized = !viewUncategorized || !transaction.category;
      const matchesTransactionType =
        transactionTypeFilter === "" ||
        transaction.transaction_type === transactionTypeFilter;

      return (
        matchesDate &&
        matchesCategory &&
        matchesUncategorized &&
        matchesTransactionType
      );
    });
    setFilteredTransactions(newFilteredTransactions);
    updateSummary(newFilteredTransactions);
  };

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
    updateSummary(filteredData);
  };

  // console.log(selectedAccount[0].id);
  return (
    <div>
      <Tabs
        value={selectedTab}
        onChange={handleChangeTab}
        aria-label="Bank accounts tabs"
        indicatorColor="secondary"
      >
        {accounts.map((account) => (
          <Tab
            label={account.reference_name}
            value={account.id}
            key={account.id}
          />
        ))}
      </Tabs>
      <Grid container spacing={2} sx={{ marginTop: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            variants={cardVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
          >
            <StyledCard>
              <CardContent>
                <Typography variant="h6" component="div">
                  Total Credits
                </Typography>
                <Typography variant="h4" sx={{ color: "green" }}>
                  ₹{summary.totalCredits.toFixed(2)}
                </Typography>
              </CardContent>
            </StyledCard>
          </motion.div>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <StyledCard>
              <CardContent>
                <Typography variant="h6" component="div">
                  Total Debits
                </Typography>
                <Typography variant="h4" sx={{ color: "red" }}>
                  ₹{summary.totalDebits.toFixed(2)}
                </Typography>
              </CardContent>
            </StyledCard>
          </motion.div>
        </Grid>
        {/* <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="div">
                Categorized
              </Typography>
              <Chip label={summary.categorizedCount} color="primary" />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="div">
                Uncategorized
              </Typography>
              <Chip
                label={summary.uncategorizedCount}
                color="warning"
                size="large"
              />
            </CardContent>
          </Card>
        </Grid> */}
      </Grid>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Autocomplete
          freeSolo
          size="small"
          sx={{
            width: "20%",
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
              }}
            />
          )}
          onInputChange={handleSearchChange}
        />
        <Box
          sx={{ display: "flex", gap: 2, alignItems: "center", marginTop: 2 }}
        >
          <FormControl size="small">
            <InputLabel size="small">Transaction Type</InputLabel>
            <Select
              value={transactionTypeFilter}
              label="Transaction Type"
              onChange={(e) => setTransactionTypeFilter(e.target.value)}
              variant="standard"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Credit">Credit</MenuItem>
              <MenuItem value="Debit">Debit</MenuItem>
            </Select>
          </FormControl>
          <Autocomplete
            size="small"
            value={categoryFilter}
            onChange={(event, newValue) => {
              setCategoryFilter(newValue || "All");
            }}
            options={categoryOptions}
            sx={{ width: 220 }}
            renderInput={(params) => (
              <TextField {...params} label="Category" variant="outlined" />
            )}
            freeSolo
          />

          <FormControlLabel
            control={
              <Switch
                checked={viewUncategorized}
                onChange={() => setViewUncategorized(!viewUncategorized)}
              />
            }
            label="View Uncategorized"
          />

          <Button
            variant="contained"
            onClick={applyFilters}
            color="primary"
            size="small"
          >
            Apply Filters
          </Button>
        </Box>
      </Box>
      <TableContainer component={Paper} sx={{ marginTop: "8px" }}>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>Date</StyledTableCell>
              <StyledTableCell>Description</StyledTableCell>
              <StyledTableCell>Amount</StyledTableCell>
              <StyledTableCell>Type</StyledTableCell>
              <StyledTableCell>Balance</StyledTableCell>
              <StyledTableCell>Category</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTransactions
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((transaction) => (
                <StyledTableRow key={transaction.id}>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>{transaction.amount}</TableCell>
                  <TableCell>{transaction.transaction_type}</TableCell>
                  <TableCell>{transaction.balance}</TableCell>
                  <TableCell>{transaction.category}</TableCell>
                </StyledTableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={filteredTransactions.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(event, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) =>
            setRowsPerPage(parseInt(event.target.value, 10))
          }
        />
      </TableContainer>
    </div>
  );
};

export default TransactionsPage;
