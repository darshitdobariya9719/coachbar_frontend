import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setUsers } from '../redux/userSlice';
import { useNavigate } from "react-router-dom";
import {
    Box, Button, Table, TableHead, TableRow, TableCell, TableBody, Container,
    Typography, Paper, TableContainer, TablePagination, TableSortLabel
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import api from '../utils/api';

const Users = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth.user);
    const { users } = useSelector((state) => state.user);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [sortOrder, setSortOrder] = useState('asc');
    const [totalCount, setTotalCount] = useState(0);

    const fetchUsers = async () => {
        if (user?.role === "admin") {
            const res = await api.get(`/users?page=${page + 1}&limit=${rowsPerPage}&sort=name&order=${sortOrder}`);
            dispatch(setUsers(res.data.users));
            setTotalCount(res.data.total);
        }
    };

    const handleChangePage = (event, newPage) => setPage(newPage);

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleSortRequest = () => {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    };

    useEffect(() => {
        fetchUsers();
    }, [dispatch, user, page, rowsPerPage, sortOrder]);

    return (
        <>
            <Button
                variant="outlined"
                color="primary"
                onClick={() => navigate(-1)} // Navigate back
                startIcon={<ArrowBackIcon />} // Back icon
                sx={{ ml: 2, mt: 2 }} // Add spacing
            >
                Back
            </Button>
            <Container>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: '20px' }}>
                    <Typography variant="h5">User List</Typography>
                    {user?.role === "admin" && (
                        <Button variant="contained" color="primary" onClick={() => navigate("/users/new")}>
                            Add User
                        </Button>
                    )}
                </Box>
                <Paper sx={{ width: '100%', mb: 2 }}>
                    <TableContainer>
                        <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
                            <TableHead>
                                <TableRow>
                                    <TableCell>
                                        <TableSortLabel
                                            active={true}
                                            direction={sortOrder}
                                            onClick={handleSortRequest}
                                        >
                                            Name
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Role</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user._id}>
                                        <TableCell>{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{user.role}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={totalCount}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </Paper>
            </Container>
        </>
    );
};

export default Users;