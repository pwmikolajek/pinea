# Sparrow PDF Commenting Integration

Sparrow (PDF Commenting tool) has been successfully integrated into Pinea as part of the suite of tools.

## What Changed

1. **Landing Page**: "Meeting Notes Organizer" has been replaced with "PDF Commenting"
2. **New Routes**: Added routes for Sparrow login, registration, dashboard, and PDF viewer
3. **Authentication**: Integrated Sparrow authentication system with JWT tokens
4. **Styling**: Adapted Sparrow's UI to match Pinea's design system (green theme)
5. **TypeScript**: Converted all Sparrow JavaScript components to TypeScript

## Architecture

- **Frontend**: Fully integrated into Pinea (React + TypeScript + Vite)
- **Backend**: Runs separately (Node.js + Express + PostgreSQL)
- **AI Features**: Skipped as requested

## Setup Instructions

### 1. Backend Setup (Sparrow Server)

Navigate to your Sparrow v2 backend directory and start the server:

\`\`\`bash
cd "/Users/pawelmikolajek/Downloads/Sparrow v2/backend"
npm install
npm start
\`\`\`

The backend will run on `http://localhost:5000` by default.

### 2. Frontend Configuration

The frontend is already running. If you need to configure a different backend URL:

1. Create a `.env` file in the Pinea root directory:
\`\`\`bash
cp .env.example .env
\`\`\`

2. Edit `.env` and set your backend URL:
\`\`\`
VITE_SPARROW_API_URL=http://localhost:5000/api
\`\`\`

3. Restart the Vite dev server.

## How to Use

1. **Access PDF Commenting**: Go to http://localhost:5173/ and click on the "PDF Commenting" card
2. **Register/Login**: Create an account or login with existing credentials
3. **Upload PDFs**: Upload PDF files from the dashboard
4. **View & Comment**: Click "View & Comment" on any PDF to:
   - View the PDF in the browser
   - Click anywhere on the PDF to add a comment
   - View all comments in the sidebar
   - Mark comments as resolved
   - Edit/delete your own comments

## File Structure

\`\`\`
src/
├── contexts/
│   └── SparrowAuthContext.tsx        # Authentication context
├── services/
│   └── sparrowApi.ts                 # API service for backend calls
├── types/
│   └── sparrow.ts                    # TypeScript types
├── components/
│   └── pdf/
│       ├── PdfRenderer.tsx           # PDF viewer with commenting
│       └── PdfRenderer.css
├── pages/
│   ├── SparrowLogin.tsx              # Login page
│   ├── SparrowRegister.tsx           # Registration page
│   ├── SparrowDashboard.tsx          # Dashboard (PDF list)
│   ├── SparrowPdfViewer.tsx          # PDF viewer page
│   ├── SparrowAuth.css               # Auth page styles
│   ├── SparrowDashboard.css
│   └── SparrowPdfViewer.css
└── main.tsx                          # Routes with authentication
\`\`\`

## Features

- ✅ User authentication (register/login)
- ✅ Upload PDF files
- ✅ View PDFs in browser
- ✅ Position-based commenting
- ✅ Comment management (add/edit/delete)
- ✅ Mark comments as resolved
- ✅ Multiple users collaboration
- ✅ Responsive design
- ❌ AI-powered comment review (skipped)

## Notes

- Local storage keys use `sparrow_` prefix to avoid conflicts with other Pinea tools
- All PDF files and comments are stored on the backend server
- The frontend never stores PDF files locally
- Authentication tokens are stored in localStorage

## Troubleshooting

**Can't login?**
- Make sure the Sparrow backend is running
- Check that `VITE_SPARROW_API_URL` is set correctly
- Verify the backend database is set up (see Sparrow v2 README)

**CORS errors?**
- Ensure the backend CORS settings allow requests from `http://localhost:5173`

**PDF not loading?**
- Check browser console for errors
- Verify PDF file was uploaded successfully
- Ensure backend has proper file permissions for uploads directory
