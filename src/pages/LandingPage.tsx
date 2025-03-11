import React from 'react';
import { Link } from 'react-router-dom';
import { FileImage, FileText, Calendar, BarChart3, Sparkles, ArrowRight } from 'lucide-react';
import logo from '../img/logo.svg';

interface AppCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  status: 'available' | 'coming-soon';
}

const AppCard: React.FC<AppCardProps> = ({ title, description, icon, path, status }) => {
  const CardContent = () => (
    <>
      <div className="flex items-start">
        <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-green-50 text-green-600">
          {icon}
        </div>
        <div className="ml-4 flex-1">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <p className="mt-1 text-sm text-[#6C6A63]">{description}</p>
          
          {status === 'available' ? (
            <span className="mt-4 inline-flex items-center text-sm font-medium text-green-600">
              Open app <ArrowRight className="ml-1 h-4 w-4" />
            </span>
          ) : (
            <span className="mt-4 inline-flex items-center text-sm font-medium text-[#6C6A63]">
              Coming soon <Sparkles className="ml-1 h-4 w-4" />
            </span>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className={`bg-white rounded-xl border border-[rgba(108,106,99,0.10)] shadow-sm transition-all ${status === 'available' ? 'hover:shadow-md hover:-translate-y-1' : 'opacity-80'}`}>
      {status === 'available' ? (
        <Link 
          to={path}
          className="block p-6 h-full w-full"
          aria-label={`Open ${title} app`}
        >
          <CardContent />
        </Link>
      ) : (
        <div className="p-6 h-full w-full relative">
          <CardContent />
          <div className="absolute top-3 right-3 bg-[#CAC6B9] text-white text-xs px-2 py-1 rounded-full">
            Coming Soon
          </div>
        </div>
      )}
    </div>
  );
};

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-grid">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-4">
            <img src={logo} alt="Pinea Logo" className="h-16" />
          </div>
          <p className="text-sm text-[#6C6A63] max-w-2xl mx-auto">
            Simple, elegant tools that help you work more naturally with your digital content.
            No servers, no uploads, just pure browser-based magic. 🌲
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <AppCard
            title="Image to PDF Converter"
            description="Convert your images to PDF with a simple drag and drop interface. Rearrange, preview, and download."
            icon={<FileImage size={24} />}
            path="/image-to-pdf"
            status="available"
          />
          
          <AppCard
            title="PDF to JPEGs Converter"
            description="Extract all pages from a PDF as high-quality JPEG images. Perfect for sharing or editing PDF content."
            icon={<FileText size={24} />}
            path="/pdf-to-jpeg"
            status="available"
          />
          
          <AppCard
            title="Meeting Notes Organizer"
            description="Organize your meeting notes with AI-powered categorization and summarization."
            icon={<Calendar size={24} />}
            path="/meeting-notes"
            status="coming-soon"
          />
          
          <AppCard
            title="Data Visualizer"
            description="Create beautiful charts and graphs from your data without any coding knowledge."
            icon={<BarChart3 size={24} />}
            path="/data-visualizer"
            status="coming-soon"
          />
        </div>
        
        <div className="bg-green-50 rounded-2xl p-8 border border-green-100">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Why Pinea?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">100% Private</h3>
              <p className="text-[#6C6A63]">
                All processing happens in your browser. Your files never leave your device.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Eco-Friendly</h3>
              <p className="text-[#6C6A63]">
                We track the environmental impact of going digital and show you how many trees you're saving.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Simple & Beautiful</h3>
              <p className="text-[#6C6A63]">
                Intuitive interfaces that make digital work feel natural and enjoyable.
              </p>
            </div>
          </div>
        </div>
        
        <footer className="mt-16 text-center text-sm text-[#6C6A63]">
          <p>
            Pinea - Made with 💚 for a greener planet
            <br />
            All processing happens in your browser. Your files never leave your device.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;