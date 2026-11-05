import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const LoginPage = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Controlled Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('admin@hopebridge.org');
  const [password, setPassword] = useState('admin123');
  const [role, setRole] = useState('Donor');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Chennai');
  const [panNumber, setPanNumber] = useState('');

  // Feedback States (Loading, Error, Success)
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Controlled form submit using event.preventDefault()
  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Basic React Form Validation
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both email address and password.');
      return;
    }

    if (password.trim().length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (isRegisterMode && !name.trim()) {
      setErrorMessage('Full name is required for registration.');
      return;
    }

    setLoading(true);
    try {
      if (isRegisterMode) {
        await register({
          name,
          email,
          password,
          role,
          phone,
          city,
          panNumber
        });
        setSuccessMessage('Registration successful! Redirecting to dashboard...');
      } else {
        await login(email, password);
        setSuccessMessage('Login successful! Redirecting to dashboard...');
      }
      setTimeout(() => {
        navigate('/dashboard');
      }, 300);
    } catch (error) {
      setErrorMessage(error.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Fill demo credentials for quick testing
  const fillDemoAccount = async (demoEmail, demoPass) => {
    setIsRegisterMode(false);
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage('');
    setLoading(true);
    try {
      await login(demoEmail, demoPass);
      navigate('/dashboard');
    } catch (error) {
      setErrorMessage(error.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 bg-white border border-slate-200 rounded-xl overflow-hidden">
        {/* Left Column: Project Overview & Quick Demo Credentials */}
        <div className="lg:col-span-5 bg-slate-900 text-white p-8 flex flex-col justify-between">
          <div>
            <p className="text-xs text-emerald-400 font-medium">
              Project #23 · MERN Stack Internal Assessment
            </p>
            <h1 className="text-2xl font-bold tracking-tight mt-2 font-display">
              HopeBridge NGO Donation Management
            </h1>
            <p className="text-sm text-slate-300 mt-3 leading-relaxed">
              Manage fundraising campaigns, register donors, record online and offline donations, issue 80G tax receipts, and view real-time campaign progress reports.
            </p>

            <div className="mt-8 pt-6 border-t border-slate-800">
              <h2 className="text-xs font-semibold text-slate-300 mb-3">
                One-Click Evaluator Demo Login
              </h2>
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => fillDemoAccount('admin@hopebridge.org', 'admin123')}
                  className="w-full text-left px-3.5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700"
                >
                  <div className="text-xs font-semibold text-white">
                    1. Admin Role (Full CRUD + Users)
                  </div>
                  <div className="text-xs text-slate-400 font-mono-num mt-0.5">
                    admin@hopebridge.org · admin123
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => fillDemoAccount('manager@hopebridge.org', 'manager123')}
                  className="w-full text-left px-3.5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700"
                >
                  <div className="text-xs font-semibold text-white">
                    2. Campaign Manager Role
                  </div>
                  <div className="text-xs text-slate-400 font-mono-num mt-0.5">
                    manager@hopebridge.org · manager123
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => fillDemoAccount('donor@hopebridge.org', 'donor123')}
                  className="w-full text-left px-3.5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700"
                >
                  <div className="text-xs font-semibold text-white">
                    3. Donor Role (Donate & View Receipts)
                  </div>
                  <div className="text-xs text-slate-400 font-mono-num mt-0.5">
                    donor@hopebridge.org · donor123
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-800 text-xs text-slate-400">
            JWT Authentication · Bcrypt Password Hashing · Role Middleware
          </div>
        </div>

        {/* Right Column: Controlled Login / Registration Form */}
        <div className="lg:col-span-7 p-8">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {isRegisterMode ? 'Create Account' : 'Sign In to Workspace'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {isRegisterMode
                  ? 'Register as a new Donor, Campaign Manager, or Admin'
                  : 'Enter your registered email and password'}
              </p>
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(false);
                  setErrorMessage('');
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  !isRegisterMode
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(true);
                  setEmail('');
                  setPassword('');
                  setErrorMessage('');
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  isRegisterMode
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Register
              </button>
            </div>
          </div>

          {/* Feedback States */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
              Error: {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium">
              Success: {successMessage}
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-4">
            {isRegisterMode && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ananya Krishnan"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Select Role *
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-slate-900"
                  >
                    <option value="Donor">Donor</option>
                    <option value="Campaign Manager">Campaign Manager</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Password (min 6 characters) *
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
              />
            </div>

            {isRegisterMode && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98400 00000"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Chennai"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    PAN Number (80G)
                  </label>
                  <input
                    type="text"
                    value={panNumber}
                    onChange={(e) => setPanNumber(e.target.value)}
                    placeholder="ABCDE1234F"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg uppercase focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {loading
                  ? 'Processing Request...'
                  : isRegisterMode
                  ? 'Register Account'
                  : 'Sign In'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
