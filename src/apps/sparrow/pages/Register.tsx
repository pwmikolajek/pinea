import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useSparrowAuth } from '../contexts/AuthContext';
import { isLocalDevMode } from '../config/localDev';
import logo from '../../../core/assets/logo.svg';
import './Auth.css';

const SparrowRegister: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, loginWithGoogle } = useSparrowAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await register(email, password, name);

    if (result.success) {
      navigate('/sparrow/dashboard');
    } else {
      setError(result.error || 'Registration failed');
    }

    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    const result = await loginWithGoogle();

    if (result.success) {
      navigate('/sparrow/dashboard');
    } else {
      setError(result.error || 'Google sign-in failed');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-grid flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-4 py-12">
        <div className="mb-6">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center text-[#2E822E] hover:text-[#257525] transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Apps
          </button>
        </div>

        <div className="flex items-center justify-center mb-8">
          <img src={logo} alt="Pinea Logo" className="h-16" />
        </div>

        <div className="auth-card">
          <h2 className="text-2xl font-medium text-gray-900 mb-6">
            Create an Account
            {isLocalDevMode && (
              <span className="ml-2 text-xs bg-[#E8E6DE] text-[#6C6A63] px-2 py-1 rounded">Local Dev Mode</span>
            )}
          </h2>

          {error && <div className="error text-red-600 text-sm mb-4">{error}</div>}

          {/* Email/Password Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2E822E]"
                placeholder={isLocalDevMode ? "Any Name (dev mode)" : "Your Name"}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2E822E]"
                placeholder={isLocalDevMode ? "any@email.com (dev mode)" : "your@email.com"}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2E822E]"
                placeholder={isLocalDevMode ? "any password (dev mode)" : "••••••••"}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2E822E] text-white py-2 px-4 rounded-md hover:bg-[#257525] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </form>

          {!isLocalDevMode && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              {/* Google Sign-In Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-3"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                  <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9.003 18z" fill="#34A853"/>
                  <path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9.001c0 1.452.348 2.827.957 4.041l3.007-2.332z" fill="#FBBC05"/>
                  <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335"/>
                </svg>
                {loading ? 'Signing in...' : 'Sign up with Google'}
              </button>
            </>
          )}

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/sparrow/login" className="text-[#2E822E] hover:text-[#257525] font-medium">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SparrowRegister;
