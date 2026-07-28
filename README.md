[עברית](README.he.md) | **English**

---

# TheCampus 🎓 | Academic Social Network for Students

Final project for the **"Workshop in Cloud and Web Application Development" (20995)** course  
The Open University of Israel – Semester 2026B  

---

## 📌 About the Project
**"TheCampus"** is an academic social platform designed for university students, facilitating connections based on enrolled courses and geographic location.  
Key features include:
- **Course Forums & Personal Feed:** Engage in course-specific forums, create posts, and write nested comments.
- **Course Materials Management:** Upload, save, and organize study materials (PDFs, images, videos) directly in course repositories.
- **Study Partner Matcher (Google Maps API):** An interactive map to discover nearby students filtered by radius, shared courses, age, and gender.
- **Authentication & User Management:** Secure student authentication, role-based access control (Student / Admin), and personal profile customization.

---

## 🛠️ Tech Stack & Architecture
The application is built on a full **Serverless** architecture utilizing Firebase and Google Cloud Platform services:

- **Frontend:** React (Vite), CSS, React Router DOM, @vis.gl/react-google-maps.
- **Backend & Cloud Infrastructure:**
  - **Firebase Authentication:** Handles user sign-up, login, and identity verification.
  - **Cloud Firestore:** Real-time NoSQL database managing users, forums, posts, comments, and study resources.
  - **Firebase Storage:** Cloud storage for document attachments and profile pictures.
  - **Firebase Security Rules:** Cloud-level data protection and access authorization.

---

## 🔒 Security & Firebase Rules
Database (Firestore) and file storage (Storage) authorization policies are configured directly in Firebase Cloud.  
For review and assessment purposes, copies of the rule definitions are included in the repository:
- `firestore.rules` – Read/write access and authorization logic for Firestore collections.
- `storage.rules` – Access control and file upload restrictions for Firebase Storage.

---

## 🚀 Getting Started & Local Setup

### Prerequisites:
- **Node.js** (v18 or higher recommended).

### Running the Application:

1. **Navigate to the Client Directory:**
   Open a terminal in the project root folder and change directory to `client`:
   ```bash
   cd client
   ```
2. **Install Dependencies:**
  ```bash
  npm install
  ```
3. **Start the Development Server:**
  ```bash
  npm run dev 
```
  After running the command, a local URL (usually http://localhost:5173) will appear in the terminal – open it in your web browser to access the application.

---

## 🔑 Test Credentials

For quick evaluation without going through registration, you can use the pre-configured test accounts:

1. Admin User:
    * **Email**: naama9171@gmail.com
    * **Password**: Naama@1020
2. Regular User:
    * **Email**: naamatzadok10@gmail.com
    * **Password**: Test123456

(You may also register a new account via the sign-up page in the app).

---

## 👥 Team Members

* [Yael Amitai](https://github.com/Yael214)
* [Hodiyа Ben Chaim](https://github.com/HodayaBenChaim)
* [Shani Ben Zichri](https://github.com/shanni213)
* [Avital Hovari](https://github.com/avital3278)
* [Naama Tzadok](https://github.com/NaamaTzadok)

---

## 📑 Presentations & Video Demo
[Google Drive Folder Link](https://drive.google.com/drive/folders/1PTHNE_TLELR0fQqK9V5aeOGhMjavlbc-?usp=drive_link)