import React, { useEffect, useState } from 'react';
import "./ProfileSettings.css";
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import SaveIcon from '@mui/icons-material/Save';
import UploadIcon from '@mui/icons-material/Upload';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import LinearProgress from '@mui/material/LinearProgress';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updateEmail, updatePassword, updateProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { auth, db, storage } from "../firebase";

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function ProfileSettings() {
    const user = auth.currentUser;
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        dateOfBirth: '',
        city: '',
        state: '',
        country: '',
        photoURL: ''
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isFormChanged, setIsFormChanged] = useState(false);
    const [avatarURL, setAvatarURL] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            const userDoc = doc(db, 'users', user.uid);
            const userSnapshot = await getDoc(userDoc);
            if (userSnapshot.exists()) {
                const data = userSnapshot.data();
                setProfileData({
                    name: data.name || '',
                    email: user.email || '',
                    phoneNumber: data.phoneNumber || '',
                    dateOfBirth: data.dateOfBirth || '',
                    city: data.location?.city || '',
                    state: data.location?.state || '',
                    country: data.location?.country || '',
                    photoURL: user.photoURL || ''
                });
            }
        };
        fetchData();
    }, [db, user]);

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
        setAvatarURL(URL.createObjectURL(event.target.files[0]))
        setIsFormChanged(true);
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setUploading(true);
        try {
            if (selectedFile) {
                // Upload image to Firebase Storage
                const storageRef = ref(storage, `avatars/${user.uid}`);
                await uploadBytes(storageRef, selectedFile);
                const newPhotoURL = await getDownloadURL(storageRef);

                // Update Auth profile photo
                await updateProfile(user, { photoURL: newPhotoURL });

                // Update Firestore user document
                const userDoc = doc(db, 'users', user.uid);
                await updateDoc(userDoc, { photoURL: newPhotoURL });
            }

            // Update Firestore user data
            const userDoc = doc(db, 'users', user.uid);
            await updateDoc(userDoc, {
                name: profileData.name,
                phoneNumber: profileData.phoneNumber,
                dateOfBirth: profileData.dateOfBirth,
                location: {
                    city: profileData.city,
                    state: profileData.state,
                    country: profileData.country
                }
            });

            // Optionally update email and password
            if (profileData.email !== user.email) {
                await updateEmail(user, profileData.email);
            }
            if (profileData.password) {
                await updatePassword(user, profileData.password);
            }

            setSuccessMessage('Profile updated successfully!');
        } catch (error) {
            setErrorMessage(error.message);
        } finally {
            setUploading(false);
            setDialogOpen(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData({ ...profileData, [name]: value });
        setIsFormChanged(true);
    };

    const handleSnackbarClose = () => {
        setSuccessMessage('');
        setErrorMessage('');
    };

    return (
        <>
            <Header />
            <div className="splitter">
                <Sidebar />
                <div className="profile-settings">
                    <div className="profile-header">
                        <div className="profile-banner"></div>
                        <div className="profile-picture">
                            <Avatar 
                                src={user?.photoURL} 
                                alt="Profile Picture" 
                                sx={{ width: 100, height: 100 }} 
                                onClick={() => setDialogOpen(true)} 
                                style={{ cursor: 'pointer' }}
                            />
                        </div>
                    </div>
                    <div className="profile-info">
                        <h2>Profile Settings</h2>
                        <form className="profile-form" onSubmit={handleProfileUpdate}>
                            <TextField
                                label="Full Name"
                                variant="outlined"
                                fullWidth
                                margin="normal"
                                name="name"
                                value={profileData.name}
                                onChange={handleInputChange}
                            />
                            <TextField
                                label="Email Address"
                                variant="outlined"
                                fullWidth
                                margin="normal"
                                name="email"
                                value={profileData.email}
                                onChange={handleInputChange}
                            />
                            <TextField
                                label="Phone Number"
                                variant="outlined"
                                fullWidth
                                margin="normal"
                                name="phoneNumber"
                                value={profileData.phoneNumber}
                                onChange={handleInputChange}
                            />
                            <TextField
                                label="Date of Birth"
                                variant="outlined"
                                fullWidth
                                margin="normal"
                                name="dateOfBirth"
                                value={profileData.dateOfBirth}
                                onChange={handleInputChange}
                            />
                            <TextField
                                label="City"
                                variant="outlined"
                                fullWidth
                                margin="normal"
                                name="city"
                                value={profileData.city}
                                onChange={handleInputChange}
                            />
                            <TextField
                                label="State"
                                variant="outlined"
                                fullWidth
                                margin="normal"
                                name="state"
                                value={profileData.state}
                                onChange={handleInputChange}
                            />
                            <TextField
                                label="Country"
                                variant="outlined"
                                fullWidth
                                margin="normal"
                                name="country"
                                value={profileData.country}
                                onChange={handleInputChange}
                            />
                            {/* Other input fields */}
                            <Button 
                                variant="contained" 
                                startIcon={<SaveIcon />} 
                                type="submit" 
                                className="save-button"
                                disabled={!isFormChanged}
                            >
                                Save Changes
                            </Button>
                        </form>
                    </div>
                </div>
            </div>

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                <DialogTitle>Change Profile Picture</DialogTitle>
                <DialogContent>
                    <Avatar
                        src={avatarURL}
                        alt="Profile Picture"
                        sx={{
                            width: 200, 
                            height: 200, 
                            borderRadius: '50%',
                            border: '5px solid',
                            borderColor: 'neon', // Change to CSS neon effect
                            animation: 'neonEffect 1.5s infinite'
                        }}
                    />
                    <Button variant="contained" component="label" startIcon={<UploadIcon />}>
                        Choose File
                        <input type="file" hidden onChange={handleFileChange} accept="image/png, image/jpeg" />
                    </Button>
                    {uploading && <LinearProgress />}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleProfileUpdate} disabled={uploading}>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={!!successMessage} autoHideDuration={6000} onClose={handleSnackbarClose}>
                <Alert onClose={handleSnackbarClose} severity="success">{successMessage}</Alert>
            </Snackbar>
            <Snackbar open={!!errorMessage} autoHideDuration={6000} onClose={handleSnackbarClose}>
                <Alert onClose={handleSnackbarClose} severity="error">{errorMessage}</Alert>
            </Snackbar>
        </>
    );
}

export default ProfileSettings;
