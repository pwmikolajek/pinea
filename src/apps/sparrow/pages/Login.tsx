import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useSparrowAuth } from '../contexts/AuthContext';
import logo from '../../../img/logo.svg';
import './Auth.css';

const SparrowLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useSparrowAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      navigate('/sparrow/dashboard');
    } else {
      setError(result.error || 'Login failed');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-grid flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-4">
        <div className="mb-6">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center text-[#6C6A63] hover:text-[#3C3A33] transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Apps
          </button>
        </div>

        <div className="flex items-center justify-center mb-8">
          <img src={logo} alt="Pinea Logo" className="h-16" />
        </div>

        <div className="auth-card">
          <h2 className="text-2xl font-medium text-gray-900 mb-6">Login to PDF Commenting</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {error && <div className="error text-red-600 text-sm mb-4">{error}</div>}

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="auth-link mt-6 text-center text-sm">
            Don't have an account?{' '}
            <Link to="/sparrow/register" className="text-green-600 hover:text-green-700 font-medium">
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SparrowLogin;
