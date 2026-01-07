// client/src/pages/ForgotPassword.js (수정된 코드)

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { forgotPassword } from "../api/auth";
import styles from "../styles/auth/ForgotPassword.module.css";
import AuthLayout from "../components/auth/AuthLayout";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      const { data } = await forgotPassword({ email });
      setMessage(data.message);
      // 성공 시 3초 후 로그인 페이지로 이동
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "오류가 발생했습니다.";
      setError(errorMessage);
    }
  };

  return (
    <AuthLayout>
      <div className={styles.authHeader}>
        <h2 className={styles.title}>비밀번호 찾기</h2>
        <form onSubmit={handleSubmit}>
          <p className={styles.title}>
            가입 시 사용한 이메일 주소를 입력하시면, <br />
            임시 비밀번호를 보내드립니다.
          </p>
          <input
            type="email"
            placeholder="가입한 이메일을 입력하세요"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={styles.authInput}
          />
          <button type="submit" className={styles.authBtn}>
            임시 비밀번호 받기
          </button>
        </form>

        {message && (
          <p style={{ color: "green", marginTop: "15px" }}>{message}</p>
        )}
        {error && <p style={{ color: "red", marginTop: "15px" }}>{error}</p>}

        <div className={styles.linkBox}>
          <Link to="/login" className={styles.authLink}>
            로그인으로 돌아가기
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;
