# Antesala Reservations - DEMO VERSION

This is a **DEMO VERSION** of the Antesala Reservations system, created for portfolio showcase purposes.

## ⚠️ Important Notes

- **ALL DATA IS FICTIONAL** - No real client information is displayed
- **Firebase is completely disabled** - No database connection
- **Data is stored locally** using browser localStorage only
- **Sample reservations** are pre-loaded for demonstration
- This version **cannot access or modify** the production database

## 🎯 Purpose

This demo version is designed to showcase the application's features and functionality without exposing any sensitive information or connecting to production systems.

## 🚀 How to Use

1. Simply open `index.html` in a web browser
2. The demo banner at the top indicates this is a demonstration version
3. Sample reservations are automatically loaded
4. You can create, edit, and delete reservations (stored locally only)
5. All features work exactly like the production version, but with fictional data

## 📁 Files Included

- `index.html` - Main application file (Firebase scripts removed)
- `script.js` - Application logic (always runs in demo mode)
- `styles.css` - Styling (identical to production)
- `firebase-config.js` - Firebase configuration (Firebase disabled)
- `Logo_Antesala-removebg-preview.png` - Logo image

## 🔒 Security Features

- Firebase SDK scripts are commented out
- Firebase initialization is disabled
- Demo mode is hardcoded to `true`
- Uses separate localStorage key (`antesalaReservations_demo`)
- All reservations are marked with `isDemo: true` flag
- No network requests to production database

## 📊 Sample Data

The demo includes 3 pre-loaded sample reservations:
- Demo Client One - Wedding event
- Demo Client Two - Birthday event  
- Demo Client Three - Pharmaceutical company event

All contact information, emails, and phone numbers are fictional.

## 🛠️ Technical Details

- **No Backend Required** - Runs entirely in the browser
- **LocalStorage Only** - All data persists in browser storage
- **No External Dependencies** - Except for CDN libraries (fonts, icons, PDF generation)
- **Fully Functional** - All features work except database sync

## 📝 For Portfolio

This demo version is safe to:
- ✅ Host on GitHub Pages
- ✅ Deploy to any static hosting service
- ✅ Share with potential employers/clients
- ✅ Include in your portfolio

The original production version remains completely separate and unaffected.

---

**Note:** This is a demonstration version. For the production application, please use the files in the parent directory.

