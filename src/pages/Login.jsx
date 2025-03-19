import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/authSlice";
import { Box, TextField, Button, Container, Typography } from "@mui/material";
import api from "../utils/api";

const schema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().required("Password is required").min(6, "Password must be at least 6 characters"),
});

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: yupResolver(schema) });
  const dispatch = useDispatch();

  const onSubmit = async (data) => {
    try {
      const res = await api.post("/users/login", data);
      dispatch(setUser(res.data));
      // window.location.href = "/dashboard";
    } catch (err) {
      console.error(err);
      alert(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ marginTop: "30vh" }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: '20px' }}>
        <Typography variant="h5">Login</Typography>
      </Box>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "end" }}>
          <TextField fullWidth label="Email" {...register("email")} error={!!errors.email} helperText={errors.email?.message} />
          <TextField fullWidth label="Password" type="password" {...register("password")} error={!!errors.password} helperText={errors.password?.message} />
          <Button type="submit" variant="contained" color="primary" sx={{ width: "30px" }}>Login</Button>
        </Box>
      </form>
    </Container>
  );
}
