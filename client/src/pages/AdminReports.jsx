import React, { useState, useEffect } from 'react';
import { collectionGroup, getDocs, query, orderBy, doc, getDoc, deleteDoc, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import PostContainer from '../components/PostContainer';
import { handleDeletePost } from '../utils/postDeleteUtils';

function AdminReports({ onBack }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedContent, setSelectedContent] = useState(null);
  const [contentLoading, setContentLoading] = useState(false);

  // Fetch all pending reports across the system using collection group queries
  const fetchReports = async () => {
    try {
      setLoading(true);
      const reportsQuery = query(collectionGroup(db, "reports"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(reportsQuery);
      
      const reportsList = querySnapshot.docs.map(reportDoc => {
        const authorId = reportDoc.ref.parent.parent ? reportDoc.ref.parent.parent.id : null;
        return {
          reportId: reportDoc.id,
          authorId,
          ...reportDoc.data()
        };
      });

      setReports(reportsList);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Retrieve reported content (post or comment) for admin preview
  const handleOpenContent = async (report) => {
    if (!report.targetId) return;
    setContentLoading(true);
    setSelectedContent({ report, data: null });

    try {
      if (report.targetType === 'post') {
        const postDoc = await getDoc(doc(db, 'posts', report.targetId));
        if (postDoc.exists()) {
          setSelectedContent({ report, data: { postId: postDoc.id, ...postDoc.data() }, notFound: false });
        } else {
          setSelectedContent({ report, data: null, notFound: true });
        }
      } else {
        let commentDoc = null;
        
        // Direct fetch if postId is available in the report document
        if (report.postId) {
          commentDoc = await getDoc(doc(db, 'posts', report.postId, 'comments', report.targetId));
        }

        // Fallback: Global search using collectionGroup if postId is missing or invalid
        if (!commentDoc || !commentDoc.exists()) {
          const commentsSnap = await getDocs(query(collectionGroup(db, 'comments'), where('commentId', '==', report.targetId)));
          if (!commentsSnap.empty) {
            commentDoc = commentsSnap.docs[0];
            report.postId = commentDoc.ref.parent.parent.id;
          }
        }

        if (commentDoc && commentDoc.exists()) {
          setSelectedContent({ report, data: { commentId: commentDoc.id, ...commentDoc.data() }, notFound: false });
        } else {
          setSelectedContent({ report, data: null, notFound: true });
        }
      }
    } catch (error) {
      console.error("Error fetching target content:", error);
      setSelectedContent({ report, data: null, notFound: true });
    } finally {
      setContentLoading(false);
    }
  };

  // Dismiss report without deleting the actual content
  const handleDeleteReportOnly = async (authorId, reportId) => {
    if (!window.confirm("האם למחוק את הדיווח מהרשימה?")) return;
    try {
      await deleteDoc(doc(db, "users", authorId, "reports", reportId));
      setReports(reports.filter(r => r.reportId !== reportId));
    } catch (error) {
      console.error("Error deleting report:", error);
    }
  };

  // Complete removal of reported content and its associated report
  const handleDeleteReportedContent = async (report) => {
    const { targetId, targetType, authorId, reportId, postId } = report;
    const contentHebrewName = targetType === 'post' ? 'פוסט' : 'תגובה';

    if (!window.confirm(`האם את בטוחה שברצונך למחוק את ה${contentHebrewName} המדווח/ת לחלוטין מהמערכת?`)) return;

    try {
      if (targetType === 'post') {
        const postDocRef = doc(db, 'posts', targetId);
        const postSnap = await getDoc(postDocRef);

        if (postSnap.exists()) {
          const postData = { postId: postSnap.id, ...postSnap.data() };
          
          let deleteFilesPermanently = false;
          if (postData.attachments && postData.attachments.length > 0) {
            deleteFilesPermanently = window.confirm(
              "האם למחוק גם את הקבצים המצורפים לפוסט הזה לצמיתות (כולל מחומרי הלימוד של הקורס)?"
            );
          }

          await handleDeletePost(postData, deleteFilesPermanently);
        } else {
          await deleteDoc(postDocRef);
        }
      } else { 
        let targetPostId = postId;
        if (!targetPostId) {
          const commentsSnap = await getDocs(query(collectionGroup(db, 'comments'), where('commentId', '==', targetId)));
          if (!commentsSnap.empty) {
            targetPostId = commentsSnap.docs[0].ref.parent.parent.id;
          }
        }

        if (targetPostId) {
          await deleteDoc(doc(db, 'posts', targetPostId, 'comments', targetId));
        }
      }

      await deleteDoc(doc(db, "users", authorId, "reports", reportId));
      
      setReports(reports.filter(r => r.reportId !== reportId));
      setSelectedContent(null);
      alert(`ה${contentHebrewName} והדיווח נמחקו בהצלחה.`);
    } catch (error) {
      console.error("Error deleting reported content:", error);
      alert("שגיאה במחיקת התוכן. נסי שוב.");
    }
  };

  if (loading) return <div className="p-6 text-center" dir="rtl">טוען דיווחים...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#2C3E7A]">דיווחים על תוכן ממתינים לטיפול</h1>
        <button 
          onClick={onBack}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl text-sm font-semibold transition cursor-pointer"
        >
          ← חזרה לניהול משתמשים
        </button>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="w-full text-right border-collapse">
          <thead className="bg-[#F0F2FA]">
            <tr>
              <th className="p-4 border-b font-semibold text-gray-700">סוג תוכן</th>
              <th className="p-4 border-b font-semibold text-gray-700">סיבת דיווח</th>
              <th className="p-4 border-b font-semibold text-gray-700">מזהה תוכן</th>
              <th className="p-4 border-b font-semibold text-gray-700">סטטוס</th>
              <th className="p-4 border-b font-semibold text-gray-700">פעולות ניהול</th>
            </tr>
          </thead>
          <tbody>
            {reports.length > 0 ? (
              reports.map(report => (
                <tr key={report.reportId} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-gray-800">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${report.targetType === 'post' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                      {report.targetType === 'post' ? 'פוסט' : 'תגובה'}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-700 max-w-xs truncate">{report.details}</td>
                  <td className="p-4 text-xs font-mono">
                    <button 
                      onClick={() => handleOpenContent(report)}
                      className="text-blue-600 hover:text-blue-800 underline font-semibold cursor-pointer bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-md transition"
                      title="לחץ לצפייה בתוכן המדווח"
                    >
                      ID: {report.targetId?.slice(0, 8)}... 🔍
                    </button>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                      {report.status || 'pending'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2 items-center">
                      <button 
                        onClick={() => handleDeleteReportedContent(report)}
                        className="px-3 py-1.5 rounded-lg text-white text-xs font-medium bg-red-500 hover:bg-red-600 transition-colors cursor-pointer"
                      >
                        מחק תוכן מדווח
                      </button>
                      <button 
                        onClick={() => handleDeleteReportOnly(report.authorId, report.reportId)}
                        className="px-3 py-1.5 rounded-lg text-white text-xs font-medium bg-gray-400 hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        התעלם / מחק דיווח
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500">אין דיווחים ממתינים במערכת. הכל נקי! 🎉</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedContent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 relative max-h-[90vh] overflow-y-auto" dir="rtl">
            <button 
              onClick={() => setSelectedContent(null)}
              className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 text-xl font-bold cursor-pointer"
            >
              ✕
            </button>
            
            <h3 className="text-lg font-bold text-[#2C3E7A] mb-4">
              {selectedContent.report.targetType === 'post' ? '📄 תצוגת פוסט מדווח' : '💬 תצוגת תגובה מדווחת'}
            </h3>

            {contentLoading ? (
              <div className="py-12 text-center text-gray-500">טוען את פרטי התוכן...</div>
            ) : selectedContent.notFound ? (
              <div className="py-8 text-center text-red-500 bg-red-50 rounded-xl space-y-2">
                <p>התוכן המדווח לא נמצא או שכבר נמחק ממסד הנתונים.</p>
                <p className="text-xs text-gray-500 font-mono">מזהה: {selectedContent.report.targetId}</p>
              </div>
            ) : (
              <div>
                {selectedContent.report.targetType === 'post' ? (
                  <PostContainer post={selectedContent.data} isAdmin={true} showForumLink={true} />
                ) : (
                  <div className="bg-amber-50 p-5 rounded-xl border border-amber-200 shadow-sm space-y-3">
                    <div className="flex justify-between items-center text-xs text-amber-700 border-b border-amber-200 pb-2">
                      <span>מזהה תגובה: <span className="font-mono">{selectedContent.data.commentId}</span></span>
                      <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-semibold">תגובה מדווחת</span>
                    </div>
                    <p className="text-gray-800 text-sm whitespace-pre-wrap leading-relaxed">
                      {selectedContent.data.text || selectedContent.data.content || 'אין תוכן להצגה'}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button 
                onClick={() => setSelectedContent(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl text-sm font-semibold transition cursor-pointer"
              >
                סגור
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminReports;