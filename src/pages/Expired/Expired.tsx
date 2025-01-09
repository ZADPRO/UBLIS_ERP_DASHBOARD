// import { useNavigate } from "react-router-dom";
import "./Expired.css"; // Optional CSS file for custom styling
import React from "react";


const Expired: React.FC = () => {

      // const navigate = useNavigate();
    
      const handleLoginRedirect = () => {
        window.location.href = import.meta.env.VITE_SUB_API; // Navigate to the external URL
      };
      
      return (
        <div className="session-expired-container">
          <div className="session-expired-content">
            <h1>Session Expired</h1>
            <p>Your session has expired due to inactivity. Please log in again to continue.</p>
            <button className="login-button" onClick={handleLoginRedirect}>
              Log In Again
            </button>
          </div>
        </div>
      );
    };
    
    

export default Expired;