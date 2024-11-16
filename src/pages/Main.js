import React, { useState, useEffect } from 'react';
import "./Main.css";
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import HomeA from './HomeA';
import HomeO from './HomeO';
import { auth, db } from '../firebase';
import {doc, getDoc } from "firebase/firestore";

function Main() {
  const user = auth.currentUser;
  const [organizer, setOrganizer] = useState(false);

  useEffect(() => {
    const getData = async () => {
      const ref = await getDoc(doc(db, "users", user?.uid));
      if (ref.exists) {
        setOrganizer(ref?.data().organizer)
        // console.log(ref?.data.organizer)
      } else {
        console.log("No user data found")
      }
    }
    getData();
  })

  return (
    <div className='main'>
      {
        user ? (
          <>
            <Header />
            <div className="main__dashboard">
              <Sidebar />
              {
                organizer ? (
                  <HomeO user={user} />
                ) : (
                  <HomeA user={user} />
                )
              }
            </div>
          </>
        ) : (
          <p>You are not authorized to have access to this page. It seems like you are not loggeed in. Please login to have access to this page</p>
        )
      }

    </div>
  )
}

export default Main;