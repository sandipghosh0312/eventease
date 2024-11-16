import React, { useState, useEffect } from 'react';
import "./HomeA.css";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore"
import { collection, getDocs, query, where, limit, orderBy } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

function HomeA({ user }) {
  const [userData, setUserData] = useState([]);
  const [events, setEvents] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [sponsoredEvent, setSponsoredEvent] = useState(null);
  const [popularEvent, setPopularEvent] = useState(null);
  const navigate = useNavigate();

  // Fetching user location from Firestore
  const fetchUserLocation = async () => {
    try {
      if (!user?.uid) {
        throw new Error("User not authenticated or UID not available.");
      }

      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        setUserLocation(userData.location);
      } else {
        console.error("No such user found!");
      }
    } catch (error) {
      console.error('Error fetching user location:', error.message);
      alert('Error fetching user location:', error.message);
    }
  };

  // Fetching one sponsored event based on user location
  // Fetching one sponsored event based on user location
  const fetchSponsoredEvent = async () => {
    if (!userLocation || typeof userLocation !== 'object') return;

    const { City: userCity, state, country } = userLocation; // Correctly extracting City as userCity

    try {
      const eventsRef = collection(db, 'events');
      const q = query(
        eventsRef,
        where('country', '==', country),
        where('state', '==', state),
        where('city', '==', userCity), // Comparing with the 'city' in event's document
        where('isSponsored', '==', true),
        limit(1)
      );

      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const event = querySnapshot.docs[0].data();
        setSponsoredEvent({ id: querySnapshot.docs[0].id, ...event });
        console.log('Sponsored event fetched:', event);
      } else {
        console.log('No sponsored events found for this location.');
      }
    } catch (error) {
      console.error('Error fetching sponsored event:', error);
      alert('Error fetching sponsored event:', error);
    }
  };

  const fetchPopularEvent = async () => {
    try {
      const eventsRef = collection(db, 'events');
      const q = query(
        eventsRef,
        orderBy('noOfAttendees', 'desc'),  // Order by noOfAttendees in descending order
        limit(1) // Limit to only 1 event
      );

      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const eventDoc = querySnapshot.docs[0].data();
        setPopularEvent({ id: querySnapshot.docs[0].id, ...eventDoc });
      } else {
        console.log('No events found.');
      }
    } catch (error) {
      console.error('Error fetching popular event:', error);
    }
  };

  // Fetch the popular event on component mount
  useEffect(() => {
    fetchPopularEvent();
  }, []);


  // Fetching user location on component mount
  useEffect(() => {
    fetchUserLocation();
  }, [user?.uid]);

  // Fetching event when user location is available
  useEffect(() => {
    if (userLocation) {
      fetchSponsoredEvent();
    }
  }, [userLocation]);

  console.log("Sponsored event:", sponsoredEvent);

  const navigateToEvent = (e) => {
    e.preventDefault();
    navigate(`/event/${popularEvent?.id}`)
  }



  useEffect(() => {
    const fetchUserData = async () => {

      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            setUserData(docSnap.data());
          } else {
            console.log('No user data found in "users"');
          }
        } catch (error) {
          console.error('Error fetching user data: ', error);
        }
      }
      fetchUserData();
    }
  })

  useEffect(() => {
    const fetchDocuments = async () => {
      const querySnapshot = await getDocs(collection(db, 'users', user?.uid, "events-pending"));
      const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEvents(docs);
    };

    fetchDocuments();
  }, []);


  return (
    <div className='homeA'>
      <div className="greeting-banner">
        <h1>{`Welcome back, ${user?.displayName}!`}</h1>
        <p>It really feels good to see you here again.</p>
      </div>
      <div className="homeA__content">
        <div className="event__card">
          <h1>Events</h1>
          {events.map(doc => (
            <div key={doc.id} className="eventList">
              <h3>{doc?.name}</h3>
              <button>View</button>
            </div>
          ))}

        </div>
        {sponsoredEvent && (
          <div className="recommendation__card">
            <img src={sponsoredEvent.bannerURL + '?alt=media'} alt="Event Image" className="event__image" />
            <div className="sponsored__tag">Sponsored</div>
            <div className="event__details">
              <h2>{sponsoredEvent.eventName}</h2>
              <p>{`Date: ${sponsoredEvent.date}`}</p>
              <p>Location: {sponsoredEvent.location}</p>
              <button className="event__button">Learn More</button>
            </div>
          </div>

        )}

        <div className="popular__card">
          <img src={popularEvent?.bannerURL} alt="Popular Event Image" className="event__image" />
          <div className="sponsored__tag">Popular Event</div>
          <div className="event__info">
            <h2>{popularEvent?.eventName}</h2>
            <p>{popularEvent?.description}</p>
            <button className="event__button" onClick={navigateToEvent} >Learn More</button>
          </div>
        </div>
        <div className="event__reminders">
          <h2>Event Reminders</h2>
          <ul className="reminders__list">
            {
              events.map(doc => (
                <li key={doc.id}>
                  <span>{`${doc?.date} - ${doc?.name}`}</span>
                  <button className="view__button">View Details</button>
                </li>
              ))
            }
          </ul>
        </div>
        <div className="event__updates">
          <h2>Event Updates</h2>
          <ul className="updates__list">
            {events.length > 0 && events.some(doc => doc?.update !== "") ? (
              <ul className='updates_list'>
                {events.map(doc => (
                  doc?.update !== "" && (
                    <li key={doc.id}>
                      <span>{`${doc?.update} - ${doc?.name}`}</span>
                      <button className="view__button">View Details</button>
                    </li>
                  )
                ))}
              </ul>
            ) : (
              <p>No updates</p>
            )}
          </ul>
        </div>
        <div className="event__calendar">
          <h2>Upcoming Events Calendar</h2>
          <iframe src="https://calendar.google.com/calendar/embed?src=your_calendar_id&ctz=Time_Zone"
            style={{ border: "0", height: "500px" }}
            width="100%"
            height="600"
            frameborder="0"
            scrolling="no"></iframe>
          <a href="https://www.google.com/calendar/render?action=TEMPLATE&text=Event+Name&dates=20240820T140000Z/20240820T150000Z&details=Event+Description&location=Event+Location"
            target="_blank"
            className="add-to-calendar">
            Add to Google Calendar
          </a>
        </div>

      </div>
    </div>
  )
}

export default HomeA;