import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download, Loader2, Video, Music, AlertCircle } from 'lucide-react';
import logo from '../../../core/assets/logo.svg';

interface DownloadFormat {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const formats: DownloadFormat[] = [
  {
    id: 'best',
    label: 'Best Quality Video',
    description: 'Highest quality video with audio',
    icon: <Video className="h-5 w-5" />
  },
  {
    id: '1080p',
    label: '1080p Video',
    description: 'Full HD quality (1920x1080)',
    icon: <Video className="h-5 w-5" />
  },
  {
    id: '720p',
    label: '720p Video',
    description: 'HD quality (1280x720)',
    icon: <Video className="h-5 w-5" />
  },
  {
    id: 'audio',
    label: 'Audio Only',
    description: 'Extract audio as MP3',
    icon: <Music className="h-5 w-5" />
  }
];

const YtDlp: React.FC = () => {
  const [url, setUrl] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('best');
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [downloadComplete, setDownloadComplete] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const API_URL = 'http://localhost:5002';

  const handleDownload = async () => {
    if (!url.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }

    // Basic YouTube URL validation
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    if (!youtubeRegex.test(url)) {
      setError('Please enter a valid YouTube URL');
      return;
    }

    setError(null);
    setIsDownloading(true);
    setProgress(0);
    setDownloadComplete(false);
    setDownloadUrl(null);

    // Simulate progress (yt-dlp doesn't provide real-time progress easily via API)
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + 10;
      });
    }, 1000);

    try {
      const response = await fetch(`${API_URL}/api/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, format: selectedFormat })
      });

      const data = await response.json();

      clearInterval(progressInterval);

      if (response.ok && data.success) {
        setProgress(100);
        setIsDownloading(false);
        setDownloadComplete(true);
        if (data.downloadUrl) {
          setDownloadUrl(`${API_URL}${data.downloadUrl}`);
        }
      } else {
        setError(data.error || 'Failed to download video. Please try again.');
        setIsDownloading(false);
        setProgress(0);
      }
    } catch (err) {
      clearInterval(progressInterval);
      setError('Failed to connect to backend server. Make sure the backend is running on port 5002.');
      setIsDownloading(false);
      setProgress(0);
    }
  };

  const handleReset = () => {
    setUrl('');
    setSelectedFormat('best');
    setProgress(0);
    setError(null);
    setDownloadComplete(false);
    setDownloadUrl(null);
  };

  return (
    <div className="min-h-screen bg-grid flex items-center justify-center">
      <div className="max-w-4xl w-full mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="inline-flex items-center text-[#6C6A63] hover:text-[#3C3A33] transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Apps
          </Link>

          <h1 className="text-2xl font-medium text-[#6C6A63]">Swift - YouTube Downloader</h1>

          <div className="flex items-center">
            <img src={logo} alt="Pinea Logo" className="h-8" />
          </div>
        </div>

        <div className="rounded-[15px] border border-[rgba(108,106,99,0.10)] bg-[#F9F8F6] shadow-[0px_100px_80px_0px_rgba(108,106,99,0.02),0px_41.778px_33.422px_0px_rgba(108,106,99,0.01),0px_22.336px_17.869px_0px_rgba(108,106,99,0.01),0px_12.522px_10.017px_0px_rgba(108,106,99,0.01),0px_6.65px_5.32px_0px_rgba(108,106,99,0.01),0px_2.767px_2.214px_0px_rgba(108,106,99,0.01)] p-6">

          {/* URL Input */}
          <div className="mb-6">
            <label htmlFor="youtube-url" className="block text-sm font-medium text-[#6C6A63] mb-2">
              YouTube URL
            </label>
            <input
              type="text"
              id="youtube-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-4 py-3 border border-[rgba(108,106,99,0.20)] rounded-lg bg-white text-[#3C3A33] placeholder-[#B8B6AE] focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={isDownloading}
            />
          </div>

          {/* Format Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[#6C6A63] mb-3">
              Download Format
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {formats.map((format) => (
                <button
                  key={format.id}
                  onClick={() => setSelectedFormat(format.id)}
                  disabled={isDownloading}
                  className={`p-4 border rounded-lg text-left transition-all ${
                    selectedFormat === format.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-[rgba(108,106,99,0.20)] bg-white hover:border-green-300'
                  } ${isDownloading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-start">
                    <div className={`mr-3 ${selectedFormat === format.id ? 'text-green-600' : 'text-[#6C6A63]'}`}>
                      {format.icon}
                    </div>
                    <div className="flex-1">
                      <div className={`text-sm font-medium ${selectedFormat === format.id ? 'text-green-700' : 'text-[#3C3A33]'}`}>
                        {format.label}
                      </div>
                      <div className="text-xs text-[#6C6A63] mt-1">
                        {format.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 border border-red-200 rounded-lg bg-red-50 flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Progress Bar */}
          {isDownloading && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#6C6A63]">Downloading...</span>
                <span className="text-sm font-medium text-green-600">{progress}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Success Message */}
          {downloadComplete && (
            <div className="mb-6 p-4 border border-green-200 rounded-lg bg-green-50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-green-700 mb-2 sm:mb-0">
                  Download complete! {downloadUrl ? 'Click below to download the file.' : 'Check the backend downloads folder.'}
                </p>
                {downloadUrl && (
                  <a
                    href={downloadUrl}
                    download
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <Download className="-ml-0.5 mr-2 h-4 w-4" />
                    Download File
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
            {downloadComplete ? (
              <button
                type="button"
                onClick={handleReset}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-[#6C6A63] bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Download Another Video
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={isDownloading}
                  className={`w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-[#6C6A63] bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                    isDownloading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  Clear
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={isDownloading || !url.trim()}
                  className={`w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                    (isDownloading || !url.trim()) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="-ml-1 mr-2 h-4 w-4" />
                      Download Video
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-[#6C6A63]">
          <p>
            Download YouTube videos for your marketing and content creation needs.
            <br />
            Please respect copyright and only download videos you have permission to use.
          </p>
        </div>
      </div>
    </div>
  );
};

export default YtDlp;
