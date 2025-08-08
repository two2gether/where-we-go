import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useLogin, useRegister } from '../hooks/useAuth';
import { useSocialAuth } from '../hooks/useSocialAuth';
import { Button, Input, Card } from '../components/base';
import { SocialLoginButton } from '../components/auth/SocialLoginButton';

export const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  
  // React Query 훅 사용
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  
  // 소셜 로그인 훅 사용
  const { loading: socialLoading, handleGoogleLogin, handleKakaoLogin } = useSocialAuth();
  
  const isLoading = loginMutation.isPending || registerMutation.isPending;

  // 이미 로그인된 사용자는 홈으로 리다이렉트
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다.';
    }

    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요.';
    } else if (formData.password.length < 8) {
      newErrors.password = '비밀번호는 8자 이상이어야 합니다.';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(formData.password)) {
      newErrors.password = '비밀번호는 영문 대·소문자, 숫자, 특수문자를 포함해야 합니다.';
    }

    if (!isLogin) {
      if (!formData.name) {
        newErrors.name = '이름을 입력해주세요.';
      }
      
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = '비밀번호 확인을 입력해주세요.';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Form submitted, preventing default');
    
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    console.log('Starting login process...');
    
    // API 에러 초기화
    setErrors(prev => ({ ...prev, general: '' }));

    try {
      console.log('About to call API...');
      
      if (isLogin) {
        console.log('Calling login API...');
        // 로그인
        await loginMutation.mutateAsync({
          email: formData.email,
          password: formData.password,
        });
        console.log('Login API success');
      } else {
        console.log('Calling register API...');
        // 회원가입
        await registerMutation.mutateAsync({
          nickname: formData.name,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        });
        console.log('Register API success, now calling login...');
        
        // 회원가입 성공 후 자동 로그인
        await loginMutation.mutateAsync({
          email: formData.email,
          password: formData.password,
        });
        console.log('Auto-login after register success');
      }
      
      console.log('API call completed successfully!');
      console.log('LOGIN SUCCESS - NOT NAVIGATING YET');
      // 성공 시 홈페이지로 리다이렉트
      // navigate('/');  // 일시적으로 주석처리
      
    } catch (error: any) {
      console.error('Authentication error:', error);
      console.log('Full error object:', error);
      
      // API 에러 메시지 표시
      const errorMessage = error?.response?.data?.message || 
        (isLogin ? '로그인에 실패했습니다.' : '회원가입에 실패했습니다.') + ' 다시 시도해주세요.';
      
      console.log('Setting error message:', errorMessage);
      
      setErrors({ general: errorMessage });
      
      // 특정 필드 에러 처리
      if (error?.response?.data?.field) {
        setErrors(prev => ({
          ...prev,
          [error.response.data.field]: error.response.data.message
        }));
      }
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      email: '',
      password: '',
      name: '',
      confirmPassword: ''
    });
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-github-canvas flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      
      <div className="max-w-sm w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block">
            <h1 className="text-2xl font-semibold text-primary-900 hover:text-primary-700 transition-colors">
              Where We Go
            </h1>
          </Link>
          <h2 className="text-lg font-normal text-github-neutral">
            {isLogin ? '계정에 로그인' : '계정 만들기'}
          </h2>
        </div>

        {/* Form */}
        <Card variant="outlined" padding="lg" className="border-github-border">
          <div className="space-y-4">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-3 rounded-md text-sm">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span>{errors.general}</span>
                </div>
              </div>
            )}

            {/* Name field (signup only) */}
            {!isLogin && (
              <Input
                id="name"
                name="name"
                label="이름"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
                error={errors.name}
                placeholder="이름을 입력하세요"
              />
            )}

            {/* Email field */}
            <Input
              id="email"
              name="email"
              label="이메일"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              error={errors.email}
              placeholder="이메일을 입력하세요"
            />

            {/* Password field */}
            <Input
              id="password"
              name="password"
              label="비밀번호"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              error={errors.password}
              placeholder="비밀번호를 입력하세요"
            />

            {/* Confirm Password field (signup only) */}
            {!isLogin && (
              <Input
                id="confirmPassword"
                name="confirmPassword"
                label="비밀번호 확인"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
                error={errors.confirmPassword}
                placeholder="비밀번호를 다시 입력하세요"
              />
            )}

            {/* Submit Button */}
            <Button
              type="button"
              variant="primary"
              size="lg"
              fullWidth
              loading={isLoading}
              onClick={(e) => {
                console.log('Button clicked!');
                e.preventDefault();
                e.stopPropagation();
                handleSubmit(e as any);
              }}
            >
              {isLogin ? '로그인' : '회원가입'}
            </Button>

            {/* Forgot Password (login only) */}
            {isLogin && (
              <div className="text-center">
                <button
                  type="button"
                  className="text-sm text-primary-600 hover:text-primary-500 transition-colors"
                >
                  비밀번호를 잊으셨나요?
                </button>
              </div>
            )}
          </div>

          {/* Toggle Mode */}
          <div className="mt-4 pt-4 border-t border-github-border text-center">
            <p className="text-sm text-github-neutral">
              {isLogin ? '아직 계정이 없으신가요?' : '이미 계정이 있으신가요?'}
            </p>
            <button
              type="button"
              onClick={toggleMode}
              className="mt-2 text-secondary-600 hover:text-secondary-700 text-sm font-medium hover:underline"
            >
              {isLogin ? '새 계정 만들기' : '기존 계정으로 로그인'}
            </button>
          </div>

          {/* Social Login */}
          <div className="mt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-github-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-github-canvas text-github-neutral-muted">또는</span>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <SocialLoginButton
                provider="google"
                onClick={handleGoogleLogin}
                isLogin={isLogin}
                loading={socialLoading.google}
              />
              
              <SocialLoginButton
                provider="kakao"
                onClick={handleKakaoLogin}
                isLogin={isLogin}
                loading={socialLoading.kakao}
              />
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-github-neutral-muted space-y-2">
          <p>
            계속 진행하면{' '}
            <a href="#" className="text-secondary-600 hover:text-secondary-700 underline">이용약관</a>
            {' '}및{' '}
            <a href="#" className="text-secondary-600 hover:text-secondary-700 underline">개인정보처리방침</a>
            에 동의하는 것으로 간주됩니다.
          </p>
        </div>
      </div>
    </div>
  );
};