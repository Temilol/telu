# Firebase Setup for Seating Chart

Your seating chart is now configured to automatically save to Firebase cloud storage! Follow these steps to set it up:

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter a project name (e.g., "wedding-seating-chart")
4. Follow the setup wizard (you can disable Google Analytics if you don't need it)

## Step 2: Enable Firestore Database

1. In your Firebase project, click "Firestore Database" in the left menu
2. Click "Create database"
3. Choose "Start in test mode" (we'll secure it later)
4. Select your preferred location
5. Click "Enable"

## Step 3: Get Your Firebase Configuration

1. In your Firebase project, click the gear icon ⚙️ next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon `</>` to add a web app
5. Register your app (name it anything, e.g., "Seating Chart")
6. Copy the Firebase configuration object that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123",
};
```

## Step 4: Add Configuration to Your Website

1. Open `seating/index.html` in your editor
2. Find the section that says `// TODO: Replace with your Firebase config`
3. Replace the placeholder config with your actual Firebase configuration
4. Save the file

The section looks like this:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

## Step 5: Set Firestore Security Rules

1. In Firebase Console, go to "Firestore Database"
2. Click on the "Rules" tab
3. Replace the rules with this:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow anyone to read the seating chart
    match /seating-charts/{document=**} {
      allow read: if true;
      // Only allow writes from authenticated users
      // For now, allow all writes (you can add authentication later)
      allow write: if true;
    }
  }
}
```

4. Click "Publish"

⚠️ **Security Note**: The above rules allow anyone to read and write. For production:

- Consider adding Firebase Authentication
- Restrict write access to authenticated admin users only
- Keep read access open for guest search functionality

## Step 6: Test It Out!

1. Open `seating/index.html` in your browser
2. Add or move a table
3. You should see a "Saved to Firebase!" notification
4. Refresh the page - your changes should persist!
5. Open the page on a different device - you'll see the same data!

## How Auto-Save Works

- Changes are automatically saved to Firebase 2 seconds after you:
  - Add a new table
  - Edit a table's guests
  - Delete a table
  - Move a table by dragging
  - Clear all tables

- You'll see a green notification when data is saved

## Troubleshooting

### Configuration not working?

- Check browser console (F12) for Firebase errors
- Verify your config values are correct (no quotes around values inside the object)
- Make sure Firestore is enabled in your Firebase project

### Data not persisting?

- Check Firestore rules are set correctly
- Look at "Firestore Database" in Firebase Console to see if data is being saved
- The document should appear under: `seating-charts/wedding-seating-chart`

### Need to reset everything?

- Go to Firestore Database in Firebase Console
- Delete the `wedding-seating-chart` document
- Refresh your webpage

## Optional: Add Authentication

To secure your seating chart for admin-only editing:

1. Enable Firebase Authentication in your project
2. Add sign-in UI to your admin page
3. Update Firestore rules to check for authentication:

```javascript
match /seating-charts/{document=**} {
  allow read: if true;
  allow write: if request.auth != null && request.auth.token.admin == true;
}
```

Need help? Check the [Firebase Documentation](https://firebase.google.com/docs/firestore)
