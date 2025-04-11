import { useState } from 'react';
import { Link } from 'react-router-dom';

const AuthForm = ({ type, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const newErrors = {};

    if (type === 'signup') {
      if (!formData.name.trim()) newErrors.name = 'Name is required';
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-2xl border border-green-100 w-full max-w-md">
      <h2 className="text-3xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-green-700">
        {type === 'login' ? 'Welcome Back' : 'Create Account'}
      </h2>
      
      <form onSubmit={handleSubmit}>
        {type === 'signup' && (
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-green-50 text-gray-800 px-4 py-3 rounded-lg border border-green-200"
              placeholder="Your name"
            />
            {errors.name && <p className="text-red-500 mt-1 text-sm">{errors.name}</p>}
          </div>
        )}
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full bg-green-50 text-gray-800 px-4 py-3 rounded-lg border border-green-200"
            placeholder="Your email"
          />
          {errors.email && <p className="text-red-500 mt-1 text-sm">{errors.email}</p>}
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full bg-green-50 text-gray-800 px-4 py-3 rounded-lg border border-green-200"
            placeholder="Your password"
          />
          {errors.password && <p className="text-red-500 mt-1 text-sm">{errors.password}</p>}
        </div>
        
        {type === 'signup' && (
          <div className="mb-6">
            <label className="block text-gray-700 mb-2" htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full bg-green-50 text-gray-800 px-4 py-3 rounded-lg border border-green-200"
              placeholder="Confirm your password"
            />
            {errors.confirmPassword && <p className="text-red-500 mt-1 text-sm">{errors.confirmPassword}</p>}
          </div>
        )}
        
        <button type="submit" disabled={isLoading} className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg transition duration-200">
          {isLoading ? 'Loading...' : type === 'login' ? 'Login' : 'Sign Up'}
        </button>
      </form>
      
      <div className="mt-6 text-center text-gray-600">
        {type === 'login' ? (
          <>
            Don't have an account? <Link to="/signup" className="text-green-600 hover:text-green-700">Sign Up</Link>
          </>
        ) : (
          <>
            Already have an account? <Link to="/login" className="text-green-600 hover:text-green-700">Login</Link>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthForm;