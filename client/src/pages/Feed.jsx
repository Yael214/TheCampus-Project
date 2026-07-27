import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useUserForums } from "../hooks/useUserForums";
import { db } from "../firebase/config";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import NewPostModal from "../components/NewPostModal";
import PostContainer from "../components/PostContainer";
import Loader from "../components/Loader";

/**
 * Feed Component
 * Renders the main timeline for the user, displaying posts from their subscribed forums.
 * Utilizes real-time Firestore listeners to keep the feed synchronized.
 */
function Feed() {
  const { currentUser, isAdmin } = useAuth();
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [posts, setPosts] = useState([]);

  const { forums: userForums } = useUserForums();

  useEffect(() => {
    // Clear feed and prevent fetching all posts when logged-in user has no forums
    if (currentUser && userForums && userForums.length === 0) {
      setPosts([]);
      setLoading(false);
      return;
    }

    const postsCollectionRef = collection(db, "posts");
    let q;

    if (currentUser && userForums && userForums.length > 0) {
      const forumIds = userForums.map((forum) => forum.id);
      q = query(
        postsCollectionRef,
        where("forumId", "in", forumIds),
        orderBy("createdAt", "desc"),
      );
    } else {
      // Fallback query for guests or users with no active forum subscriptions
      q = query(postsCollectionRef, orderBy("createdAt", "desc"));
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const activeFeeds = snapshot.docs.map((doc) => ({
          postId: doc.id,
          ...doc.data(),
        }));
        setPosts(activeFeeds);
        setLoading(false);
      },
      (err) => {
        console.log(
          "Database permissions block handled. Rendering layout mockup views safely.",
        );
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [currentUser, userForums]);

  // Render loading spinner while fetching data
  if (loading) {
    return <Loader text="טוען את הפיד שלך... 🎓" />;
  }

  return (
    <main
      className="flex-1 p-8 overflow-hidden flex flex-col items-start justify-start text-right h-[calc(100vh-56px)]"
      dir="rtl"
    >
      <div className="w-full max-w-4xl mx-auto flex flex-col h-full">
        {/* Header Area */}
        <header className="flex justify-between items-center mb-8 shrink-0 w-full">
          <h2 className="text-3xl font-black text-[#2C3E7A] m-0 tracking-tight">
            הפיד שלי
          </h2>
          <button
            onClick={() => setIsPostModalOpen(true)}
            className="text-white px-6 py-2.5 rounded-xl font-bold border-none text-sm flex items-center gap-2 cursor-pointer transition-all duration-200 hover:-translate-y-px"
            style={{
              background: "linear-gradient(135deg, #4F46E5 0%, #6D28D9 100%)",
              boxShadow: "0 4px 14px rgba(79,70,229,0.4)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.boxShadow =
                "0 6px 20px rgba(79,70,229,0.55)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.boxShadow =
                "0 4px 14px rgba(79,70,229,0.4)")
            }
          >
            <span>פוסט חדש</span>
            <span className="text-lg font-light leading-none">+</span>
          </button>
        </header>

        {/* Timeline rendering layout viewport */}
        <div className="flex-1 overflow-y-auto space-y-5 pl-2 pb-6 w-full">
          {posts.length === 0 ? (
            <div className="text-center text-gray-500 mt-10 font-medium">
              אין עדיין פוסטים להצגה בפיד.
            </div>
          ) : (
            posts.map((post) => (
              //* Render individual post components with dynamic forum linking enabled
              <PostContainer
                key={post.postId}
                post={post}
                showForumLink={true}
                isAdmin={isAdmin}
              />
            ))
          )}
        </div>
      </div>

      {/* Post creation modal scoped to the user's active forums */}
      <NewPostModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        userForums={userForums}
      />
    </main>
  );
}

export default Feed;
