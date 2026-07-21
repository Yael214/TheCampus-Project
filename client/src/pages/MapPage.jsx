import { useState, useEffect, useRef, useMemo } from 'react';
import './MapPage.css'; 
import PartnerCard from './PartnerCard.jsx';
import MapContainer from '../components/map/MapContainer.jsx';
import { useNearbyUsers } from '../hooks/useNearbyUsers';
import { useAuth } from '../context/AuthContext.jsx';
import { LocationToggle } from '../components/LocationToggle.jsx';

const DEFAULT_CENTER = { lat: 31.788, lng: 35.2112 };

function MapPage() {
  // Get unified currentUser from context (includes auth + Firestore data)
  const { currentUser } = useAuth();
  const isDiscoverable = currentUser?.isDiscoverable ?? false;
  
  // Get user's location from currentUser, fallback to default if not available
  const userCenter = useMemo(() => {
    return currentUser?.location ? { lat: currentUser.location.lat, lng: currentUser.location.lng } : DEFAULT_CENTER;
  }, [currentUser?.location?.lat, currentUser?.location?.lng]);

  const [tempRadius, setTempRadius] = useState(10);
  const [searchRadius, setSearchRadius] = useState(null); // Initialized as null for lazy loading
  const [hasSearched, setHasSearched] = useState(false); // Track if user has initiated search

  const [selectedPartner, setSelectedPartner] = useState(null);
  // const [selectedCourse, setSelectedCourse] = useState('כל הקורסים'); // This state is for future implementation of course filtering
  const [selectedGender, setSelectedGender] = useState('הכל');
  const [selectedAge, setSelectedAge] = useState('הכל');
  
  // Track previous isDiscoverable value to detect actual toggles (not just re-renders)
  const prevIsDiscoverableRef = useRef(isDiscoverable);
  
  // Reset search and results only when user disables location sharing (true → false)
  useEffect(() => {
    if (prevIsDiscoverableRef.current === true && !isDiscoverable) {
      setSearchRadius(null);
      setHasSearched(false);
      setSelectedPartner(null);
    }
    prevIsDiscoverableRef.current = isDiscoverable;
  }, [isDiscoverable]);
  
  // Hook to fetch nearby users based on location and radius
  // Only runs if searchRadius is not null (i.e., after clicking search)
  const { nearbyUsers, loading, error } = useNearbyUsers(userCenter, searchRadius, currentUser?.uid); 

  // Filter partners with valid location
  const filteredPartners = (nearbyUsers || []).filter(partner => {
    const matchesGender = selectedGender === 'הכל' || partner.gender === selectedGender;
    
    // Age filtering logic
    let matchesAge = true;
    if (selectedAge !== 'הכל' && partner.age) {
      const age = partner.age;
      if (selectedAge === 'עד 18') matchesAge = age <= 18;
      else if (selectedAge === '18-24') matchesAge = age >= 18 && age <= 24;
      else if (selectedAge === '25-34') matchesAge = age >= 25 && age <= 34;
      else if (selectedAge === '35+') matchesAge = age >= 35;
    }
    
    return matchesGender && matchesAge;
  });

  const handleSearchSubmit = () => {
    if (!isDiscoverable) {
      return; // Cannot search if location sharing is not enabled
    }
    // Update the search radius which will trigger the useNearbyUsers hook to refetch data
    setSearchRadius(tempRadius);
    setHasSearched(true); // Mark that search was initiated
  };

  const handlePartnerSelect = (partner) => {
    if (!partner) return;
    
    // Set the selected partner in state to show the info window on the map and highlight the card in the sidebar
    setSelectedPartner(partner);

    // Scroll the selected partner's card into view in the sidebar
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>סינון</h2>
              <LocationToggle initialStatus={currentUser?.isDiscoverable || false} />
            </div>
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
                <select value={selectedGender} onChange={(e) => setSelectedGender(e.target.value)}>
                  <option>הכל</option>
                  <option>נקבה</option>
                  <option>זכר</option>
                </select>
              </div>

              <div className="field">
                <label>טווח גילאים</label>
                <select value={selectedAge} onChange={(e) => setSelectedAge(e.target.value)}>
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
              
              <button 
                className="btn" 
                onClick={handleSearchSubmit} 
                disabled={!isDiscoverable}
                style={{ 
                  width: '100%', 
                  marginTop: '10px', 
                  fontSize: '16px',
                  backgroundColor: !isDiscoverable ? '#9CA3AF' : '',
                  cursor: !isDiscoverable ? 'not-allowed' : 'pointer'
                }}
              >
                חפש
              </button>

            </div>
          </div>

          <div className="cards">
            {!hasSearched && !isDiscoverable ? (
              <p>⚠️ אנא אשר שיתוף מיקום כדי לחפש שותפים.</p>
            ) : !hasSearched ? (
              null
            ) : loading ? (
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
                    // Highlight the card if it's the selected partner
                    border: selectedPartner?.id === partner.id ? '2px solid #007bff' : '2px solid transparent',
                    borderRadius: '8px',
                    transition: 'all 0.3s ease',
                    marginBottom: '10px'
                  }}>
                  <PartnerCard 
                    name={partner.fullName} 
                    distance={partner.distance.toFixed(2)} 
                    tags={partner.tags && partner.tags.length > 0 ? partner.tags : ['אין קורסים משותפים']} 
                    phone={partner.phone}
                  />
                </div>
              ))
            )}
          </div>
        </section>

        <aside className="map-panel">
          <div className="map-box">
            <MapContainer 
              center={userCenter || DEFAULT_CENTER}
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
