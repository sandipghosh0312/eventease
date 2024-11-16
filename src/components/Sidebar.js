import React, { useState, useEffect } from 'react';
import "./Sidebar.css";
import { Link, useNavigate } from 'react-router-dom';
import { auth, db, storage } from "../firebase";
import { getDoc, doc, addDoc, collection, setDoc } from "firebase/firestore"
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, IconButton, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { signOut } from 'firebase/auth';

function Sidebar() {
    const user = auth.currentUser;
    const [userData, setUserData] = useState([]);
    const [eventName, setEventName] = useState('');
    const [avatar, setAvatar] = useState(null);
    const [banner, setBanner] = useState(null);
    const [location, setLocation] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState("");
    const [website, setWebsite] = useState('');
    const [socialLinks, setSocialLinks] = useState([]);
    const [gallery, setGallery] = useState([]);
    const [ticketPrice, setTicketPrice] = useState(0);
    const [additionalInfo, setAdditionalInfo] = useState('');
    const [open, setOpen] = useState(false);
    const [country, setCountry] = useState("");
    const [state, setState] = useState("");
    const [city, setCity] = useState("");
    const [type, setType] = useState('');
    const [eventPublicity, setEventPublicity] = useState("");
    const navigate = useNavigate("");

    const onClose = () => {
        setOpen(false);
    };

    const openDialog = () => {
        setOpen(true);
    };

    const handleFileUpload = (e, setImage) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file); // Set the actual file instead of a URL
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let avatarURL = '';
            let bannerURL = '';

            // Upload avatar
            if (avatar) {
                const avatarRef = ref(storage, `events/avatars/${Date.now()}_${avatar.name}`);
                const avatarSnapshot = await uploadBytes(avatarRef, avatar);
                avatarURL = await getDownloadURL(avatarSnapshot.ref);
            }

            // Upload banner
            if (banner) {
                const bannerRef = ref(storage, `events/banners/${Date.now()}_${banner.name}`);
                const bannerSnapshot = await uploadBytes(bannerRef, banner);
                bannerURL = await getDownloadURL(bannerSnapshot.ref);
                console.log('Banner URL:', bannerURL); // Log the URL to verify it's correct
            }

            // Upload gallery images
            let galleryURLs = [];
            for (let i = 0; i < gallery.length; i++) {
                const imageRef = ref(storage, `events/gallery/${Date.now()}_${gallery[i].name}`);
                const imageSnapshot = await uploadBytes(imageRef, gallery[i]);
                const imageURL = await getDownloadURL(imageSnapshot.ref);
                galleryURLs.push(imageURL);
            }

            // Prepare event data
            const eventData = {
                eventName,
                avatarURL,
                bannerURL,
                location,
                date,
                time,
                description,
                website,
                socialLinks,
                galleryURLs,
                additionalInfo,
                createdAt: new Date(),
                organizerPhoto: user?.photoURL,
                organizerName: user?.displayName,
                organizerEmail: user?.email,
                organizerUid: user?.uid,
                ticketPrice,
                category,
                isSponsored: false,
                country,
                state,
                city,
                noOfAttendees: 0,
                likeCount: 0,
                commentCount: 0,
                rating: 0,
                update: "",
                type,
                eventPublicity,
                onlineLinks: []
            };

            // Add event to Firestore
            const docRef = await addDoc(collection(db, 'events'), eventData);
            const docId = docRef.id;
            await setDoc(doc(db, "organizers", user?.uid, "events-made", docId), eventData)
            onClose();
            alert('Your event has successfully been created');
            navigate(`/event/${docId}`);
        } catch (error) {
            console.error('Error uploading event: ', error);
            alert('There was an error creating the event: ' + error.message);
        }
    };

    useEffect(() => {
        const fetchUserData = async () => {
            const user = auth.currentUser;
            if (user) {
                try {
                    const docRef = doc(db, 'users', user.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setUserData(docSnap.data());
                    } else {
                        console.log('No such document!');
                    }
                } catch (error) {
                    console.error('Error fetching user data: ', error);
                }
            }
        };
        fetchUserData();
    }, []);

    const logoutUser = (e) => {
        e.preventDefault();
        signOut(auth).then(alert("User logged out successfully.")).catch((err) => alert("Error logging out: ", err.message))
    }


    return (
        <>
            {
                user && (
                    <aside className="sidebar">
                        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
                            <DialogTitle>
                                Create Event
                                <IconButton onClick={onClose} style={{ position: 'absolute', right: 16, top: 16 }}>
                                    <CloseIcon />
                                </IconButton>
                            </DialogTitle>
                            <DialogContent dividers>
                                <div className="dialog-content">
                                    <TextField
                                        required
                                        label="Event Name"
                                        value={eventName}
                                        onChange={(e) => setEventName(e.target.value)}
                                        fullWidth
                                        margin="dense"
                                    />
                                    <div className="upload-section">
                                        <label htmlFor="avatar-upload">Event Avatar</label>
                                        <input
                                            required
                                            type="file"
                                            accept="image/*"
                                            id="avatar-upload"
                                            onChange={(e) => handleFileUpload(e, setAvatar)}
                                        />
                                    </div>
                                    <div className="upload-section">
                                        <label htmlFor="banner-upload">Event Banner</label>
                                        <input
                                            required
                                            type="file"
                                            accept="image/*"
                                            id="banner-upload"
                                            onChange={(e) => handleFileUpload(e, setBanner)}
                                        />
                                    </div>
                                    <FormControl required>
                                        <InputLabel>Event Type</InputLabel>
                                        <Select
                                            value={type}
                                            onChange={(e) => setType(e.target.value)}
                                        >
                                            <MenuItem value="Offline Event">Offline Event</MenuItem>
                                            <MenuItem value="Online Event">Online Event</MenuItem>
                                            <MenuItem value="Hybrid Event">Hybrid Event</MenuItem>
                                        </Select>
                                    </FormControl>
                                    <TextField
                                        required
                                        label="Location"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        fullWidth
                                        margin="dense"
                                    />
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <TextField
                                            required
                                            label="Country"
                                            value={country}
                                            onChange={(e) => setCountry(e.target.value)}
                                            fullWidth
                                            InputLabelProps={{ shrink: true }}
                                            margin="dense"
                                        />
                                        <TextField
                                            label="State"
                                            value={state}
                                            onChange={(e) => setState(e.target.value)}
                                            fullWidth
                                            InputLabelProps={{ shrink: true }}
                                            margin="dense"
                                        />
                                        <TextField
                                            required
                                            label="City"
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                            fullWidth
                                            InputLabelProps={{ shrink: true }}
                                            margin="dense"
                                        />
                                    </div>
                                    <TextField
                                        required
                                        label="Date"
                                        type='date'
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                        margin="dense"
                                    />
                                    <TextField
                                        required
                                        label="Time"
                                        type="time"
                                        value={time}
                                        onChange={(e) => setTime(e.target.value)}
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                        margin="dense"
                                    />
                                    <TextField
                                        label="Description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        fullWidth
                                        multiline
                                        rows={4}
                                        margin="dense"
                                    />
                                    <FormControl required>
                                        <InputLabel>Category</InputLabel>
                                        <Select
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                        >
                                            <MenuItem value="Conferences">Conferences</MenuItem>
                                            <MenuItem value="Workshops">Workshops</MenuItem>
                                            <MenuItem value="Tech">Tech</MenuItem>
                                            <MenuItem value="Concert Music">Concert Music</MenuItem>
                                            <MenuItem value="Seminars">Seminars</MenuItem>
                                            <MenuItem value="Festival">Festival</MenuItem>
                                            <MenuItem value="Exhibition">Exhibition</MenuItem>
                                            <MenuItem value="Sports">Sports</MenuItem>
                                            <MenuItem value="Galas">Galas</MenuItem>
                                            <MenuItem value="Auction">Auction</MenuItem>
                                            <MenuItem value="Career Fair">Career Fair</MenuItem>
                                            <MenuItem value="Webniar">Webniar</MenuItem>
                                            <MenuItem value="Others">Others</MenuItem>
                                        </Select>
                                    </FormControl>
                                    <TextField
                                        label="Website"
                                        type='url'
                                        value={website}
                                        onChange={(e) => setWebsite(e.target.value)}
                                        fullWidth
                                        margin="dense"
                                    />
                                    {/* Social Links */}
                                    <TextField
                                        label="Social Media Links (Comma separated)"
                                        value={socialLinks.join(', ')}
                                        onChange={(e) => setSocialLinks(e.target.value.split(', '))}
                                        fullWidth
                                        margin="dense"
                                    />
                                    {/* Gallery Images */}
                                    <div className="upload-section">
                                        <label htmlFor="gallery-upload">Gallery Images</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            id="gallery-upload"
                                            multiple
                                            onChange={(e) => setGallery(Array.from(e.target.files))}
                                        />
                                    </div>
                                    <TextField
                                        label="Ticket Price"
                                        type="number"
                                        value={ticketPrice}
                                        onChange={(e) => setTicketPrice(e.target.value)}
                                    />
                                    <FormControl required>
                                        <InputLabel>Is this a public event?</InputLabel>
                                        <Select
                                            value={eventPublicity}
                                            onChange={(e) => setEventPublicity(e.target.value)}
                                        >
                                            <MenuItem value="yes">Yes</MenuItem>
                                            <MenuItem value="no">No</MenuItem>
                                        </Select>
                                    </FormControl>
                                    <TextField
                                        label="Additional Information"
                                        value={additionalInfo}
                                        onChange={(e) => setAdditionalInfo(e.target.value)}
                                        fullWidth
                                        multiline
                                        rows={4}
                                        margin="dense"
                                    />
                                </div>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={onClose} color="secondary">Cancel</Button>
                                <Button onClick={handleSubmit} color="primary" variant="contained">Submit</Button>
                            </DialogActions>
                        </Dialog>
                        <div className="sidebar__top">
                            <Link to="/home">Dashboard</Link>
                            {
                                userData.organizer && (
                                    <a onClick={openDialog} className="sidebar__button">Create New Event</a>
                                )
                            }


                            <Link to="/my-events">Manage My Events</Link>
                        </div>

                        <div className="sidebar__middle">
                            <h3>Categories</h3>
                            <Link to="/category/conferences">Conferences</Link>
                            <Link to="/category/workshops">Workshops</Link>
                            <Link to="/category/concerts">Concerts</Link>
                            <Link to="/category/tech">Tech</Link>
                            <Link to="/category/music">Music</Link>
                        </div>

                        <div className="sidebar__bottom">
                            <a href="/profile-settings">Profile Settings</a>
                            <a href="/account-settings">Account Settings</a>
                            <a href="/help-center">Help Center</a>
                            <a href="/feedback">Feedback</a>
                            <a href="/logout" onClick={logoutUser} className="sidebar__logout">Logout</a>
                        </div>

                        <div className="sidebar__social">
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a>
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a>
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
                        </div>
                    </aside>
                )
            }
        </>


    )
}

export default Sidebar