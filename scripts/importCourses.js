/**
 * @file importCourses.js
 * @description Utility script to parse an HTML course list from The Open University,
 * extract active course details, and populate Firestore 'forums' collection.
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

/**
 * Reads local HTML file, decodes Windows-1255 encoding, parses course details,
 * and creates corresponding forum documents in Firestore.
 */
async function parseAndImportCourses() {
  try {
    // 1. Read the local HTML file as a raw binary buffer
    const fileBuffer = fs.readFileSync(path.join(__dirname, 'Courses_TheOU.html'));
    
    // 2. Decode the buffer using Windows-1255 encoding for Hebrew characters
    const decoder = new TextDecoder('windows-1255');
    const htmlContent = decoder.decode(fileBuffer);
    
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;

    // 3. Select DOM elements sequentially to detect boundary markers accurately
    const allElements = document.querySelectorAll('table.links td a, h2, h3, p, b, strong');
    console.log('Scanning page elements sequentially for active courses...');

    let importedCount = 0;
    const adminUid = 'XAlLgb97rcPbnsRxMA0OR1s2hPH3';

    // 4. Iterate through extracted elements
    for (const element of allElements) {
        const textContent = element.textContent ? element.textContent.trim() : '';

        // Boundary Check: Stop processing once inactive course headers are reached
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

        // 5. Process valid anchor elements containing course code and title
        if (element.tagName === 'A') {
            const codeSpan = element.querySelector('span[dir="ltr"]');
            const titleSpan = element.querySelector('span[dir="rtl"]');

            if (codeSpan && titleSpan) {
                // Clean parentheses from the course code
                const courseCode = codeSpan.textContent.replace(/[()]/g, '').trim();
                const courseTitle = titleSpan.textContent.trim();

                if (!courseCode || !courseTitle) continue;

                // Reference Firestore document using course code as ID
                const forumRef = db.collection('forums').doc(courseCode);

                // Populate Firestore document
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

// Execute course import
parseAndImportCourses();