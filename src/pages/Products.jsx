import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setProducts, setFilters } from "../redux/productSlice";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Container,
  Typography,
  Select,
  MenuItem,
  Chip,
  FormControl,
  InputLabel,
  Box,
  Button,
  TableContainer,
  Paper,
  TablePagination,
  TextField,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { setUsers } from "../redux/userSlice";
import debounce from "lodash.debounce";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function Products() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { products, filters } = useSelector((state) => state.product);
  const { users } = useSelector((state) => state.user);
  const user = useSelector((state) => state.auth.user);

  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [assignUser, setAssignUser] = useState(null);
  const [sortField, setSortField] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false); // Loader state

  // Fetch Products with filters, search, sorting, and pagination
  const fetchProducts = useCallback(() => {
    setLoading(true);
    const query = {
      category: filters.category || undefined,
      source: filters.source || undefined,
      search: search || undefined,
      sort: sortField,
      order: sortOrder,
      page,
      limit: rowsPerPage,
    };

    api
      .get("/products", { params: query })
      .then((res) => {
        dispatch(setProducts(res.data.products));
        setTotalCount(res.data.total);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filters, search, sortField, sortOrder, page, rowsPerPage, dispatch]);

  // Remove Assignee
  const removeAssignee = (productId, assignedTo, userId) => {
    api
      .post(`/products/assign`, {
        productId,
        userId,
        assignedTo: assignedTo.filter((id) => id !== userId),
      })
      .then(() => fetchProducts())
      .catch(console.error);
  };

  // Assign Product
  const assignProduct = (productId, assignedTo, userId) => {
    let assignee = [...assignedTo] || [];
    assignee.push(userId);
    api
      .post(`/products/assign`, { productId, assignedTo: assignee, userId })
      .then(() => fetchProducts())
      .catch(console.error);
  };

  // Debounce Search Input
  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearch(value);
      setPage(1); // Reset to first page
    }, 500),
    []
  );

  const handleDelete = async (productId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );
    if (!confirmDelete) return;

    try {
      await api.delete(`/products/${productId}`);
      alert("Product deleted successfully");
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete the product. Please try again.");
    }
  };

  useEffect(() => {
    api
      .get("/products/categories")
      .then((res) => setCategories(res.data.categories));

    if (user?.role === "admin") {
      api.get("/users").then((res) => dispatch(setUsers(res.data.users)));
    }
  }, [dispatch, user]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <Box sx={{ mt: 8, minHeight: "90vh" }}>
      <Button
        variant="outlined"
        color="primary"
        onClick={() => navigate(-1)}
        startIcon={<ArrowBackIcon />}
        sx={{ ml: 2, mt: 2 }}>
        Back
      </Button>
      <Container maxWidth="false">
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            my: "20px",
          }}>
          <Typography variant="h5">Products</Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/products/new")}>
            Add Product
          </Button>
        </Box>

        {/* Search & Filters */}
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            label="Search by Name or SKU"
            fullWidth
            onChange={(e) => debouncedSearch(e.target.value)}
          />
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={filters.category}
              onChange={(e) => {
                dispatch(setFilters({ ...filters, category: e.target.value }));
                setPage(1);
              }}>
              <MenuItem value="">All</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Source</InputLabel>
            <Select
              value={filters.source}
              onChange={(e) => {
                dispatch(setFilters({ ...filters, source: e.target.value }));
                setPage(1);
              }}>
              <MenuItem value="">All</MenuItem>
              <MenuItem value="ADMIN">Admin</MenuItem>
              <MenuItem value="USER">User</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Product Table */}
        <Paper sx={{ width: "100%", mb: 2 }}>
          <TableContainer>
            <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
              <TableHead>
                <TableRow>
                  <TableCell>Image</TableCell>
                  <TableCell
                    sx={{ cursor: "pointer" }}
                    onClick={() => {
                      setSortField("name");
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                    }}>
                    Name{" "}
                    {sortField === "name"
                      ? sortOrder === "asc"
                        ? "▲"
                        : "▼"
                      : ""}
                  </TableCell>
                  <TableCell
                    sx={{ cursor: "pointer" }}
                    onClick={() => {
                      setSortField("sku");
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                    }}>
                    SKU{" "}
                    {sortField === "sku"
                      ? sortOrder === "asc"
                        ? "▲"
                        : "▼"
                      : ""}
                  </TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Source</TableCell>
                  {user?.role === "admin" && (
                    <>
                      <TableCell>Assigned</TableCell>
                      <TableCell>Assign</TableCell>
                    </>
                  )}
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow key={product._id}>
                      <TableCell>
                        <img
                          src={`${api.defaults.baseURL}/images/${product.logo}`}
                          alt={product.name}
                          style={{ width: "50px", height: "50px" }}
                        />
                      </TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.sku}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{product.source}</TableCell>
                      {user?.role === "admin" && (
                        <>
                          <TableCell>
                            {users
                              .filter((user) =>
                                product.assignedTo.includes(user._id)
                              )
                              .map((user) => (
                                <Chip
                                  label={user.name}
                                  key={user._id}
                                  onDelete={() =>
                                    removeAssignee(
                                      product._id,
                                      product.assignedTo,
                                      user._id
                                    )
                                  }
                                />
                              ))}
                          </TableCell>
                          <TableCell>
                            <FormControl
                              sx={{ m: 1, minWidth: 120 }}
                              size="small">
                              {/* <InputLabel id="demo-select-small-label">Age</InputLabel> */}
                              <Select
                                labelId="demo-select-small-label"
                                id="demo-select-small"
                                value={""} // Ensure value is controlled
                                onChange={(e) => setAssignUser(e.target.value)} // Handle value change
                                displayEmpty>
                                <MenuItem value="">None</MenuItem>
                                {users
                                  .filter(
                                    (user) =>
                                      !product.assignedTo.includes(user._id)
                                  )
                                  .map((user) => (
                                    <MenuItem
                                      value={user._id}
                                      key={user._id}
                                      onClick={() =>
                                        assignProduct(
                                          product._id,
                                          product.assignedTo,
                                          user._id
                                        )
                                      }>
                                      {user.name}
                                    </MenuItem>
                                  ))}
                              </Select>
                            </FormControl>
                          </TableCell>
                        </>
                      )}
                      <TableCell>
                        <IconButton
                          disabled={user?.role !== "admin"&& product.source === "ADMIN"}
                          color="primary"
                          onClick={() =>
                            navigate(`/products/edit/${product._id}`)
                          }>
                          <Edit />
                        </IconButton>
                        <IconButton
                          disabled={user?.role !== "admin"&& product.source === "ADMIN"}
                          color="error"
                          onClick={() => handleDelete(product._id)}>
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={totalCount}
            rowsPerPage={rowsPerPage}
            page={page - 1}
            onPageChange={(event, newPage) => setPage(newPage + 1)}
            onRowsPerPageChange={(e) =>
              setRowsPerPage(parseInt(e.target.value, 10))
            }
          />
        </Paper>
      </Container>
    </Box>
  );
}
