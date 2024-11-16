import React, { useState, useEffect } from 'react'
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import "./ConferencesPage.css";
import { db, auth } from "../firebase";
import { collection, orderBy, limit, query, where, getDocs } from "firebase/firestore"

function ConferencesPage() {
    const [featuredEvent, setFeaturedEvent] = useState(null);
    const [upcomingEvents, setUpcomingEvents] = useState([]);

    useEffect(() => {
        const fetchPopularEvent = async () => {
            try {
                const eventsRef = collection(db, 'events');
                const q = query(
                    eventsRef,
                    where("isSponsored", "==", true),
                    where("category", "==", "conference"),
                    orderBy('noOfAttendees', 'desc'),
                    limit(1)
                );

                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const popularEvent = querySnapshot.docs[0].data();
                    setFeaturedEvent({ id: querySnapshot.docs[0].id, ...popularEvent });
                    console.log("Fetched popular event:", popularEvent);
                } else {
                    console.log('No popular events found.');
                    setFeaturedEvent(null);
                }
            } catch (error) {
                console.error('Error fetching popular event:', error);
            }
        };

        fetchPopularEvent();
    }, []);


    useEffect(() => {
        if (featuredEvent) {
            console.log("Updated featured event:", featuredEvent);
        }
    }, [featuredEvent]);

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
                <div className="conferences-page">
                    {
                        featuredEvent && (
                            <div className="featured-conference">
                                <img src={featuredEvent?.bannerURL} alt="Featured Conference" className="featured-image" />
                                <div className="featured-content">
                                    <h1>{featuredEvent?.eventName}</h1>
                                    <p>{`Date: ${featuredEvent?.date}`}</p>
                                    <p>{`Location: ${featuredEvent?.country}, ${featuredEvent?.city}`}</p>
                                    <button className="register-btn">Register Now</button>
                                </div>
                            </div>
                        )
                    }


                    <div className="upcoming-conferences">
                        <h2>Upcoming Conferences</h2>
                        <div className="conference-cards">
                            {
                                upcomingEvents.length !== 0 ? (
                                    upcomingEvents.map(events => (
                                        <div className="conference-card">
                                            <img src="https://etgroup.ca/wp-content/uploads/2023/05/How-to-Nail-Conference-and-Video-Meeting-Rooms-3.jpg" alt="Conference Name" className="conference-image" />
                                            <div className="conference-info">
                                                <h3>AI & Innovation Conference 2024</h3>
                                                <p>Date: October 10, 2024</p>
                                                <p>Location: Virtual Event</p>
                                                <button className="view-details-btn">View Details</button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p>No Upcoming events</p>
                                )
                            }

                        </div>
                    </div>
                    <div className="conference-categories">
                        <h2>Explore by Category</h2>
                        <div className="category-cards">
                            <div className="category-card">
                                <img src="path/to/category-image.jpg" alt="Tech Conferences" className="category-image" />
                                <div className="category-info">
                                    <h3>Tech Conferences</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


            </div>
        </>
    )
}

export default ConferencesPage;