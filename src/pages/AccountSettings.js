import React, { useState, useEffect } from 'react';
import "./AccountSettings.css";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import "./AccountSettings.css";
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { auth, db } from "../firebase";
import { EmailAuthProvider, updatePassword, reauthenticateWithCredential, deleteUser } from 'firebase/auth/web-extension';
import { Dialog } from "@mui/material";
import { doc, deleteDoc } from 'firebase/firestore';


function AccountSettings() {
    const user = auth.currentUser;
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [openDialog, setOpenDialog] = useState(false);

    useEffect(() => {
        setEmail(user?.email);
    }, [user?.email])

    const handleUpdatePAssword = (e) => {
        e.preventDefault();
        const cred = EmailAuthProvider.credential(user?.email, password);
        reauthenticateWithCredential(user, cred).then(() => {
            if (newPassword === confirmNewPassword)
                updatePassword(user, newPassword).then(() => {
                    alert("Your Password has been updated successfully");
                    setPassword("");
                    setNewPassword("");
                    setConfirmNewPassword("");
                })
            else
                alert("Your new password does not match with your confirmed password");
        }).catch((error) => {
            alert("Error updating password: ", error.message, ": ", error.code);
        })

    }

    const openUpDialog = () => {
        setOpenDialog(true);
    }

    const closeDialog = () => {
        setOpenDialog(false);
    }

    const handleDeleteProfile = async (e) => {
        e.preventDefault();
        const docRef = doc(db, "users", user?.uid);
        await deleteDoc(docRef);
        await deleteUser(user).then(() => {
            alert("User has been deleted.");
            console.log("User has been deleted from database");
        }).catch((error) => {
            alert(error.message)
        })
    }


    return (
        <>
            <Header />
            <div className="splitter">
                <Sidebar />
                <div className="account-settings">
                    <div className="account-header">
                        <h2>Account Settings</h2>
                        <p>Manage your account preferences and security settings.</p>
                    </div>
                    <div className="account-content">
                        <div className="settings-section">
                            <h3>Login Details</h3>
                            <TextField label="Email Address" variant="outlined" fullWidth margin="normal" value={email} onChange={(e) => setEmail(e.target.value)} disabled />
                            <TextField label="Current Password" type="password" variant="outlined" fullWidth margin="normal" value={password} onChange={(e) => setPassword(e.target.value)} />
                            <TextField label="New Password" type="password" variant="outlined" fullWidth margin="normal" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                            <TextField label="Confirm New Password" type="password" variant="outlined" fullWidth margin="normal" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} />
                            <Button variant="contained" startIcon={<SaveIcon />} onClick={handleUpdatePAssword} className="save-button">
                                Save Changes
                            </Button>
                        </div>

                        <div className="settings-section">
                            <Dialog open={openDialog} onClose={closeDialog}>
                                <div className="dialog">
                                    <div className="dialogHeader">
                                        <h1>Confirm Account Deletion</h1>
                                        <hr />
                                    </div>
                                    <div className="dialogBody">
                                        <p>Remember, this process cannot be undone! Are you sure you want to delete your EventEase account?</p>
                                    </div>
                                    <button variant="outlined" startIcon={<DeleteIcon />} className="delete-button dialogButton" onClick={handleDeleteProfile}>Delete my Account</button>

                                </div>
                            </Dialog>
                            <h3>Danger Zone</h3>
                            <p>If you no longer want to use your account, you can delete it here. Please note that this action is irreversible.</p>
                            <Button variant="outlined" onClick={openUpDialog} startIcon={<DeleteIcon />} className="delete-button">
                                Delete Account
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default AccountSettings;
