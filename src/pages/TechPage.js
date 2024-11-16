import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore'; 
import { db } from '../firebase'; // Assuming Firebase is already set up
import Header from '../components/Header';
import Sidebar from "../components/Sidebar";
import "./TechPage.css";

function TechPage() {
    const [techEvents, setTechEvents] = useState([]);
    const [featuredEvent, setFeaturedEvent] = useState(null);

    // Fetch tech events from Firestore
    useEffect(() => {
        const fetchTechEvents = async () => {
            const eventCollection = collection(db, "events");
            const eventSnapshot = await getDocs(eventCollection);
            const eventList = eventSnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(event => event.category === "tech");

            // Set first event as featured, others as more events
            if (eventList.length > 0) {
                setFeaturedEvent(eventList[0]);
                setTechEvents(eventList.slice(1)); // Other events
            }
        };
        fetchTechEvents();
    }, []);

    return (
        <>
            <Header />
            <div className="splitter">
                <Sidebar />
                <div className="tech-page">
                    <div className="hero-section">
                        <h1>Tech Events</h1>
                        <p>Explore the future of technology with our curated events</p>
                    </div>

                    {/* Featured Event */}
                    {featuredEvent && (
                        <div className="featured-tech">
                            <h2>Featured Tech Event</h2>
                            <div className="tech-card">
                                <img src={featuredEvent?.bannerURL} alt="Featured Tech Event" className="event-image" />
                                <div className="event-info">
                                    <h3>{featuredEvent?.eventName}</h3>
                                    <p>{`Date: ${featuredEvent?.date}`}</p>
                                    <p>{`Location: ${featuredEvent?.country}, ${featuredEvent?.city}`}</p>
                                    <button className="register-btn">Register Now</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* More Tech Events */}
                    <div className="features-section">
                        {techEvents.map(event => (
                            <div key={event.id} className="feature-card">
                                <div className="icon">
                                    <img src={event?.bannerURL} alt={event?.eventName} className="event-image" />
                                </div>
                                <div className="event-info">
                                    <h3>{event?.eventName}</h3>
                                    <p>{`Date: ${event?.date}`}</p>
                                    <p>{`Location: ${event?.country}, ${event?.city}`}</p>
                                    <button className="register-btn">Register Now</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}

export default TechPage;
