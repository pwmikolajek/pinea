# Pinea 🌲

**Simple, elegant tools that help you work more naturally with your digital content.**

Pinea is a suite of browser-based productivity tools designed to make digital work feel natural and enjoyable. All processing happens locally in your browser - your files never leave your device.

## Features

### 🐦 Bird-Themed Microtools

- **Robin** - Image to PDF Converter
- **Falcon** - PDF to JPEG Extractor
- **Sparrow** - Collaborative PDF Commenting
- **Swift** - YouTube Video Downloader

### 🔒 Privacy-First
All file processing happens entirely in your browser. No uploads, no servers, just pure client-side magic.

### 🌱 Eco-Friendly
Track the environmental impact of going digital. See how many trees you're saving by not printing.

### 🎨 Beautiful UI
Clean, intuitive interfaces built with Tailwind CSS and modern React patterns.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **PDF Processing**: pdf-lib, pdfjs-dist
- **Drag & Drop**: @dnd-kit
- **Backend**: Node.js, Express (for Swift - YouTube downloader)

## Project Structure

```
pinea/
├── src/
│   ├── apps/                    # Modular bird-themed applications
│   │   ├── robin/              # Image to PDF
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── utils/
│   │   │   └── types.ts
│   │   ├── falcon/             # PDF to JPEGs
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── utils/
│   │   │   └── types.ts
│   │   ├── sparrow/            # PDF Commenting
│   │   │   ├── components/
│   │   │   ├── contexts/
│   │   │   ├── pages/
│   │   │   ├── services/
│   │   │   └── types/
│   │   └── swift/              # YouTube Downloader
│   │       └── pages/
│   ├── core/                   # Shared resources
│   │   ├── assets/            # Images, icons
│   │   ├── components/        # Landing page, etc.
│   │   ├── styles/            # Global CSS
│   │   └── utils/             # Shared utilities
│   └── main.tsx               # App entry point
├── backend/                    # Swift backend (YouTube downloader)
└── public/                     # Static assets
```

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/pinea.git
   cd pinea
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies** (for Swift - YouTube downloader)
   ```bash
   cd backend
   npm install
   cd ..
   ```

## Usage

### Development

1. **Start the frontend dev server**
   ```bash
   npm run dev
   ```
   Open http://localhost:5173

2. **Start the backend server** (optional - only needed for Swift)
   ```bash
   cd backend
   node server.js
   ```
   Backend runs on http://localhost:5002

### Production

```bash
npm run build
npm run preview
```

## Applications

### Robin - Image to PDF

Convert multiple images (JPEG, PNG) into a single PDF document.

**Features:**
- Drag & drop interface
- Reorder images before conversion
- Image preview thumbnails
- Environmental impact tracking

**Usage:** Navigate to `/image-to-pdf`

### Falcon - PDF to JPEGs

Extract all pages from a PDF as high-quality JPEG images.

**Features:**
- Adjustable quality settings (10% - 100%)
- Resolution scaling (0.5x - 3x)
- Download individual pages or all as ZIP
- Preview extracted images
- Environmental impact tracking

**Usage:** Navigate to `/pdf-to-jpeg`

### Sparrow - PDF Commenting

Collaborate on PDFs with real-time commenting.

**Features:**
- Drag & drop comments anywhere on PDF
- Real-time collaboration
- Comment resolution tracking
- User authentication
- PDF version management

**Usage:** Navigate to `/sparrow/login`

**Note:** Requires separate backend server (not included in this repo)

### Swift - YouTube Downloader

Download YouTube videos for your content creation needs.

**Features:**
- Multiple quality options (Best, 1080p, 720p)
- Audio-only extraction
- Progress tracking
- Direct download to your device

**Usage:** Navigate to `/yt-dlp`

**Note:** Requires backend server running on port 5002

## Environment Variables

No environment variables needed for basic functionality. All apps work entirely in the browser except Swift (YouTube downloader).

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Privacy & Security

All file processing for Robin, Falcon happens entirely in your browser using:
- **Client-side libraries**: pdf-lib, pdfjs-dist, jspdf
- **No server uploads**: Your files never leave your device
- **No tracking**: No analytics or tracking scripts

For Sparrow and Swift, minimal data is sent to backend servers for collaboration and video downloading features.

## Acknowledgments

- Built with React, TypeScript, and Vite
- PDF processing powered by pdf-lib and pdfjs-dist
- Icons from Lucide React
- Styling with Tailwind CSS

---

Made with 💚 for a greener planet
