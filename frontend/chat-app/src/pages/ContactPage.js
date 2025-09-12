import React from "react";
import { useNavigate } from "react-router-dom";
import "./ContactPage.css";

const ContactPage = () => {
  const navigate = useNavigate();

  return (
    <div className="cp-page">
      <div className="cp-hero">
        <div className="cp-hero-inner">
          <button className="cp-back" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <h1 className="cp-title">Contact Us</h1>
          <p className="cp-sub">
            Got questions? Reach out anytime — we’d love to hear from you.
          </p>
        </div>
      </div>

      <main className="cp-container">
        <section className="cp-card">
          <h2>Email Support</h2>
          <p>
            A mail id will be available soon for direct messages. Stay
            tuned!
          </p>

        </section>

        <section className="cp-card">
          <h2>Contact Form</h2>
          <p>
            A simple form will be available soon for direct messages. Stay
            tuned!
          </p>
        </section>

        <section className="cp-card">
          <h2>Community</h2>
          <p>
            Join our community channels (coming soon) to connect with other
            users and get quick help.
          </p>
        </section>

        <footer className="cp-footer">
          <small>© 2025 संवाद — All rights reserved.</small>
        </footer>
      </main>
    </div>
  );
};

export default ContactPage;
