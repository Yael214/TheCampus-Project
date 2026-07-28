const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// 1. Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function parseAndImportCourses() {
  try {
    // 2. Read the local HTML file as a raw binary buffer
    const fileBuffer = fs.readFileSync(path.join(__dirname, 'Courses_TheOU.html'));
    
    // 3. Decode the buffer using Windows-1255 encoding for Hebrew
    const decoder = new TextDecoder('windows-1255');
    const htmlContent = decoder.decode(fileBuffer);
    
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;

    // 4. Select elements inside the content container to parse sequentially
    // We scan rows, list items, and links in order to find our stop text exactly where it appears
    const allElements = document.querySelectorAll('table.links td a, h2, h3, p, b, strong');
    console.log('Scanning page elements sequentially for active courses...');

    let importedCount = 0;
    const adminUid = 'XAlLgb97rcPbnsRxMA0OR1s2hPH3';

    // 5. Loop through each element sequentially
    for (const element of allElements) {
        const textContent = element.textContent ? element.textContent.trim() : '';

        // DANGER ZONE FILTER: Stop IMMEDIATELY when reaching these specific section headers
        // This stops the script before importing inactive/removed courses at the bottom
        if (
            textContent === 'הוראת הקורס הופסקה זמנית:' || 
            textContent === 'קורסים שאינם מוצעים עוד:' ||
            textContent.includes('הוראת הקורס הופסקה זמנית') ||
            textContent.includes('קורסים שאינם מוצעים עוד')
        ) {
            // Quick safety check: make sure it's not a small text but an actual header row boundary
            if (element.tagName !== 'A') {
                console.log(`\n🛑 Reached inactive courses boundary section: "${textContent}". Stopping import loop.`);
                break; // Stop completely!
            }
        }

        // Process only if the current element is a valid link <a>
        if (element.tagName === 'A') {
            const codeSpan = element.querySelector('span[dir="ltr"]');
            const titleSpan = element.querySelector('span[dir="rtl"]');

            if (codeSpan && titleSpan) {
                // Clean parentheses from the course code
                const courseCode = codeSpan.textContent.replace(/[()]/g, '').trim();
                const courseTitle = titleSpan.textContent.trim();

                if (!courseCode || !courseTitle) continue;

                // 6. Reference to the document using courseCode as Document ID
                const forumRef = db.collection('forums').doc(courseCode);

                // Insert the document with the exact required fields
                await forumRef.set({
                    forumID: courseCode,
                    forumName: courseTitle,
                    category: 'course',
                    createdBy: adminUid,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    description: `פורום לשיתוף מידע על הקורס באוניברסיטה הפתוחה`
                });

                console.log(`✅ Forum created successfully: ${courseCode} - ${courseTitle}`);
                importedCount++;
            }
        }
    }
    
    console.log(`\n🎉 Import Process Finished Successfully!`);
    console.log(`Total active/in-development course forums imported to Firestore: ${importedCount}`);

  } catch (error) {
    console.error('❌ Error during script execution:', error);
  } finally {
    process.exit();
  }
}

// Run the script
parseAndImportCourses();