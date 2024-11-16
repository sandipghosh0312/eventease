import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore'; 
import { db } from '../firebase'; // Assuming you have Firebase initialized
import "./ConcertsPage.css";
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

function ConcertsPage() {
    const [concerts, setConcerts] = useState([]);
    const [featuredConcert, setFeaturedConcert] = useState(null);

    // Fetch concerts from Firestore
    useEffect(() => {
        const fetchConcerts = async () => {
            const concertCollection = collection(db, "events");
            const concertSnapshot = await getDocs(concertCollection);
            const concertList = concertSnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(doc => doc.category === "concert");

            // Set the first concert as the featured one (or apply any logic)
            if (concertList.length > 0) {
                setFeaturedConcert(concertList[0]);
                setConcerts(concertList.slice(1)); // Rest of the concerts
            }
        };
        fetchConcerts();
    }, []);

    return (
        <>
            <Header />
            <div className="splitter">
                <Sidebar />
                <div className="concerts-page">
                    <div className="hero-section-concerts">
                        <h1>Upcoming Concerts</h1>
                        <p>Experience the best live music events happening around you!</p>
                    </div>

                    {/* Featured Concert */}
                    {featuredConcert && (
                        <div className="featured-concert">
                            <h2>Featured Concert</h2>
                            <div className="concert-card">
                                <img src={featuredConcert?.bannerURL} alt="Featured Concert" className="concert-image" />
                                <div className="concert-info">
                                    <h3>{featuredConcert?.eventName}</h3>
                                    <p>{`Date: ${featuredConcert?.date}`}</p>
                                    <p>{`Location: ${featuredConcert?.country}, ${featuredConcert?.city}`}</p>
                                    <button className="buy-tickets-btn">Buy Tickets</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* More Concerts */}
                    <div className="concerts-grid">
                        <h2>More Concerts</h2>
                        <div className="concert-cards">
                            {concerts.map(concert => (
                                <div key={concert.id} className="concert-card">
                                    <img src={concert?.bannerURL} alt={concert?.eventName} className="concert-image" />
                                    <div className="concert-info">
                                        <h3>{concert?.eventName}</h3>
                                        <p>{`Date: ${concert?.date}`}</p>
                                        <p>{`Location: ${concert?.country}, ${concert?.city}`}</p>
                                        <button className="buy-tickets-btn">Buy Tickets</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ConcertsPage;
