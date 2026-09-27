import React, { useState, useEffect } from 'react';
import { ANNOUNCEMENT_ITEMS } from '../../config/brand.config';
import './TopAnnouncementBar.css';

export const TopAnnouncementBar: React.FC = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % ANNOUNCEMENT_ITEMS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="announcement-bar" role="region" aria-label="Announcement">
      <div className="container announcement-inner">
        <span className="announcement-actions">
          <span>GLOBAL COURIER</span>
        </span>
        <div className="announcement-text" key={index}>
          {ANNOUNCEMENT_ITEMS[index]}
        </div>
        <div className="announcement-actions">
          <a href="#currency">USD ($)</a>
          <a href="#help">Client Services</a>
        </div>
      </div>
    </div>
  );
};
