# Pinea 🌲

**Simple, elegant tools that help you work more naturally with your digital content.**

Pinea is a suite of productivity tools designed to make digital work feel natural and enjoyable. Most tools process files entirely in your browser, while collaborative features use secure server-side processing.

## Features

### 🐦 Bird-Themed Microtools

- **Robin** - Image to PDF Converter
- **Falcon** - PDF to JPEG Extractor
- **Sparrow** - Collaborative PDF Commenting
- **Swift** - YouTube Video Downloader

### 🔒 Privacy-First
Robin and Falcon process files entirely in your browser - your files never leave your device. Sparrow uses secure server-side processing for real-time collaboration, while Swift requires server access for video downloading.

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
- **Backend**: Vercel Serverless Functions
- **Deployment**: Vercel

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
├── api/                        # Vercel serverless functions
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

3. **Set up environment variables** (see Environment Variables section below)

## Usage

### Development

**Start the dev server:**
```bash
npm run dev
```
Open http://localhost:5173

**Note:** Sparrow and Swift require Vercel serverless functions. For local development of these features, use `vercel dev` or deploy to Vercel.

### Production

**Deploy to Vercel:**
```bash
vercel --prod
```

Or connect your GitHub repository to Vercel for automatic deployments.

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

**Note:** Uses Vercel serverless functions for backend functionality

### Swift - YouTube Downloader

Download YouTube videos for your content creation needs.

**Features:**
- Multiple quality options (Best, 1080p, 720p)
- Audio-only extraction
- Progress tracking
- Direct download to your device

**Usage:** Navigate to `/yt-dlp`

**Note:** Uses Vercel serverless functions for video processing

## Environment Variables

For Sparrow (PDF Commenting), you'll need to set up the following in your `.env` file or Vercel environment variables:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Robin and Falcon work entirely in the browser and require no environment variables.

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Privacy & Security

**Client-Side Tools (Robin, Falcon):**
- All file processing happens entirely in your browser using pdf-lib, pdfjs-dist, and jspdf
- Your files never leave your device
- No server uploads required

**Server-Side Tools (Sparrow, Swift):**
- Sparrow uses Vercel serverless functions for real-time collaboration features
- Swift uses backend services for YouTube video downloading
- Data is processed securely and not stored permanently

**All Tools:**
- No analytics or tracking scripts
- No data sold to third parties

## Acknowledgments

- Built with React, TypeScript, and Vite
- PDF processing powered by pdf-lib and pdfjs-dist
- Icons from Lucide React
- Styling with Tailwind CSS

---

Made with 💚 for a greener planet
