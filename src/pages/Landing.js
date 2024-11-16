import React, { useState, useEffect } from 'react';
import "./Landing.css";
import { Dialog } from '@mui/material';
import { CloseRounded } from '@mui/icons-material';
import {auth} from "../firebase";
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

function Landing() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const user = auth.currentUser;

  const handleLogin = async (e) => {
    e.preventDefault();
    await signInWithEmailAndPassword(auth, email, password).then(() => {
      navigate("/home");
    })
  }

  const openLoginDialog = () => {
    setOpen(true);
  }

  const closeLoginDialog = () => {
    setOpen(false);
    setEmail("");
    setPassword("");
  }

  const redirect = () => {
    navigate("/register");
  }

  useEffect(() => {
    if (user) {
      navigate("/home");
    }
  }, [user, navigate]);
  

  return (

    <div className='landing'>
      <Dialog className='loginDialog' open={open} onClose={closeLoginDialog}>
        <div className="dialog__header">
          <h1>Login</h1>
          <CloseRounded style={{cursor: "pointer"}} onClick={closeLoginDialog} />
        </div>
        <hr />
        <div className="dialog__body">
          <input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button onClick={handleLogin}>LOG IN</button>
        </div>
      </Dialog>
      <div className="landing__header">
        <div className="landing__header-left">
          <img src="/assets/logo.svg" alt="logo" />
          <h1>EventEase</h1>
        </div>
        <div className="landing__header-right">
          <button onClick={openLoginDialog}>Log in</button>
        </div>
      </div>
      <div className="landing__main">
        <div className="landing__contents">
          <h1>Good to see you here! 👋</h1>
          <p>Welcome to <b>EventEase</b>, your ultimate solution for seamless event organization. Whether you’re planning a conference, workshop, or concert, our platform offers a user-friendly interface to create and manage events effortlessly. With secure payment processing, real-time updates, and advanced promotional tools, EventMaster ensures a smooth experience for both organizers and attendees. Discover, register, and engage with events like never before. Join us today and transform the way you experience events!</p>
          <button onClick={redirect}>GET STARTED</button>
        </div>
        <figure className='landing__image'>
          <img src="/assets/landing.png" alt="" width="500px" height="500px" />
        </figure>
      </div>
    </div>
  )
}

export default Landing;