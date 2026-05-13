import React from 'react';
import Topbar from '../components/Topbar';
import UserImage from '../components/UserProfile';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import { useUserData } from '../hooks/useUserData';

function Feed({ setScreen }) {
  const { currentUser } = useAuth();
  const TEST_USER_ID = "5h6hhRoa2Ctg1oWG67fr";
  const targetUserId = currentUser?.uid || TEST_USER_ID;
  const { userData, loading } = useUserData(targetUserId);


  if (loading) return <Loader text="טוען את הפיד שלך... 🎓" />;

  return (
    <div className="ss2">
      {/*Topbar*/}
      <Topbar setScreen={setScreen} />

      <div className="body" style={{ display: 'flex', flex: 1, minHeight: 'calc(100vh - 56px)' }}>

        {/* Sidebar */}
        <div className="sidebar" style={{
          width: '260px',
          backgroundColor: '#F0F2FA',
          borderLeft: '0.5px solid rgba(44,62,122,0.1)',
          display: 'flex',
          flexDirection: 'column',
          padding: '20px 0'
        }}>

          {/* profile location*/}
          <div style={{
            padding: '0 20px 20px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderBottom: '1px solid rgba(44,62,122,0.1)',
            marginBottom: '20px'
          }}>
            <UserImage
              image={userData?.profileImage}
              fullName={userData?.fullName}
              onImageClick={() => setScreen('profile')}
            />
            <div style={{ marginTop: '12px', textAlign: 'center' }}>
              <span style={{ fontWeight: '700', color: '#2C3E7A', fontSize: '16px' }}>
                {userData?.fullName || "סטודנט/ית בקמפוס"}
              </span>
            </div>
          </div>

          {/* topbar*/}
          <div className="nav-item active" style={{ padding: '12px 24px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>🏠</span>
            <span style={{ fontWeight: '600' }}>פיד ראשי</span>
          </div>

          <div className="nav-item" style={{ padding: '12px 24px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>📚</span>
            <span>הקורסים שלי</span>
          </div>

          <div className="nav-item" style={{ padding: '12px 24px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>👥</span>
            <span>חיפוש שותפים</span>
          </div>

          <div className="nav-item" style={{ padding: '12px 24px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>💬</span>
            <span>הודעות</span>
          </div>

          {/* profile button*/}
          <div
            className="nav-item profile-link"
            onClick={() => setScreen('profile')}
            style={{
              marginTop: 'auto',
              padding: '15px 24px',
              borderTop: '1px solid rgba(44,62,122,0.1)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: 'rgba(79, 70, 229, 0.05)'
            }}
          >
            <span style={{ fontSize: '20px' }}>👤</span>
            <span style={{ color: '#4F46E5', fontWeight: '700' }}>הפרופיל שלי</span>
          </div>
        </div>

        {/* Main Content) */}
        <div className="main-content" style={{ flex: 1, padding: '40px', backgroundColor: '#F7F8FC' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <h2 style={{ margin: 0, color: '#1A1A2E', fontSize: '24px', fontWeight: '700' }}>הפיד שלי</h2>
            <button className="primary-btn" style={{ width: 'auto', padding: '10px 25px' }}>
              + פוסט חדש
            </button>
          </div>

          {/* posts area*/}
          <div style={{
            background: 'white',
            padding: '60px',
            borderRadius: '16px',
            textAlign: 'center',
            boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
            border: '1px dashed #D1D5DB'
          }}>
            <p style={{ color: '#6B7280', fontSize: '18px' }}>
              כאן יופיעו הפוסטים והעדכונים של הסטודנטים בקמפוס. <br />

            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Feed;