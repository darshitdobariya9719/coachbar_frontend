import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  CircularProgress,
} from "@mui/material";
import api from "../utils/api";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { setUsers } from "../redux/userSlice";

// Validation Schema
const schema = yup.object({
  name: yup.string().trim().required("Product name is required"),
  sku: yup.string().trim().required("SKU is required"),
  category: yup.string().trim().required("Category is required"),
  source: yup.string().oneOf(["ADMIN", "USER"]).optional(),
  assignedTo: yup.array().optional(),
  logo:  yup
  .mixed()
  .test("required", "Product image is required", (value) => {
    // console.log(value.length,'value: ', value);
    return value && value.name; // Ensure a file is selected
  }), // Image validation
});

export default function AddProduct() {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { users } = useSelector((state) => state.user);
  
  const [categories, setCategories] = useState([]);
  const [categoryInput, setCategoryInput] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  // Handle file selection and preview
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setValue("logo", file); // Manually set the file value
      trigger("logo"); // Trigger validation
    }
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("sku", data.sku.trim());
      formData.append("category", data.category);
      formData.append("source", user.role === "admin" ? "ADMIN" : "USER");
      formData.append(
        "assignedTo",
        user.role === "admin"
          ? JSON.stringify(data.assignedTo)
          : JSON.stringify([user._id])
      );
      formData.append("logo", selectedFile); // Attach file

      await api.post("/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setLoading(false);
      alert("Product added successfully!");
      window.location.href = "/products";
    } catch (error) {
      setLoading(false);
      alert(error.response?.data?.message || "Failed to add product");
    }
  };

  useEffect(() => {
    api
      .get("/products/categories")
      .then((res) => setCategories(res.data.categories));
  }, []);

  useEffect(() => {
    if(users.length < 1) {
      if (user?.role === "admin") {
        api.get("/users").then((res) => dispatch(setUsers(res.data.users)));
      }
    }
  }, []);

  return (
    <Box sx={{ mt: 8, minHeight: "100vh" }}>
      <Button
        variant="outlined"
        color="primary"
        onClick={() => navigate(-1)} // Navigate back
        startIcon={<ArrowBackIcon />} // Back icon
        sx={{ ml: 2, mt: 2 }} // Add spacing
      >
        Back
      </Button>
      <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            my: "20px",
          }}>
          <Typography variant="h5">Add Product</Typography>
        </Box>

        {loading && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(255, 255, 255, 0.7)", // Semi-transparent background
              zIndex: 10,
            }}>
            <CircularProgress />
          </Box>
        )}
        <form
          onSubmit={handleSubmit((data) => {
            setLoading(true);
            onSubmit(data);
          })}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              gap={2}
              mt={2}>
              {/* Image Preview */}
              {preview && (
                <Box
                  mt={2}
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  border="1px solid #ccc"
                  borderRadius="8px"
                  padding="10px"
                  width="100%"
                  maxWidth="300px">
                  <img
                    src={preview}
                    alt="Preview"
                    style={{
                      width: "100%",
                      maxHeight: "200px",
                      objectFit: "contain",
                      borderRadius: "6px",
                    }}
                  />
                </Box>
              )}
              {/* Upload Image */}
              <input
                type="file"
                accept="image/*"
                {...register("logo")}
                onChange={handleFileChange}
                style={{ display: "none" }}
                id="logo-upload"
              />
              <label htmlFor="logo-upload">
                <Button
                  variant="contained"
                  component="span"
                  color="primary"
                  sx={{
                    textTransform: "none",
                    fontSize: "16px",
                    padding: "8px 20px",
                  }}>
                  Upload Image
                </Button>
              </label>

              {/* Error Message */}
              {errors.logo && (
                <Typography color="error">{errors.logo.message}</Typography>
              )}
            </Box>
            <TextField
              label="Product Name"
              fullWidth
              {...register("name")}
              error={!!errors.name}
              helperText={errors.name?.message}
            />
            <TextField
              label="SKU"
              fullWidth
              {...register("sku")}
              error={!!errors.sku}
              helperText={errors.sku?.message}
            />

            {/* Category with Suggestions */}
            <Autocomplete
              freeSolo
              options={categories}
              value={categoryInput}
              onInputChange={(_, newValue) => setCategoryInput(newValue)}
              onChange={(_, newValue) => setValue("category", newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Category"
                  {...register("category")}
                  error={!!errors.category}
                  helperText={errors.category?.message}
                />
              )}
            />

            {/* Assign to Users - Only for Admin */}
            {user.role === "admin" && (
              <FormControl fullWidth>
                <InputLabel>Assign To</InputLabel>
                <Select {...register("assignedTo")} multiple defaultValue={[]}>
                  {users.map((u) => (
                    <MenuItem key={u._id} value={u._id}>
                      {u.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ width: "100px" }}>
              Add
            </Button>
          </Box>
        </form>
      </Container>
    </Box>
  );
}
