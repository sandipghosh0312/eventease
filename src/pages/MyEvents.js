import React, { useState, useEffect } from 'react';
import "./MyEvents.css";
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { auth, db } from "../firebase";
import { collection, getDocs, orderBy } from "firebase/firestore";

function MyEvents() {
    const [pendingEvents, setPendingEvents] = useState([]);
    const [pastEvents, setPastEvents] = useState([]);
    const user = auth.currentUser;

    useEffect(() => {
        const fetchPendingEvents = async () => {
            const ref = await getDocs(collection(db, "users", user?.uid, "events-pending"));
            const array = ref.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })

            )
            setPendingEvents(array)
        }
        fetchPendingEvents();
    }, [user?.uid])

    useEffect(() => {
        const fetchPastEvents = async () => {
            const ref = await getDocs(collection(db, "users", user?.uid, "events-joined"));
            const array = ref.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })

            )
            setPastEvents(array)
        }
        fetchPastEvents();
    }, [user?.uid])

    return (
        <>
            <Header />
            <div className="splitter">
                <Sidebar />
                <div className="my-events-page">
                    <div className="content-header">
                        <h1>My Events</h1>
                        <div className="filters">
                            <input type="text" placeholder="Search Events..." className="search-bar" />
                            <select className="filter-select">
                                <option value="all">All Events</option>
                                <option value="upcoming">Upcoming Events</option>
                                <option value="past">Past Events</option>
                                <option value="created">Created by Me</option>
                                <option value="registered">Registered</option>
                                <option value="favorites">Favorites</option>
                            </select>
                        </div>
                    </div>

                    <div className="events-section">
                        <div className="events-category">
                            <h2>Upcoming Events</h2>
                            <div className="events-grid">
                                {
                                    pendingEvents.map(event => (
                                        <div className="event-card">
                                            <h3>{event?.name}</h3>
                                            <p>{`${event?.date} - ${event?.time}`}</p>
                                            <p>{`Type: ${event?.type}`}</p>
                                            <div className="event-actions">
                                                <button className="view-btn">View</button>
                                                <button className="rsvp-btn">RSVP</button>
                                            </div>
                                        </div>
                                    ))
                                }

                               


                            </div>
                        </div>


                        <div className="events-category">
                            <h2>Past Events</h2>
                            <div className="events-grid">

                            {
                                    pastEvents.map(event => (
                                        <div className="event-card">
                                            <h3>{event?.name}</h3>
                                            <p>{`${event?.date} - ${event?.time}`}</p>
                                            <p>{`Type: ${event?.type}`}</p>
                                            <div className="event-actions">
                                                <button className="view-btn">View</button>
                                                <button className="rsvp-btn">RSVP</button>
                                            </div>
                                        </div>
                                    ))
                                }

                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </>

    )
}

export default MyEvents