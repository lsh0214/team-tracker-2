// client/src/pages/ForgotPassword.js (수정된 코드)

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPassword } from '../api/auth';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        try {
            const { data } = await forgotPassword({ email });
            setMessage(data.message);
            // 성공 시 3초 후 로그인 페이지로 이동
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            const errorMessage = err.response?.data?.message || '오류가 발생했습니다.';
            setError(errorMessage);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h2>비밀번호 찾기</h2>
            <form onSubmit={handleSubmit}>
                <p>가입 시 사용한 이메일 주소를 입력하시면, 임시 비밀번호를 보내드립니다.</p>
                <input
                    type="email"
                    placeholder="가입한 이메일을 입력하세요"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                />
                <button type="submit" style={{ width: '100%', padding: '10px', background: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>
                    임시 비밀번호 받기
                </button>
            </form>
            
            {message && <p style={{ color: 'green', marginTop: '15px' }}>{message}</p>}
            {error && <p style={{ color: 'red', marginTop: '15px' }}>{error}</p>}

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <Link to="/login">로그인으로 돌아가기</Link>
            </div>
        </div>
    );
};

export default ForgotPassword;