import React, { useState, useEffect } from 'react';
import "./MusicPage.css";
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { db } from "../firebase";
import { collection, orderBy, query, where, getDocs } from "firebase/firestore";

function MusicPage() {
    const [upcomingEvents, setUpcomingEvents] = useState([]);

    useEffect(() => {
        const fetchUpcomingEvents = async () => {
            const today = new Date();
            const eventsRef = collection(db, 'events');
            const q = query(
                eventsRef,
                where('date', '>=', today),
                orderBy('date', 'asc')
            );
            const querySnapshot = await getDocs(q);

            const upcomingEvents = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(doc => doc.category === "conference");
            setUpcomingEvents(upcomingEvents); // Display in featured section
        };

        fetchUpcomingEvents();
    }, [])


    return (
        <>
            <Header />
            <div className="splitter">
                <Sidebar />
                <div className="music-page">
                    <div className="music-hero-section">
                        <h1>Discover Music Events</h1>
                        <p>Explore live performances near you!</p>
                    </div>
                    <div className="upcoming-music-events">
                        <h2>Upcoming Music Events</h2>
                        <div className="events-grid">
                            {
                                upcomingEvents.length !== 0 ? (
                                    upcomingEvents.map(events => (
                                        <div className="event-card">
                                            <img src={events?.eventBanner} alt={events?.eventName} className="event-image" />
                                            <div className="event-info">
                                                <h3>{events?.eventName}</h3>
                                                <p>{`Date: ${events?.date}`}</p>
                                                <p>{`Location: ${events?.location}`}</p>
                                                <button className="buy-tickets-btn_music">Buy Tickets</button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p>No new music events</p>
                                )
                            }
                        </div>
                    </div>
                </div>

            </div>
        </>
    )
}

export default MusicPage