import React from "react";
import "../../assets/styles/alert.css";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const Alert = ({ type, message, detail, source, timestamp, resolved, onResolve, onDelete }) => {
  // Get the appropriate alert class based on type and resolution status
  const getAlertClass = () => {
    let baseClass = "";

    switch (type) {
      case "Error":
        baseClass = "alert-error";
        break;
      case "Warning":
        baseClass = "alert-warning";
        break;
      case "Info":
        baseClass = "alert-info";
        break;
      default:
        baseClass = "alert-unresolved";
    }

    return resolved ? `${baseClass} alert-resolved` : baseClass;
  };

  // Get the appropriate icon based on alert type
  const getAlertIcon = () => {
    switch (type) {
      case "Error":
        return <span className={!resolved ? "blinking-icon" : ""}><ErrorOutlineIcon fontSize="small" /></span>;
      case "Warning":
        return <span className={!resolved ? "blinking-icon" : ""}><WarningAmberIcon fontSize="small" /></span>;
      case "Info":
            return <InfoOutlinedIcon fontSize="small" />;
      default:
        return <CheckCircleOutlineIcon fontSize="small" />;
    }
  };

  // Format timestamp if available
  const formatTimestamp = () => {
    if (!timestamp) return "";
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch (e) {
      return timestamp;
    }
  };

  return (
    <div className={`alert-container ${getAlertClass()}`} style={{ position: "relative" }}>
      {/* Sağ üst köşe: Kök neden */}
      {source && (
        <div
          style={{
            position: "absolute",
            top: 8,
            right: 16,
            fontSize: 12,
            color: "#888",
            fontWeight: 600,
            background: "#f3f3f3",
            borderRadius: 6,
            padding: "2px 8px",
            zIndex: 2,
          }}
        >
          {source}
        </div>
      )}
      <div className="alert-icon">
        {getAlertIcon()}
      </div>
      <div className="alert-content">
        <div className="alert-message">{message}</div>
        {detail && <div className="alert-detail">{detail}</div>}

        <div className="alert-meta">
          {/* source burada tekrar gösterilmesin */}
          {timestamp && <span className="alert-timestamp">{formatTimestamp()}</span>}
        </div>

        <div className="alert-actions">
          {!resolved && (
            <button
              className="alert-action-button alert-resolve-button"
              onClick={onResolve}
            >
              Çöz
            </button>
          )}
          <button
            className="alert-action-button alert-delete-button"
            onClick={onDelete}
          >
            Sil
          </button>
        </div>
      </div>
    </div>
  );
};

export default Alert;
