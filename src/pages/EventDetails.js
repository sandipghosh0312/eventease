import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // To get eventID from URL
import { doc, getDoc, setDoc, updateDoc, runTransaction } from 'firebase/firestore'; // Firestore imports
import { db, auth } from '../firebase'; // Import your Firestore instance
import './EventDetails.css';
import { Avatar } from '@mui/material';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
// import { updateDoc } from 'firebase/firestore/lite';

const EventDetails = () => {
  const user = auth.currentUser;
  const { eventID } = useParams(); // Get the eventID from the URL
  const [event, setEvent] = useState(null); // State to store event data
  const [loading, setLoading] = useState(true); // State for loading
  const [error, setError] = useState(null); // State for error handling
  const [messengerName, setMessengername] = useState(user?.displayName || "");
  const [messengerEmail, setMessengerEmail] = useState(user?.email || "");
  const [message, setMessage] = useState("");
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDetails = await getDoc(doc(db, 'users', user?.uid));
        if (userDetails.exists()) {
          setUserData(userDetails.data()); // Set the event data to state
          console.log(userDetails.data())
        } else {
          console.error("No user found")
        }
      } catch (err) {
        setError('Failed to get user data');
      }
    };

    fetchUserData();
  }, [user?.uid]);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventDoc = await getDoc(doc(db, 'events', eventID)); // Fetch document by eventID
        if (eventDoc.exists()) {
          setEvent(eventDoc.data()); // Set the event data to state
          console.log(eventDoc.data())
        } else {
          setError('Event not found');
        }
      } catch (err) {
        setError('Failed to load event data');
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchEvent();
  }, [eventID]);


  const registerForEvent = async (e) => {
    e.preventDefault();

    if (!user?.uid || !eventID) {
      console.error("User ID or event ID is missing.");
      alert("Registration data is incomplete. Please try again.");
      return;
    }

    // Step 1: Add event to 'events-pending' collection for the user
    try {
      const userEventsPendingRef = doc(db, "users", user.uid, "events-pending", eventID);
      await setDoc(userEventsPendingRef, {
        date: event?.date,
        id: eventID,
        update: "",
        name: event?.eventName,
      });
      console.log("Successfully added event to 'events-pending' for user.");
    } catch (error) {
      console.error("Error adding to 'events-pending':", error);
      alert("Failed to add event to your pending events. Please try again later.");
      return;
    }

    // Step 2: Increment the noOfAttendees in the 'events' document
    try {
      const eventRef = doc(db, "events", eventID);
      const eref = doc(db, "organizers", event?.organizerUid, "events-made", eventID);
      await runTransaction(db, async (transaction) => {
        const eventSnapshot = await transaction.get(eventRef);
        if (!eventSnapshot.exists()) {
          throw new Error("Event document not found.");
        }

        const currentNoOfAttendees = eventSnapshot.data().noOfAttendees || 0;
        const newAttendeeCount = currentNoOfAttendees + 1;

        // Log the current and new attendee count for verification
        console.log("Current noOfAttendees:", currentNoOfAttendees);
        console.log("New noOfAttendees:", newAttendeeCount);

        transaction.update(eventRef, { noOfAttendees: newAttendeeCount });
        transaction.update(eref, { noOfAttendees: newAttendeeCount });
      });
      console.log("Successfully incremented noOfAttendees.");
    } catch (error) {
      console.error("Error incrementing noOfAttendees:", error);
      alert("Failed to update attendee count. Please try again later.");
      return;
    }

    // Step 3: Register user in 'registered-users' collection within the event
    try {
      const userRegistrationRef = doc(db, "events", eventID, "registered-users", user.uid);
      await setDoc(userRegistrationRef, {
        displayName: user?.displayName,
        photoURL: user?.photoURL,
        location: userData?.location || {},
        phone: userData?.phone || "N/A",
        email: user?.email || "N/A",
        uid: user?.uid || "N/A",
      });
      console.log("Successfully registered user in 'registered-users'.");
      alert("You have successfully registered for the event!");
    } catch (error) {
      console.error("Error adding user to 'registered-users':", error);
      alert("Failed to register you for the event. Please try again later.");
    }
  };






  const sendMessage = (e) => {
    e.preventDefault();

  }

  // Display the event details if data is loaded
  return (
    <>
      <Header />
      <div className="splitter">
        <Sidebar />
        <div className="event-details">
          {/* Top Card with Banner, Event Image,  Name, Register Button, and Website Link */}
          <div className="top-card">
            <div className="banner-image-container">
              <img src={event?.bannerURL || '/assets/default_banner.jpg'} alt="Event Banner" className="banner-image" />
            </div>
            <div className="top-card-content">
              <div className="event-picture">
                <img src={event?.avatarURL || '/assets/default_image.png'} alt="Event" className="event-image" />
              </div>
              <div className="event-name-section">
                <h1 className="event-name">{event?.eventName || 'Event Name'}</h1>
                {event?.website && (
                  <a href={event.website} target="_blank" rel="noreferrer" className="event-website">
                    Visit Event Website
                  </a>
                )}
                <p style={{ marginTop: "10px" }}><strong>Type: </strong>{event?.type}</p>
                <p style={{ marginTop: "10px" }}><strong>Cathgory: </strong>{event?.category}</p>
              </div>
              <div className="register-button-container">
              {
                user && (
                  <button className="register-button" onClick={registerForEvent}>Register for Event</button>
                )
              }
              </div>
            </div>
          </div>

          <div className="main-layout">
            {/* Left Sidebar */}
            <div className="left-sidebar">
              {/* Gallery */}
              <div className="sidebar-card">
                <h2>Gallery</h2>
                <div className="gallery-images">
                  {event?.galleryURLs?.map((image, index) => (
                    <img key={index} src={image} alt={`Gallery ${index + 1}`} />
                  ))}
                </div>
              </div>

              {/* Social Media Links */}
              {
                event?.socialLinks.length > 0 && (
                  <div className="sidebar-card">
                    <h2>Social Media Links</h2>
                    <div className="social-links">
                      {event?.socialLinks?.facebook && <a href={event.socialLinks.facebook} target="_blank" rel="noreferrer">Facebook</a>}
                      {event?.socialLinks?.twitter && <a href={event.socialLinks.twitter} target="_blank" rel="noreferrer">Twitter</a>}
                      {event?.socialLinks?.instagram && <a href={event.socialLinks.instagram} target="_blank" rel="noreferrer">Instagram</a>}
                      {event?.socialLinks?.youtube && <a href={event.socialLinks.youtube} target="_blank" rel="noreferrer">Instagram</a>}
                    </div>
                  </div>
                )
              }

              {/* Additional Information */}
              {
                event?.additionalInfo && (
                  <div className="sidebar-card">
                    <h2>Additional Information</h2>
                    <p>{event?.additionalInfo || 'No additional information provided.'}</p>
                  </div>
                )
              }

              {/* Online Event Links */}
              {/* {
                event?.onlineLinks.length > 0 && (
                  <div className="sidebar-card">
                    <h2>Online Event Links</h2>
                    {event?.onlineLinks?.map((link, index) => (
                      <a key={index} href={link.url} target="_blank" rel="noreferrer">{link.label}</a>
                    ))}
                  </div>
                )
              } */}
            </div>

            {/* Main Content */}
            <div className="main-content">
              {/* Event Description */}
              <div className="main-card">
                <h2>Event Description</h2>
                <p>{event?.description || 'No description available.'}</p>
              </div>

              {/* Event Dates */}
              <div className="main-card">
                <h2>Event Dates</h2>
                <p><strong>Date: </strong>{event?.date || 'TBD'}</p>
                <p><strong>Time: </strong>{event?.time || 'TBD'}</p>
              </div>

              {/* Organizer Information */}
              <div className="main-card">
                <h2>Organizer Information</h2>
                <p style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}><strong style={{ paddingRight: "15px" }}>Organizer: </strong><Avatar style={{ marginRight: "10px" }} className="organizer-avatar" src={event?.organizerPhoto} /> {event?.organizerName}</p>
                <p><strong>Location: </strong>{event?.location || 'Location not available.'}</p>
              </div>

              {/* Location with Map */}
              <div className="main-card">
                <h2>Location</h2>
                {event?.location && (
                  <a href={`https://maps.google.com?q=${encodeURIComponent(event.location)}`} target="_blank" rel="noreferrer" className="location-link">
                    Open in Google Maps
                  </a>
                )}
              </div>

              {/* Contact Core Form */}
              <div className="main-card">
                <h2>Contact the Event Core Team</h2>
                <form>
                  <div className="form-group">
                    <label>Name</label>
                    {
                      user ? (
                        <input type="text" placeholder="Your Name" value={user?.displayName} disabled required />
                      ) : (
                        <input type="text" placeholder="Your Name" value={messengerName} onChange={(e) => setMessengername(e.target.value)} required />
                      )
                    }
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    {
                      user ? (
                        <input type="email" placeholder="Your Email" value={user?.email} disabled required />
                      ) : (
                        <input type="email" placeholder="Your Email" value={messengerEmail} onChange={(e) => setMessengerEmail(e.target.value)} required />
                      )
                    }
                  </div>
                  <div className="form-group">
                    <label>Message</label>
                    <textarea style={{ resize: "none" }} placeholder="Your Message" value={message} onChange={(e) => setMessage(e.target.value)} required></textarea>
                  </div>
                  <button type="submit" className="contact-button" onClick={sendMessage}>Send Message</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EventDetails;
