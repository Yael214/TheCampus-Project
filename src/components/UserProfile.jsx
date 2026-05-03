import React, { useState } from 'react';

const UserProfile = () => {
    // נתוני דמה - בהמשך זה יגיע מפיירבייס
    const [user, setUser] = useState({
        name: "יעל אמיתי",
        university: "האוניברסיטה הפתוחה",
        avatar: "https://via.placeholder.com/150",
        courses: [
            { id: 1, name: "מבני נתונים", status: "בביצוע" },
            { id: 2, name: "מבוא למדעי המחשב", status: "סויים" },
            { id: 3, name: "אינפי 1", status: "בביצוע" }
        ]
    });

    const toggleCourseStatus = (courseId) => {
        // לוגיקה זמנית לשינוי סטטוס
        const updatedCourses = user.courses.map(course =>
            course.id === courseId
                ? { ...course, status: course.status === "בביצוע" ? "סויים" : "בביצוע" }
                : course
        );
        setUser({ ...user, courses: updatedCourses });
    };

    return (
        <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-xl dir-rtl text-right">
            {/* Header - פרטי משתמש */}
            <div className="flex flex-row-reverse items-center gap-6 border-b pb-6">
                <img src={user.avatar} alt="Profile" className="w-24 h-24 rounded-full border-4 border-blue-500" />
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">{user.name}</h1>
                    <p className="text-gray-500 text-lg">{user.university}</p>
                </div>
            </div>

            {/* רשימת קורסים */}
            <div className="mt-8">
                <h2 className="text-2xl font-semibold mb-4 text-blue-600">הקורסים שלי</h2>
                <div className="grid gap-4">
                    {user.courses.map(course => (
                        <div key={course.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border hover:shadow-md transition">
                            <button
                                onClick={() => toggleCourseStatus(course.id)}
                                className={`px-4 py-2 rounded-full font-medium transition ${course.status === "סויים"
                                    ? "bg-green-100 text-green-700 border border-green-500"
                                    : "bg-blue-500 text-white hover:bg-blue-600"
                                    }`}
                            >
                                {course.status === "סויים" ? "✓ סויים" : "סמן כסויים"}
                            </button>
                            <span className="text-xl text-gray-700 font-medium">{course.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default UserProfile;