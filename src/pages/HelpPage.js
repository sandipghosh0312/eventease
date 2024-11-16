import React from 'react';
import "./HelpPage.css";
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

function HelpPage() {
    return (
        <>
            <Header />
            <div className="splitter">
                <Sidebar />
                <div className="help-page">
                    <div className="help-hero-section">
                        <h1>How Can We Help You?</h1>
                        <p>Find answers to common questions or get in touch with our support team.</p>
                    </div>

                    <div className="faq-section">
                        <h2>Frequently Asked Questions</h2>
                        <div className="faq-list">
                            <div className="faq-item">
                                <h3>How do I register for an event?</h3>
                                <p>To register for an event, visit the event page, click on 'Register,' and fill in your details.</p>
                            </div>
                        </div>
                    </div>

                    <div className="support-contact-section">
                        <h2>Contact Support</h2>
                        <p>If you can't find the answer you're looking for, reach out to our support team.</p>
                        <button className="contact-support-btn">Contact Us</button>
                    </div>

                    <div className="user-guide-section">
                        <h2>User Guides & Tutorials</h2>
                        <div className="guide-list">
                            <div className="guide-item">
                                <img src="assets/guide_1.jpg" alt="Guide Title" />
                                <h3>How to Create an Event</h3>
                                <p>Step-by-step instructions on creating your first event on our platform.</p>
                                <button className="view-guide-btn">View Guide</button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </>
    )
}

export default HelpPage