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
import { auth, db } from "../firebase";
import { collection, query, where, getDocs, getDoc, doc, setDoc, deleteDoc } from 'firebase/firestore';

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
        }catch (error) {
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
                <div className="task-form">
                    <div className="form-group">
                        <label htmlFor="taskName">Task Name</label>
                        <input type="text" id="taskName" placeholder="Enter task name" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="assignedTo">Assign To</label>
                        <select id="assignedTo">
                            <option>Select team member</option>
                            <option>John Doe</option>
                            <option>Jane Smith</option>
                            <option>Mark Taylor</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="dueDate">Due Date</label>
                        <input type="date" id="dueDate" />
                    </div>
                    <button className="assign-button">Assign Task</button>
                </div>
            </div>
            <div className="track-progress-section">
                <h2>Track Progress</h2>
                <div className="progress-grid">
                    <div className="progress-card">
                        <h3>Task Name</h3>
                        <p>Assigned to: John Doe</p>
                        <p>Due Date: August 25, 2024</p>
                        <div className="progress-bar">
                            <div className="progress" style={{ width: "75%" }}>75%</div>
                        </div>
                    </div>
                    <div className="progress-card">
                        <h3>Task Name</h3>
                        <p>Assigned to: Jane Smith</p>
                        <p>Due Date: August 26, 2024</p>
                        <div className="progress-bar">
                            <div className="progress" style={{ width: "50%" }}>50%</div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="manage-team-section">
                <h2>Manage Team Members</h2>
                <div className="team-grid">
                    <div className="team-card">
                        <img src="/assets/team_member.jpg" alt="Team Member" className="team-avatar" />
                        <div className="team-info">
                            <h3>John Doe</h3>
                            <p>Event Manager</p>
                        </div>
                        <div className="team-actions">
                            <button className="edit-button">Edit</button>
                            <button className="remove-button">Remove</button>
                        </div>
                    </div>
                    <div className="team-card">
                        <img src="/assets/team_member.jpg" alt="Team Member" className="team-avatar" />
                        <div className="team-info">
                            <h3>Jane Smith</h3>
                            <p>Marketing Lead</p>
                        </div>
                        <div className="team-actions">
                            <button className="edit-button">Edit</button>
                            <button className="remove-button">Remove</button>
                        </div>
                    </div>
                </div>
                <button className="add-team-button">Add Team Member</button>
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