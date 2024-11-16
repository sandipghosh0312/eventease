import {React, useState} from 'react';
import "./FeedbackPage.css";
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { auth, db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

function FeedbackPage() {
    const [rate, setRate] = useState("Excellent");
    const [feedback, setFeedback] = useState("");
    const user = auth.currentUser;

    const handleSubmitFeedback = async (e) => {
        e.preventDefault();
        await addDoc(collection(db, "feedback"), {
            name: user?.displayName,
            uid: user?.uid,
            email: user?.email,
            rate: rate,
            feedback: feedback
        }).then(() => {
            alert("We have recieved your feedback. Thanks!");
            setRate("Excellent");
            setFeedback("");
        }).catch((err) => alert(err.code, ": ", err.message));
    }

    return (
        <>
            <Header />
            <div className="splitter">
                <Sidebar />
                <div className="feedback-page">
                    <div className="feedback-hero">
                        <h1>We Value Your Feedback</h1>
                        <p>Your thoughts help us improve. Please share your experience with us.</p>
                    </div>

                    <div className="feedback-form-container">
                        <form className="feedback-form">
                            <div className="form-group">
                                <label htmlFor="rating">Rate Your Experience</label>
                                <select id="rating" value={rate} onChange={(e) => setRate(e.target.value)}>
                                    <option value="excellent">Excellent</option>
                                    <option value="good">Good</option>
                                    <option value="average">Average</option>
                                    <option value="poor">Poor</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="feedback">Your Feedback</label>
                                <textarea id="feedback" rows="5" value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Share your thoughts"></textarea>
                            </div>

                            <button type="submit" className="submit-btn" onClick={handleSubmitFeedback}>Submit Feedback</button>
                        </form>
                    </div>
                </div>

            </div>
        </>
    )
}

export default FeedbackPage