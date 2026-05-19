import { useState } from 'react';
import './MapPage.css'; 
import PartnerCard from './PartnerCard.jsx';
import MapContainer from '../components/map/MapContainer.jsx';
import { useNearbyUsers } from '../hooks/useNearbyUsers';

// Default center of the map, can be updated to user's location if available
const defaultCenter = { lat: 31.788, lng: 35.2112 };

function MapPage() {
  const [tempRadius, setTempRadius] = useState(10);
  const [searchRadius, setSearchRadius] = useState(10);

  const [selectedPartner, setSelectedPartner] = useState(null);
  // const [selectedCourse, setSelectedCourse] = useState('כל הקורסים'); // This state is for future implementation of course filtering
  const [selectedGender, setSelectedGender] = useState('הכל');

  // The hook to fetch nearby users based on location and radius
  const { nearbyUsers, loading, error } = useNearbyUsers(defaultCenter, searchRadius); 

  // Filter partners with valid location
  const filteredPartners = (nearbyUsers || []).filter(partner => {
    const matchesGender = selectedGender === 'הכל' || partner.gender === selectedGender;
    return matchesGender;
  });

  const handleSearchSubmit = () => {
    setSearchRadius(tempRadius); // רק עכשיו מתבצעת השליפה בפועל!
  };

  const handlePartnerSelect = (partner) => {
    if (!partner) return;
    
    // מעדכנים את הסטייט של השותף הנבחר
    setSelectedPartner(partner);

    // מוצאים את האלמנט לפי ה-ID הדינמי שלו ומבצעים גלילה חלקה
    const element = document.getElementById(`partner-card-${partner.id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

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
              {/* In the next sprint when we will implement courses... */}
              {/* <div className="field">
                <label>בחר קורס</label>
                <select defaultValue="כל הקורסים">
                  <option>כל הקורסים</option>
                  <option>אלגברה</option>
                  <option>מבוא לתכנות</option>
                  <option>פיזיקה</option>
                  <option>כימיה</option>
                  <option>ביולוגיה</option>
                </select>
              </div> */}

              <div className="field">
                <label>מגדר</label>
                <select defaultValue="הכל">
                  <option>הכל</option>
                  <option>נקבה</option>
                  <option>זכר</option>
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
                <label>רדיוס חיפוש: {tempRadius} ק"מ</label>
                <input 
                  type="range" min="1" max="50" value={tempRadius} 
                  onChange={(e) => setTempRadius(Number(e.target.value))} 
                />
              </div>
              
              <button className="btn" onClick={handleSearchSubmit} style={{ width: '100%', marginTop: '10px', fontSize: '16px' }}>
                חפש
              </button>

            </div>
          </div>

          <div className="cards">
            {loading ? (
              <p>טוען שותפים...</p>
            ) : filteredPartners.length === 0 ? (
              <p>לא נמצאו שותפים מתאימים.</p>
            ) : (
              filteredPartners.map((partner) => (
                <div 
                  id={`partner-card-${partner.id}`}
                  key={partner.id} onClick={() => setSelectedPartner(partner)} 
                  style={{ 
                    cursor: 'pointer',
                    // אם כרטיס זה נבחר במפה, תופיע מסגרת כחולה יפה
                    border: selectedPartner?.id === partner.id ? '2px solid #007bff' : '2px solid transparent',
                    borderRadius: '8px',
                    transition: 'all 0.3s ease',
                    marginBottom: '10px'
                  }}>
                  <PartnerCard 
                    name={partner.fullName} 
                    // אם יש לכן מרחק אמיתי נציג אותו, אחרת נרשום משהו הגיוני
                    distance={partner.distance.toFixed(2)} 
                    // מוודא שהתגים (הקורסים) מועברים כמערך, ומטפלים במצב שהשדה ריק
                    tags={partner.tags && partner.tags.length > 0 ? partner.tags : ['אין קורסים משותפים']} 
                  />
                </div>
              ))
            )}
          </div>
        </section>

        <aside className="map-panel">
          <div className="map-box">
            <MapContainer 
              center={defaultCenter}
              partners={filteredPartners} 
              selectedPartner={selectedPartner}
              onPartnerSelect={setSelectedPartner}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}

export default MapPage;