import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase'; // Import your Firestore config
import { collection, getDocs } from 'firebase/firestore';
import "./WorkShopsPage.css";
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

function WorkShopsPage() {
    const [workshops, setWorkshops] = useState([]);
    const [filteredWorkshops, setFilteredWorkshops] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [featuredEvent, setFeaturedEvent] = useState(null);

    useEffect(() => {
        const fetchFeaturedWorkshop = async () => {
            const workshopCollection = collection(db, "events");
            const workshopSnapshot = await getDocs(workshopCollection);
            const workshopList = workshopSnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(doc => doc.category === "workshop"); // Only fetch workshops

            // Assume the first workshop is the featured one, or you can apply some logic
            if (workshopList.length > 0) {
                setFeaturedEvent(workshopList[0]);
            }
        };
        fetchFeaturedWorkshop();
    }, []);

    useEffect(() => {
        const fetchWorkshops = async () => {
            const workshopCollection = collection(db, "events");
            const workshopSnapshot = await getDocs(workshopCollection);
            const workshopList = workshopSnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(doc => doc.category === "workshop"); // Only fetch workshops
            setWorkshops(workshopList);
            setFilteredWorkshops(workshopList);
        };
        fetchWorkshops();
    }, []);

    // Filter the workshops whenever search, category, or date changes
    useEffect(() => {
        let filtered = workshops;

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(workshop =>
                workshop.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply category filter
        if (selectedCategory) {
            filtered = filtered.filter(workshop => workshop.category.toLowerCase() === selectedCategory.toLowerCase());
        }

        // Apply date filter
        if (selectedDate) {
            const now = new Date();
            filtered = filtered.filter(workshop => {
                const workshopDate = new Date(workshop.date);
                if (selectedDate === "today") {
                    return workshopDate.toDateString() === now.toDateString();
                } else if (selectedDate === "this-week") {
                    const weekLater = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7);
                    return workshopDate >= now && workshopDate <= weekLater;
                } else if (selectedDate === "this-month") {
                    return (
                        workshopDate.getFullYear() === now.getFullYear() &&
                        workshopDate.getMonth() === now.getMonth()
                    );
                }
                return true;
            });
        }

        setFilteredWorkshops(filtered);
    }, [searchTerm, selectedCategory, selectedDate, workshops]);

    return (
        <>
            <Header />
            <div className="splitter">
                <Sidebar />
                <div className="workshops-page">
                    <div className="search-filter">
                        <input
                            type="text"
                            placeholder="Search Workshops..."
                            className="search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="filters">
                            <select
                                className="filter-category"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                <option value="">All Categories</option>
                                <option value="tech">Tech</option>
                                <option value="business">Business</option>
                                <option value="art">Art & Design</option>
                            </select>
                            <select
                                className="filter-date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                            >
                                <option value="">All Dates</option>
                                <option value="today">Today</option>
                                <option value="this-week">This Week</option>
                                <option value="this-month">This Month</option>
                            </select>
                        </div>
                    </div>

                    {
                        featuredEvent && (
                            <div className="featured-workshop">
                                <img src={featuredEvent?.bannerURL} alt="Featured Workshop" className="featured-image" />
                                <div className="featured-content">
                                    <h1>{featuredEvent?.eventName}</h1>
                                    <p>{`Date: ${featuredEvent?.date}`}</p>
                                    <p>{`Location: ${featuredEvent?.country}, ${featuredEvent?.city}`}</p>
                                    <button className="register-btn">Register Now</button>
                                </div>
                            </div>
                        )
                    }


                    <div className="upcoming-workshops">
                        <h2>Upcoming Workshops</h2>
                        <div className="workshop-cards">
                            {filteredWorkshops.length > 0 ? (
                                filteredWorkshops.map(workshop => (
                                    <div className="workshop-card" key={workshop.id}>
                                        <img src={workshop.imageURL} alt={workshop.name} className="workshop-image" />
                                        <div className="workshop-info">
                                            <h3>{workshop.name}</h3>
                                            <p>Date: {workshop.date}</p>
                                            <p>Location: {workshop.location}</p>
                                            <button className="view-details-btn">View Details</button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p>No workshops found.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default WorkShopsPage;
