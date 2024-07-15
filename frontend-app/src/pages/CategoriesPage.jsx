import React, { useState, useEffect } from "react";
import { getToken } from "../services/LocalStorageService";
import axios from "axios";
import {
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box,
  Button,
  TablePagination,
  Autocomplete,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { MdDelete, MdEdit } from "react-icons/md";
import { CategoryModal } from "../components";
import { Snackbar, Alert } from "@mui/material";
import { motion } from "framer-motion";
const CategoriesPage = () => {
  const { access_token } = getToken();
  const [accounts, setAccounts] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  // Filter categories based on search term
  const visibleCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearchChange = (event, newValue) => {
    setSearchTerm(newValue);
  };

  useEffect(() => {
    const fetchAccounts = async () => {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/get-accounts/`,
        { headers: { Authorization: `Bearer ${access_token}` } }
      );
      setAccounts(response.data);
      if (response.data.length > 0) {
        fetchCategories(response.data[0].id);
      }
    };
    fetchAccounts();
  }, []);
  const catergorizeTransactions = async (account_id) => {
    const response = await axios.get(
      `${process.env.REACT_APP_BACKEND_URL}/analysis/${account_id}/categorize-transactions/`,
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );
    //  
  };
  const fetchCategories = async (accountId) => {
    const response = await axios.get(
      `${process.env.REACT_APP_BACKEND_URL}/analysis/${accountId}/get-categories/`,
      { headers: { Authorization: `Bearer ${access_token}` } }
    );
    setCategories(response.data);
  };

  const handleChangeTab = (event, newValue) => {
    setSelectedTab(newValue);
    fetchCategories(accounts[newValue].id);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenModal = (category = null) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
  };

  const handleSaveCategory = async (categoryData) => {
    const bankAccountId = accounts[selectedTab].id;
    const fullCategoryData = {
      ...categoryData,
      account_id: bankAccountId,
    };

    const url = `${process.env.REACT_APP_BACKEND_URL}/analysis/categories/`;

    const method = "post";
    console.log(fullCategoryData);
    try {
      const response = await axios[method](url, fullCategoryData, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
      setSnackbarMessage("Category saved successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      catergorizeTransactions(bankAccountId);
      fetchCategories(bankAccountId);

      handleCloseModal();
    } catch (error) {
      console.error("Failed to save the category", error);
      setSnackbarMessage(
        error.response?.data?.error || "Error saving category"
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };
  const handleDeleteConfirm = async () => {
    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_BACKEND_URL}/analysis/delete/categories/${categoryToDelete.id}/`,
        { headers: { Authorization: `Bearer ${access_token}` } }
      );
      if (response.status === 204) {
        setSnackbarMessage("Category deleted successfully!");
        setSnackbarSeverity("success");
      } else {
        setSnackbarMessage(
          response.data.error ||
            "An error occurred while deleting the category."
        );
        setSnackbarSeverity("error");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      setSnackbarMessage(
        error.response?.data?.error ||
          "An error occurred while deleting the category."
      );
      setSnackbarSeverity("error");
    } finally {
      setSnackbarOpen(true);
      setDeleteDialogOpen(false);
      fetchCategories(accounts[selectedTab].id);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };
  // Snackbar Animation
  const snackbarVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <Box>
      <Button
        onClick={() => handleOpenModal()}
        variant="contained"
        color="primary"
        sx={{ float: "right" }}
      >
        Add New Category
      </Button>
      <Autocomplete
        freeSolo
        value={searchTerm}
        onInputChange={handleSearchChange}
        options={categories.map((option) => option.name)}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Search Categories"
            margin="normal"
            variant="outlined"
          />
        )}
        sx={{ width: 300, marginBottom: 2, borderRadius: "12px" }}
      />

      <Tabs
        value={selectedTab}
        onChange={handleChangeTab}
        aria-label="Bank accounts tabs"
      >
        {accounts.map((account, index) => (
          <Tab label={account.reference_name} key={account.id} />
        ))}
      </Tabs>
      <TableContainer
        component={Paper}
        sx={{
          marginTop: "10px",
        }}
        elevation={5}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Keywords</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleCategories
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((category) => (
                <TableRow key={category.id}>
                  <TableCell>{category.name}</TableCell>
                  <TableCell>{category.category_type}</TableCell>
                  <TableCell>
                    {category.keywords.map((k) => k.toUpperCase()).join(", ")}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleOpenModal(category)}
                      size="small"
                    >
                      <MdEdit />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteClick(category)}
                      size="small"
                    >
                      <MdDelete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={categories.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
      <CategoryModal
        open={isModalOpen}
        handleClose={handleCloseModal}
        category={selectedCategory}
        onSave={handleSaveCategory}
      />
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        key={snackbarMessage}
      >
        <motion.div
          variants={snackbarVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={snackbarSeverity}
            variant="filled"
          >
            {snackbarMessage}
          </Alert>
        </motion.div>
      </Snackbar>

      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Category?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the category "
            {categoryToDelete?.name}
            "? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CategoriesPage;
