import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useState } from "react";
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  IconButton,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import api from "../utils/api";

const schema = yup.object({
  oldPassword: yup.string().required("Old password is required"),
  newPassword: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("New password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("newPassword"), null], "Passwords must match")
    .required("Confirm password is required"),
});

export default function UpdatePassword() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(false);

  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const onSubmit = async (data) => {
    try {
      await api.put("/users/update-password", {
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      });
      setLoading(false);
      alert("Password updated successfully!");
      navigate("/profile");
    } catch (error) {
      setLoading(false);
      alert(error.response?.data?.message || "Failed to update password");
    }
  };

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
      <Container maxWidth="sm" sx={{ marginTop: "15vh" }}>
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography variant="h5">Update Password</Typography>
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
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              fullWidth
              label="Old Password"
              type={showPassword.old ? "text" : "password"}
              {...register("oldPassword")}
              error={!!errors.oldPassword}
              helperText={errors.oldPassword?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => togglePasswordVisibility("old")}>
                      {showPassword.old ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="New Password"
              type={showPassword.new ? "text" : "password"}
              {...register("newPassword")}
              error={!!errors.newPassword}
              helperText={errors.newPassword?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => togglePasswordVisibility("new")}>
                      {showPassword.new ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Confirm Password"
              type={showPassword.confirm ? "text" : "password"}
              {...register("confirmPassword")}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => togglePasswordVisibility("confirm")}>
                      {showPassword.confirm ? (
                        <VisibilityOff />
                      ) : (
                        <Visibility />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button type="submit" variant="contained" color="primary">
              Update Password
            </Button>
          </Box>
        </form>
      </Container>
    </Box>
  );
}
