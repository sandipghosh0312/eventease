import React, { useState } from 'react';
import "./Register.css";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendEmailVerification, FacebookAuthProvider, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmedPassword, setConfirmedPassword] = useState("");
  const navigate = useNavigate();



  const handleSignUp = async (e) => {
    e.preventDefault();
  
    // Check if passwords match
    if (password !== confirmedPassword) {
      alert("Your password and confirmed password do not match.");
      return;
    }
  
    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      await updateProfile(userCredential.user, {
        displayName: name,
        email: email,
        photoURL: ""
      })
      
      // Send email verification
      await sendEmailVerification(userCredential.user);
      alert('A verification email has been sent to your email address. Please verify and log in back.');
      navigate("/home")
  
      // Listen for changes in the auth state (e.g., email verification)
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (user) {
          await user.reload(); // Reload user data to get updated verification status
          
            // Get the user UID
            const uid = user.uid;
            
  
            // Create a reference to the document with the user's UID
            const userDocRef = doc(db, "users", uid);
  
            // Prepare user data to be stored in Firestore
            const userData = {
              name: name,
              email: email,
              phone: phone,
              profilePhoto: "", // You can update this later with the actual profile photo
              uid: uid,
              profileBanner: "",
              location: {
                country: "India",
                state: "West Bengal",
                City: "Kolkata"
              },
              organizer: false,
              eventsAttended: 0,
              eventsAList: [], // events attended list3
              eventsMade: 0,
              eventsMList: [], // Events made list (only for organizers)
              registeredEvents: [], // Events registered yet pending to be attended
              Followers: 0,
              Following: 0

            };
  
            // Set the user's document in Firestore
            await setDoc(userDocRef, userData);
  
            console.log('User successfully created and document written!');
            unsubscribe(); // Unsubscribe from auth changes once the operation is complete
          
        }
      });
    } catch (error) {
      console.error('Error during sign-up or Firestore operation: ', error);
      alert(error.message);
    }
  };

  const signInWithGoogle = async (e) => {
    e.preventDefault();
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      const uid = result.uid;

      await setDoc(doc(db, "users", uid), {
        name: result.displayName,
        email: result.email,
        phone: "",
        profilePhoto: result.photoURL,
        uid: uid
      })
    } catch (error) {
      alert(error.message)
    }


  }


  const signInWithFacebook = async (e) => {
    e.preventDefault();
    try {
      const provider = new FacebookAuthProvider();
      const result = await signInWithPopup(auth, provider);

      const uid = result.uid;

      await setDoc(doc(db, "users", uid), {
        name: result.displayName,
        email: result.email,
        phone: "",
        profilePhoto: result.photoURL,
        uid: uid
      })
    } catch (error) {
      alert(error.message)
    }
  }

  return (
    <div className='register'>
      <div className="mid">
        <figure>
          <img src="/assets/registration.png" alt="Registration" />
        </figure>
        <form onSubmit={handleSignUp}>
          <h1 style={{ paddingBottom: "15px", fontSize: "25px" }}>REGISTER YOURSELF TO EVENTEASE</h1>
          <hr />
          <div className="form__inputs">
            <input
              placeholder="ENTER YOUR FULL NAME"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              placeholder="ENTER YOUR EMAIL ADDRESS"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              placeholder="ENTER YOUR PHONE NUMBER"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <input
              placeholder="CREATE A PASSWORD"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <input
              placeholder="RE ENTER THE PASSWORD FOR CONFIRMATION"
              type="password"
              value={confirmedPassword}
              onChange={(e) => setConfirmedPassword(e.target.value)}
              required
            />
            <button type="submit">CREATE ACCOUNT</button>
            <div className="social-signin">
              <button className="google-btn" onClick={signInWithGoogle}>
                <img src="/assets/google-icon.png" alt="Google icon" className="google-icon" />
                Sign in with Google
              </button>
              <button className="facebook-btn" onClick={signInWithFacebook}>
                <img src="/assets/facebook-icon.png" alt="Facebook icon" className="facebook-icon" />
                Sign in with Facebook
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
