import React from "react";
import { useNavigate } from "react-router-dom";
import "./PrivacyPage.css";

const PrivacyPage = () => {
  const navigate = useNavigate();

  return (
    <div className="pp-page">
      <div className="pp-hero">
        <div className="pp-hero-inner">
          <button className="pp-back" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <h1 className="pp-title">Privacy Policy</h1>
          <p className="pp-sub">
            We value your privacy. Below are the key points about how we handle
            your data when using संवाद.
          </p>
        </div>
      </div>

      <main className="pp-container">
        <section className="pp-card">
          <h2>Data Collection</h2>
          <p>
            We collect minimal information required to create and maintain your
            account (e.g., username and email). Messages exchanged through the
            chat are end-to-end encrypted and are not stored on our servers in
            readable form.
          </p>
        </section>

        <section className="pp-card">
          <h2>Encryption & Security</h2>
          <p>
            All conversations are protected using end-to-end encryption. Only
            the communicating parties can read message contents. We use
            industry-standard transport security for data in transit and follow
            best practices for protecting accounts and access.
          </p>
        </section>

        <section className="pp-card">
          <h2>Data Sharing</h2>
          <p>
            We do not sell or share personal data with third parties for
            advertising. We may share account information to comply with legal
            requests or to protect users' safety when required by law.
          </p>
        </section>

        <section className="pp-card">
          <h2>Retention</h2>
          <p>
            Messages are retained only for the period required to provide
            service functionality (delivery/sync) and then removed according to
            our retention policy. If you delete your account, we remove
            identifiable information subject to legal requirements.
          </p>
        </section>

        <details className="pp-accordion">
          <summary>Full Policy & Details</summary>
          <div className="pp-accordion-inner">
            <p>
              This demo policy is a starting point. For production, include:
            </p>
            <ul>
              <li>Exact encryption protocols used</li>
              <li>Third-party services and data processors</li>
              <li>How to request data deletion / export</li>
              <li>Contact & Data Protection Officer information</li>
            </ul>
          </div>
        </details>

        <section className="pp-contact">
          <h3>Questions?</h3>
          <p>
            For privacy concerns or data requests, email us at{" "}
            <a href="mailto:support@samvad.com">support@samvad.com</a> or visit{" "}
            <button className="pp-link-btn" onClick={() => navigate("/contact")}>
              Contact Page
            </button>
            .
          </p>
        </section>

        <footer className="pp-footer">
          <small>© 2025 संवाद — All rights reserved.</small>
        </footer>
      </main>
    </div>
  );
};

export default PrivacyPage;
