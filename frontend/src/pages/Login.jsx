import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (formData) => {
    setIsLoading(true);
    setError('');
    
    if (!formData.email || !formData.password) {
      setError('Email and password are required.');
      setIsLoading(false);
      return;
    }
    
    try {
      await login(formData.email, formData.password);
      navigate('/');
    } catch (err) {
      console.error('Login Error:', err);
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 text-white p-6">
      {error && (
        <div className="bg-red-500 text-white p-4 mb-6 rounded-lg w-full max-w-md text-center">
          {error}
        </div>
      )}
      <AuthForm type="login" onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
};

export default Login;