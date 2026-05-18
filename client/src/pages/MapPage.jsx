import React from 'react';
import './MapPage.css'; 
import PartnerCard from './PartnerCard.jsx';

const partnersData = [
  { id: 1, name: 'נעמה', distance: '1.0', tags: ['אלגברה', 'מבוא לתכנות'] },
  { id: 2, name: 'גיא לוי', distance: '1.5', tags: ['פיזיקה', 'כימיה'] },
  { id: 3, name: 'תמר רוזן', distance: '2.0', tags: ['ביולוגיה', 'אלגברה'] },
  { id: 4, name: 'אורי בר-לב', distance: '2.5', tags: ['מבוא לתכנות'] },
  { id: 5, name: 'דנה מלכה', distance: '3.0', tags: ['פיזיקה', 'אלגברה'] },
  { id: 6, name: 'שירה נווה', distance: '4.0', tags: ['ביולוגיה', 'מבוא לתכנות'] },
  { id: 7, name: 'מיה אדרי', distance: '4.5', tags: ['אלגברה', 'כימיה'] },
];

function MapPage() {
  return (
    <div className="page" dir="rtl">
      <header className="header">
        <div className="logo" onClick={() => window.location.href = '/feed'}>
          הקמפוס 🎓
        </div>
        <h1 className="title">מציאת פרטנר ללמידה</h1>
        <p className="subtitle">מצא שותפים לקורסים שלך על בסיס קירבה, מגדר וגיל.</p>
      </header>

      <div className="layout">
        <section className="sidebar">
          <div className="panel">
            <h2>סינון</h2>
            <p>בחר קורסים, מרחק וזמינות.</p>
            <div className="filters">
              <div className="field">
                <label>בחר קורס</label>
                <select defaultValue="כל הקורסים">
                  <option>כל הקורסים</option>
                  <option>אלגברה</option>
                  <option>מבוא לתכנות</option>
                  <option>פיזיקה</option>
                  <option>כימיה</option>
                  <option>ביולוגיה</option>
                </select>
              </div>

              <div className="field">
                <label>מגדר</label>
                <select defaultValue="הכל">
                  <option>הכל</option>
                  <option>נקבה</option>
                  <option>זכר</option>
                  <option>לא בינארי</option>
                </select>
              </div>

              <div className="field">
                <label>טווח גילאים</label>
                <select defaultValue="הכל">
                  <option>הכל</option>
                  <option>עד 18</option>
                  <option>18-24</option>
                  <option>25-34</option>
                  <option>35+</option>
                </select>
              </div>

              <div className="field">
                <label>מרחק מקסימלי (ק"מ)</label>
                <input type="number" placeholder="הכנס מרחק" />
              </div>
              
              {/* זה הכפתור החדש שהוספנו */}
              <button className="btn" style={{ width: '100%', marginTop: '10px', fontSize: '16px' }}>
                חפש
              </button>

            </div>
          </div>

          <div className="cards">
            {partnersData.map((partner) => (
              <PartnerCard 
                key={partner.id} 
                name={partner.name} 
                distance={partner.distance} 
                tags={partner.tags} 
              />
            ))}
          </div>
        </section>

        <aside className="map-panel">
          <div className="map-box">
            <iframe
              title="Google Maps"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3390.2749530304213!2d35.197019324918415!3d31.817504532402754!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1502d60f77d5d5b5%3A0xb9d57b41ac3916f4!2z16fXoNeZ15XXnyDXqNee15XXqg!5e0!3m2!1siw!2sil!4v1776183027765!5m2!1siw!2sil"
            ></iframe>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default MapPage;