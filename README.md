# 🌲 Pinea

Pinea is a suite of browser-based productivity tools designed to help you work with digital documents efficiently and privately.

![Pinea Social](https://github.com/user-attachments/assets/3d8ea20f-1e61-4711-8346-c35c70a93043)

## 🛠️ Tools

### Image to PDF Converter
Convert multiple images into a single PDF document - all in your browser.
- **Drag & Drop Interface**: Easily add images by dragging them into the app
- **Image Reordering**: Arrange your images in any order by dragging them
- **Client-side Processing**: No server uploads, complete privacy
- **Environmental Impact**: See how many trees you're saving by going digital
- **Instant Download**: Get your PDF immediately after conversion

### PDF to JPEG Converter
Extract pages from PDFs as JPEG images.
- **Client-side Processing**: Everything happens in your browser
- **Batch Export**: Convert all pages at once
- **High Quality**: Maintain image quality during conversion

### Sparrow - PDF Commenting
Collaborate on PDF documents with team members through real-time commenting.
- **Position-based Comments**: Click anywhere on the PDF to add comments
- **Draggable Markers**: Reposition comment markers by dragging them
- **Real-time Collaboration**: Multiple users can comment simultaneously
- **Resolved Comments**: Mark comments as resolved with checkmarks
- **Page Thumbnails**: Quick navigation with thumbnail preview sidebar
- **User Authentication**: Secure login system with JWT tokens
- **Email Notifications**: Get notified when new comments are added

## ✨ Key Features

- **Privacy-First**: Core tools process everything client-side (except Sparrow which requires backend for collaboration)
- **Modern UI**: Clean, intuitive interface with Pinea's warm beige design system
- **Modular Architecture**: Each app is self-contained and independently maintainable
- **TypeScript**: Full type safety across the entire codebase

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL (only if using Sparrow)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/pwmikolajek/pinea.git
   cd pinea
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

### Setting up Sparrow (Optional)

Sparrow requires a separate backend for collaboration features.

1. Navigate to the backend directory:
   ```bash
   cd "/path/to/Sparrow v2/backend"
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Set up PostgreSQL database:
   ```bash
   createdb pdf_comments
   ```

4. Create `.env` file in the backend directory:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/pdf_comments
   JWT_SECRET=your-secret-key
   PORT=5001
   ```

5. Start the backend server:
   ```bash
   npm start
   ```

6. Create `.env` file in Pinea root directory:
   ```
   VITE_SPARROW_API_URL=http://localhost:5001/api
   ```

7. Restart the Pinea dev server to use Sparrow

## 🛠️ Building for Production

To create a production build:

```bash
npm run build
# or
yarn build
```

The build files will be in the `dist` directory, ready to be deployed to any static hosting service.

## 🧪 Technologies Used

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **Tailwind CSS** - Styling
- **React Router v6** - Routing
- **PDF.js** - PDF rendering
- **jsPDF** - PDF generation
- **JSZip** - ZIP file handling
- **Lucide React** - Icons
- **dnd-kit** - Drag and drop

### Backend (Sparrow only)
- **Node.js + Express** - API server
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Nodemailer** - Email notifications

## 📁 Project Structure

```
src/
├── apps/                    # Self-contained applications
│   └── sparrow/            # PDF Commenting app
│       ├── components/     # Sparrow-specific components
│       ├── pages/         # Sparrow pages
│       ├── contexts/      # Authentication context
│       ├── services/      # API calls
│       ├── types/         # TypeScript types
│       └── routes.tsx     # Sparrow routing
├── components/             # Shared components
├── pages/                  # Core Pinea pages
│   ├── LandingPage.tsx    # Main landing page
│   ├── PdfToJpeg.tsx      # PDF to JPEG converter
│   └── ...
├── App.tsx                 # Image to PDF converter
└── main.tsx                # Main entry point
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed architecture documentation.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🌍 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests to help improve Pinea.

---

Built with 💚 for productivity and privacy
