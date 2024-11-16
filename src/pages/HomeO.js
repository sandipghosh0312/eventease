import React, { useState, useEffect } from 'react';
import "./HomeO.css";
import EventIcon from '@mui/icons-material/Event';
import ThumbUpIcon from "@mui/icons-material/ThumbUp"
import ChatIcon from "@mui/icons-material/Chat";
import StarIcon from "@mui/icons-material/Star";
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import CampaignIcon from '@mui/icons-material/Campaign';
import InsightsIcon from '@mui/icons-material/Insights';
import AdUnitsIcon from '@mui/icons-material/AdUnits';
import { auth, db, storage } from "../firebase";
import { collection, query, where, getDocs, getDoc, doc, setDoc, deleteDoc, updateDoc, addDoc } from 'firebase/firestore';
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";

function HomeO() {
    const [eventsAttended, setEventsAttended] = useState(0);
    const [eventsLiked, setEventsLiked] = useState(0);
    const [commentsPosted, setCommentsPosted] = useState(0);
    const [meanRating, setMeanRating] = useState(0);
    const [revenueByMonth, setRevenueByMonth] = useState(Array(12).fill(0))
    const [chartData, setChartData] = useState({ labels: [], data: [] });
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        recipients: 'all',
    });
    const user = auth?.currentUser;
    const [registrations, setRegistrations] = useState([]);
    const eventsCollection = collection(db, 'events');
    const [name, setName] = useState('');
    const [profilePic, setProfilePic] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState('');
    const [role, setRole] = useState("");
    const [teamMembers, setTeamMembers] = useState([]);
    const [selectedMemberId, setSelectedMemberId] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [taskName, setTaskName] = useState('');
    const [assignedTo, setAssignedTo] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [tasks, setTasks] = useState([]);

    const openModal = () => setIsModalOpen(true);

    const closeModal = () => {
        setIsModalOpen(false);
        setName('');
        setProfilePic(null);
        setError('');
        setUploadProgress(0);
    };

    const handleProfilePicChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePic(file);
        }
    };

    // Handle form submission
    const handleSubmitData = async (event) => {
        event.preventDefault();
        if (!name || !profilePic) {
            setError('Please provide both name and profile picture.');
            return;
        }

        setUploading(true);
        setError('');

        try {
            // Step 1: Upload profile picture to Firebase Storage
            const storageRef = ref(storage, `profile-pictures/${profilePic.name}`);
            const uploadTask = uploadBytesResumable(storageRef, profilePic);

            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    // Calculate upload progress
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setUploadProgress(progress);
                },
                (error) => {
                    setUploading(false);
                    setError(error.message);
                },
                async () => {
                    // Step 2: Get download URL after upload completes
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

                    // Step 3: Save member data to Firestore
                    const user = auth.currentUser;
                    if (!user) {
                        setError('User is not authenticated.');
                        setUploading(false);
                        return;
                    }

                    const userRef = doc(db, 'organizers', user.uid); // Reference to user's document
                    const teamMembersRef = collection(userRef, 'team-members'); // Reference to 'team-members' collection

                    await setDoc(doc(teamMembersRef), {
                        name,
                        profilePicURL: downloadURL,
                        createdAt: new Date(),
                        role: '',
                    });

                    console.log('New Member added:', { name, profilePicURL: downloadURL });

                    // Reset state and close modal
                    setName('');
                    setProfilePic(null);
                    setUploading(false);
                    setUploadProgress(0);
                    closeModal();
                }
            );
        } catch (error) {
            setUploading(false);
            setError('Failed to upload member: ' + error.message);
        }
    };

    // Fetch team members from Firestore
    const fetchTeamMembers = async () => {
        try {
            const user = auth.currentUser;
            if (!user) {
                console.error('User not authenticated');
                return;
            }

            const userRef = doc(db, 'organizers', user.uid);
            const teamMembersRef = collection(userRef, 'team-members');
            const snapshot = await getDocs(teamMembersRef);

            const membersData = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            setTeamMembers(membersData);
        } catch (error) {
            console.error('Error fetching team members:', error);
        }
    };

    useEffect(() => {
        fetchTeamMembers();
    }, []);

    const openEditModal = (memberId) => {
        setSelectedMemberId(memberId);
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setSelectedMemberId(null);
        setIsEditModalOpen(false);
    };

    const handleUpdateTeamMember = async (e) => {
        e.preventDefault();

        if (!name || !role) {
            setError('Please provide both name and role.');
            return;
        }

        setUploading(true);
        setError('');

        try {
            if (name && !role) {
                // Update the member's data in Firestore
                const userRef = doc(db, 'organizers', user?.uid, 'team-members', selectedMemberId);
                await updateDoc(userRef, {
                    name,
                });
            } else if (role && !name) {
                // Update the member's data in Firestore
                const userRef = doc(db, 'organizers', user?.uid, 'team-members', selectedMemberId);
                await updateDoc(userRef, {
                    role,
                });
            } else {
                // Update the member's data in Firestore
                const userRef = doc(db, 'organizers', user?.uid, 'team-members', selectedMemberId);
                await updateDoc(userRef, {
                    name,
                    role,
                });
            }

            // Reset states and close modal
            setUploading(false);
            setUploadProgress(0);
            closeEditModal();
        } catch (error) {
            setUploading(false);
            setError('Error updating member: ' + error.message);
        }
    };

    const handleRemoveMember = async (memberId) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this team member?');
        if (confirmDelete) {
            try {
                // Reference to the team member's document
                const memberRef = doc(db, 'organizers', user?.uid, 'team-members', memberId);

                // Delete the document
                await deleteDoc(memberRef);

                // Update the state by filtering out the deleted member
                setTeamMembers((prevMembers) => prevMembers.filter((member) => member.id !== memberId));

                alert('Team member deleted successfully.');
            } catch (error) {
                console.error('Error deleting team member:', error);
                alert('Failed to delete the team member. Please try again.');
            }
        }
    };



    useEffect(() => {
        // Fetch pending registrations when the component mounts
        const fetchRegistrations = async () => {
            try {
                const querySnapshot = await getDocs(eventsCollection);
                const fetchedRegistrations = [];

                // Loop over each event document
                for (const eventDoc of querySnapshot.docs) {
                    if (eventDoc.data().organizerUid === user?.uid) {
                        const eventname = eventDoc.data().eventName;
                        const pendingRegistrationsRef = collection(eventDoc.ref, 'pending-registration');

                        // Fetch documents within "pending-registrations"
                        const pendingSnapshot = await getDocs(pendingRegistrationsRef);
                        pendingSnapshot.forEach(doc => {
                            fetchedRegistrations.push({
                                id: doc.id,
                                ...doc.data(),
                                eventId: eventDoc.id,
                                eventname: eventname
                            });
                        });
                    }
                }

                setRegistrations(fetchedRegistrations);
            } catch (error) {
                console.error("Error fetching registrations:", error);
            }
        };

        fetchRegistrations();
    }, [user?.uid]);

    const handleApprove = async (registration, e) => {
        e.preventDefault();
        try {
            // Add to registered users
            const registeredUsersRef = doc(db, 'events', registration.eventId, 'registered-users', registration.id);
            await setDoc(registeredUsersRef, {
                displayName: registration.displayName,
                phone: registration.phone,
                photoURL: registration.photoURL,
                location: registration.location,
                uid: registration.uid,
                email: registration.email,
            });
        } catch (error) {
            console.error("Error registering the user:", error);
            return;
        }

        try {
            // Remove from pending registrations
            const pendingRegistrationRef = doc(db, 'events', registration.eventId, 'pending-registration', registration.id);
            await deleteDoc(pendingRegistrationRef).then(() => {
                alert("user deleted")
            }).catch((e) => {
                alert(e.message())
            })


            // Update the UI
            setRegistrations(prev => prev.filter(reg => reg.id !== registration.id));
        } catch (error) {
            console.error("Error in deleting the user from pending user's list", error);
        }
    };

    const handleReject = async (registrationId, eventId) => {
        try {
            const pendingRegistrationRef = doc(db, 'events', eventId, 'pending-registration', registrationId);
            await deleteDoc(pendingRegistrationRef);

            // Update the UI
            setRegistrations(prev => prev.filter(reg => reg.id !== registrationId));
        } catch (error) {
            console.error("Error rejecting registration:", error);
        }
    };

    const handleAssignTask = async (e) => {
        e.preventDefault();
        if (!taskName || !assignedTo || !dueDate) {
            setErrorMessage('Please fill in all fields.');
            return;
        }

        setLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            const taskRef = collection(db, 'organizers', user?.uid, 'tasks');
            await addDoc(taskRef, {
                taskName,
                assignedTo,
                dueDate,
                createdAt: new Date().toISOString(),
                progress: 0,
            });

            setSuccessMessage('Task assigned successfully!');
            setTaskName('');
            setAssignedTo('');
            setDueDate('');
        } catch (error) {
            console.error('Error assigning task:', error);
            setErrorMessage('Failed to assign task. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch tasks from Firestore
    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const tasksRef = collection(db, 'organizers', user?.uid, 'tasks');
                const snapshot = await getDocs(tasksRef);
                const taskList = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setTasks(taskList);
            } catch (error) {
                console.error('Error fetching tasks:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, []);


    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch organizer's events
                const eventsQuery = query(collection(db, 'events'), where('organizerUid', '==', auth.currentUser?.uid));
                const eventsSnapshot = await getDocs(eventsQuery);
                let totalEvents = 0;
                let totalLikes = 0;
                let totalComments = 0;
                let totalRatings = 0;
                let ratingCount = 0;

                for (const eventDoc of eventsSnapshot.docs) {
                    const eventData = eventDoc.data();
                    totalEvents++;
                    totalLikes += eventData.likeCount || 0;
                    totalComments += eventData.commentCount || 0;

                    // Fetch ratings for each event
                    const ratingsRef = collection(eventDoc.ref, 'ratings');
                    const ratingsSnapshot = await getDocs(ratingsRef);

                    ratingsSnapshot.forEach((ratingDoc) => {
                        const ratingData = ratingDoc.data();
                        totalRatings += ratingData.rating || 0;
                        ratingCount++;
                    });
                }

                setEventsAttended(totalEvents);
                setEventsLiked(totalLikes);
                setCommentsPosted(totalComments);
                setMeanRating(ratingCount > 0 ? (totalRatings / ratingCount).toFixed(2) : 0);
            } catch (error) {
                console.error('Error fetching attendee statistics:', error);
            }
        };

        fetchData();
    }, []);


    useEffect(() => {
        const getRevenueData = async (organizerId, year) => {
            try {
                const revenueRef = doc(db, "organizers", organizerId, "revenue", year.toString());
                const revenueDoc = await getDoc(revenueRef);

                if (revenueDoc.exists()) {
                    const revenueData = revenueDoc.data();
                    const updatedRevenue = [...revenueByMonth];

                    // Loop through each month field in the document
                    Object.keys(revenueData).forEach(month => {
                        const monthIndex = new Date(`${month} 1`).getMonth(); // Convert month name to index
                        updatedRevenue[monthIndex] = revenueData[month] || 0; // Set revenue for each month
                    });

                    setRevenueByMonth(updatedRevenue); // Update the state with new data
                } else {
                    console.log("No revenue data found for the specified year.");
                }
            } catch (error) {
                console.error("Error fetching revenue data:", error);
            }
        };

        const currentYear = new Date().getFullYear();
        getRevenueData(user?.uid, currentYear)
    }, [user?.uid])

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const eventsCollectionRef = collection(db, 'organizers', user?.uid, 'events-made');
                const querySnapshot = await getDocs(eventsCollectionRef);

                const labels = [];
                const data = [];

                querySnapshot.forEach((doc) => {
                    const eventData = doc.data();
                    const eventName = eventData?.eventName;
                    labels.push(eventName);
                    data.push(eventData?.noOfAttendees);
                });

                setChartData({ labels, data });
            } catch (error) {
                console.error("Error fetching events:", error);
            }
        };

        fetchEvents();
    }, [user?.uid]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { title, content, recipients } = formData;

        let eventId;
        if (recipients !== 'all') {
            const selectedEventIndex = chartData.labels.indexOf(recipients.replace("'s attendees", ""));
            if (selectedEventIndex >= 0) {
                eventId = chartData.data[selectedEventIndex]; // Assuming data holds event IDs
            }
        }

        // Fetch registered users' UIDs
        let uids = [];
        if (eventId) {
            const registeredUsersRef = collection(db, 'events', eventId, 'registered-users');
            const userSnapshot = await getDocs(registeredUsersRef);
            userSnapshot.forEach((userDoc) => {
                uids.push(userDoc.data().uid);
            });
        } else {
            // Fetch all UIDs if 'all' is selected
            const eventsSnapshot = await getDocs(collection(db, 'organizers', user?.uid, 'events-made'));
            for (const doc of eventsSnapshot.docs) {
                const registeredUsersRef = collection(db, 'events', doc.id, 'registered-users');
                const userSnapshot = await getDocs(registeredUsersRef);
                userSnapshot.forEach((userDoc) => {
                    uids.push(userDoc.data().uid);
                });
            }
        }

        // Prepare notification details
        const sender = `${user?.displayName} - An eventease organizer`;
        const subject = title;
        const message = content;
        const displayPicture = user?.photoURL

        // Send notifications to each user
        const batch = db.batch();
        uids.forEach(uid => {
            const notificationRef = collection(doc(db, "users", uid), "notifications");
            const notificationId = Date.now();
            const notificationData = {
                sender,
                subject,
                message,
                displayPicture,
                createdAt: new Date()
            };

            // Create a new document in the notifications subcollection
            const newNotificationRef = doc(notificationRef, notificationId.toString());
            batch.set(newNotificationRef, notificationData);
        });

        try {
            await batch.commit();
            alert(`Notification sent to: ${recipients.replace("'s attendees", "")}`);
            setFormData({ title: "", content: "" })

        } catch (error) {
            console.error("Error sending notifications: ", error);
            alert("Failed to send notifications.");
        }
    };




    const revenueData = {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        datasets: [
            {
                label: 'Revenue',
                data: revenueByMonth,
                backgroundColor: '#4A90E2', // Theme Blue
                borderRadius: 5,
            },
        ],
    };

    const popularityData = {
        labels: chartData.labels,
        datasets: [
            {
                label: 'Popularity',
                data: chartData.data,
                backgroundColor: '#F5A623', // Theme Orange
                borderRadius: 5,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
        },
        scales: {
            x: {
                beginAtZero: true,
            },
            y: {
                beginAtZero: true,
            },
        },
    };

    return (
        <div className="homeO">

            {
                isEditModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h2>Edit Team Member</h2>
                            <form onSubmit={handleUpdateTeamMember}>
                                <div className="form-group">
                                    <label htmlFor="name">Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        placeholder="Enter member's name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="role">Role</label>
                                    <input
                                        type="text"
                                        id="role"
                                        placeholder="Enter member's role"
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                    />
                                </div>

                                {error && <p style={{ color: 'red' }}>{error}</p>}

                                <div className="form-buttons">
                                    <button type="button" onClick={closeEditModal}>Close</button>
                                    <button type="submit" disabled={uploading}>
                                        {uploading ? 'Uploading...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }


            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Add New Member</h2>
                        <form onSubmit={handleSubmitData}>
                            <div className="form-group">
                                <label htmlFor="name">Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    placeholder="Enter member's name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="profilePic">Profile Picture</label>
                                <input
                                    type="file"
                                    id="profilePic"
                                    accept="image/*"
                                    onChange={handleProfilePicChange}
                                />
                                {profilePic && (
                                    <div className="profile-pic-preview">
                                        <img src={URL.createObjectURL(profilePic)} alt="Profile Preview" width="100" />
                                    </div>
                                )}
                            </div>

                            {uploading && (
                                <div className="progress-bar-container">
                                    <div
                                        className="progress-bar"
                                        style={{ width: `${uploadProgress}%` }}
                                    ></div>
                                    <p>{Math.round(uploadProgress)}% uploaded</p>
                                </div>
                            )}

                            {error && <p style={{ color: 'red' }}>{error}</p>}

                            <div className="form-buttons">
                                <button type="button" onClick={closeModal}>Close</button>
                                <button type="submit" disabled={uploading}>
                                    {uploading ? 'Uploading...' : 'Add Member'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <div className="greeting-banner">
                <h1>{`Welcome back, ${auth.currentUser?.displayName}!`}</h1>
                <p>It really feels good to see you here again.</p>
            </div>
            <div className="homeO__contents">
                <div className="attendee-stats">
                    <h2>Attendee Statistics</h2>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <EventIcon className="stat-icon" />
                            <div className="stat-info">
                                <h3>Events Attended</h3>
                                <p>{eventsAttended}</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <ThumbUpIcon className="stat-icon" />
                            <div className="stat-info">
                                <h3>Events Liked</h3>
                                <p>{eventsLiked}</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <ChatIcon className="stat-icon" />
                            <div className="stat-info">
                                <h3>Comments Posted</h3>
                                <p>{commentsPosted}</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <StarIcon className="stat-icon" />
                            <div className="stat-info">
                                <h3>Top Rated Events</h3>
                                <p>{meanRating}</p>
                            </div>
                        </div>
                    </div>

                </div>
                <div className="reports">
                    <div className="revenue-report">
                        <h2>Revenue Reports</h2>
                        <Bar data={revenueData} options={options} />
                    </div>
                    <div className="popularity-report">
                        <h2>Event Popularity</h2>
                        <Bar data={popularityData} options={options} />
                    </div>
                </div>

            </div>
            <div className="manage-registrations">
                <h2>Manage Registrations</h2>
                <div className="registrations-table">
                    <div className="table-header">
                        <span>Attendee Name</span>
                        <span>Email</span>
                        <span>Event</span>
                        <span>Status</span>
                        <span>Actions</span>
                    </div>
                    {registrations.map((registration) => (
                        <div key={registration.id} className="table-row">
                            <span>{registration.displayName}</span>
                            <span>{registration.email}</span>
                            <span>{registration.eventname || 'Event Name'}</span>
                            <span>Pending</span>
                            <div className="actions">
                                <button className="approve" onClick={() => handleApprove(registration)}>Approve</button>
                                <button className="reject" onClick={() => handleReject(registration.id, registration.eventId)}>Reject</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="check-ins">
                <h2>Check-Ins</h2>
                <div className="check-in-card">
                    <h3>John Doe</h3>
                    <p>Event: Web Dev Workshop</p>
                    <p>Checked In: Yes</p>
                    <button className="check-in">Check-In</button>
                </div>
                {/* Repeat the check-in-card div for more check-ins */}
            </div>

            <div className="send-notifications">
                <h2>Send Notifications</h2>
                <form className="notification-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="notification-title">Title</label>
                        <input type="text" id="notification-title" name="title" placeholder="Enter notification title" value={formData.title} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="notification-message" name="content">Message</label>
                        <textarea id="notification-message" placeholder="Enter your message" name="content" value={formData.content} onChange={handleInputChange}></textarea>
                    </div>
                    <div className="form-group">
                        <label htmlFor="notification-recipients">Recipients</label>
                        <select id="notification-recipients" value={formData.recipients} onChange={handleInputChange} name="recipients">
                            <option value="all">All Attendees</option>
                            {chartData.labels.map((label) => (
                                <option key={label} value={`${label}'s attendees`}>{`${label}'s attendees`}</option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" className="send-button">Send Notification</button>
                </form>
            </div>
            <div className="email-campaigns">
                <h2>Email Campaigns</h2>
                <form className="campaign-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="campaign-title">Campaign Title</label>
                        <input type="text" id="campaign-title" placeholder="Enter campaign title" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="campaign-subject">Subject</label>
                        <input type="text" id="campaign-subject" placeholder="Enter email subject" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="campaign-content">Content</label>
                        <textarea id="campaign-content" placeholder="Enter your email content" ></textarea>
                    </div>
                    <div className="form-group">
                        <label htmlFor="campaign-recipients">Recipients</label>
                        <select id="campaign-recipients">
                            <option value="all">All Attendees</option>
                            {chartData.labels.map((label) => (
                                <option key={label} value={`${label}'s attendees`}>{`${label}'s attendees`}</option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" className="send-button">Send Campaign</button>
                </form>
            </div>

            <div className="feedback-section">
                <h2>Event Feedback</h2>
                <div className="feedback-list">
                    <div className="feedback-card">
                        <div className="feedback-header">
                            <h3>Event Name</h3>
                            <p>Date: August 20, 2024</p>
                        </div>
                        <div className="feedback-content">
                            <p>"The event was very well organized. The speakers were engaging and the sessions were informative."</p>
                            <div className="feedback-meta">
                                <span>User: John Doe</span>
                                <span>Rating: ★★★★☆</span>
                            </div>
                        </div>
                    </div>
                    <div className="feedback-card">
                        <div className="feedback-header">
                            <h3>Event Name</h3>
                            <p>Date: August 20, 2024</p>
                        </div>
                        <div className="feedback-content">
                            <p>"Loved the networking opportunities. Could have had more variety in the sessions."</p>
                            <div className="feedback-meta">
                                <span>User: Jane Smith</span>
                                <span>Rating: ★★★☆☆</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="assign-task-section">
                <h2>Assign Task</h2>
                <form className="task-form" onSubmit={handleAssignTask}>
                    <div className="form-group">
                        <label htmlFor="taskName">Task Name</label>
                        <input
                            type="text"
                            id="taskName"
                            placeholder="Enter task name"
                            value={taskName}
                            onChange={(e) => setTaskName(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="assignedTo">Assign To</label>
                        <select
                            id="assignedTo"
                            value={assignedTo}
                            onChange={(e) => setAssignedTo(e.target.value)}
                        >
                            <option value="">Select team member</option>
                            {teamMembers.map((member) => (
                                <option key={member.id} value={member.name}>
                                    {member.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="dueDate">Due Date</label>
                        <input
                            type="date"
                            id="dueDate"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                        />
                    </div>
                    <button
                        className="assign-button"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Assigning...' : 'Assign Task'}
                    </button>
                </form>
                {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
                {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
            </div>
            <div className="track-progress-section">
                <h2>Track Progress</h2>
                <div className="progress-grid">
                    {tasks.map((task) => (
                        <div key={task.id} className="progress-card">
                            <h3>{task.taskName}</h3>
                            <p>Assigned to: {task.assignedTo}</p>
                            <p>Due Date: {task.dueDate}</p>
                            <div className="progress-bar">
                                <div
                                    className="progress"
                                    style={{
                                        width: `${task.progressPercentage || 0}%`,
                                        backgroundColor: task.progressPercentage === 100 ? 'green' : 'blue',
                                    }}
                                >
                                    {task.progressPercentage || 0}%
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="manage-team-section">
                <h2>Manage Team Members</h2>
                <div className="team-grid">
                    {teamMembers.map((member) => (
                        <div key={member.id} className="team-card">
                            <img
                                src={member.profilePicURL || '/assets/team_member.jpg'}
                                alt="Team Member"
                                className="team-avatar"
                            />
                            <div className="team-info">
                                <h3>{member.name}</h3>
                                <p>{member.role || 'No role assigned'}</p>
                            </div>
                            <div className="team-actions">
                                <button className="edit-button" onClick={() => openEditModal(member.id)}>Edit</button>
                                <button className="remove-button" onClick={() => handleRemoveMember(member.id)}>Remove</button>
                            </div>
                        </div>
                    ))}
                </div>
                <button className="add-team-button" onClick={openModal}>Add Team Member</button>
            </div>
            <div className="roles-permissions-section">
                <h2>Roles and Permissions</h2>
                <div className="roles-grid">
                    <div className="role-card">
                        <h3>Event Manager</h3>
                        <ul className="permissions-list">
                            <li>Manage Events</li>
                            <li>Assign Tasks</li>
                            <li>View Reports</li>
                        </ul>
                        <button className="edit-role-button">Edit Role</button>
                    </div>
                    <div className="role-card">
                        <h3>Marketing Lead</h3>
                        <ul className="permissions-list">
                            <li>Manage Marketing Campaigns</li>
                            <li>View Reports</li>
                            <li>Send Notifications</li>
                        </ul>
                        <button className="edit-role-button">Edit Role</button>
                    </div>
                </div>
                <button className="add-role-button">Add New Role</button>
            </div>
            <div className="event-promotion">
                <h1>Event Promotion</h1>
                <div className="promotion-overview">
                    <div className="overview-card">
                        <CampaignIcon className="promo-icon" />
                        <h2>Create Campaign</h2>
                        <p>Design and launch new marketing campaigns to boost event visibility.</p>
                        <button>Create Now</button>
                    </div>
                    <div className="overview-card">
                        <AdUnitsIcon className="promo-icon" />
                        <h2>Promotional Materials</h2>
                        <p>Upload and manage banners, posters, and other promotional content.</p>
                        <button>Manage Materials</button>
                    </div>
                    <div className="overview-card">
                        <InsightsIcon className="promo-icon" />
                        <h2>Campaign Performance</h2>
                        <p>Track the performance of your campaigns with detailed analytics.</p>
                        <button>View Insights</button>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default HomeO