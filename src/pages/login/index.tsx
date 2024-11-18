import { useState } from 'react';
import { useRouter } from 'next/router';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import styles from '../../styles/Login.module.css';  // Import the CSS module for styling

const Login = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>(''); 
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const auth = getAuth(); // Get auth instance from Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      router.push('/home');  // Redirect to home on successful login
    } catch (err: any) {
      setError('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginForm}>
        <h1 className={styles.title}>Đăng Nhập Admin</h1>
        {error && <p className={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label>Email: </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={styles.input}
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Mật khẩu: </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={styles.input}
            />
          </div>
          <button type="submit" className={styles.submitBtn}>Đăng nhập</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
