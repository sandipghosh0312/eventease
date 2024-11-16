import React from 'react';
import "./EventsPage.css";
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

function EventsPage() {
    return (
        <>
            <Header />
            <div className="splitter">
                <Sidebar />
                <div className="explore-events-page">
                    <div className="content-header">
                        <h1>Explore Events</h1>
                        <div className="filters">
                            <input type="text" placeholder="Search Events..." className="search-bar" />
                            <select className="filter-select">
                                <option value="all">All Events</option>
                                <option value="upcoming">Upcoming Events</option>
                                <option value="popular">Popular Events</option>
                                <option value="recommended">Recommended for You</option>
                                <option value="nearby">Nearby Events</option>
                            </select>
                        </div>
                    </div>

                    <div className="events-section">
                        <div className="events-category">
                            <h2>Popular Events</h2>
                            <div className="events-grid">
                                <div className="event-card">
                                    <div className="event-image">
                                        <img src="/assets/event_image.jpg" alt="Event Name" />
                                    </div>
                                    <div className="event-content">
                                        <h3>Event Name</h3>
                                        <p>Date & Time: August 15, 2024, 10:00 AM</p>
                                        <p>Location: Online</p>
                                        <div className="event-actions">
                                            <button className="view-btn">View Details</button>
                                            <button className="register-btn">Register</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </>

    )
}

export default EventsPage