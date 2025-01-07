import { useState } from 'react';
import styles from './home.module.scss';
import { useNavigate } from 'react-router';
import ROUTES from '../../config/routes';

export default function Main() {
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const onUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(e.target.value);
    }

    const onEnter = () => {
        if (!username) {
            return;
        }

        setIsLoading(true);

        const promise = new Promise<void>((resolve) => {
            setTimeout(() => {
                resolve();
            }, 2000);
        })

        promise.then(() => {
            setIsLoading(false);
            navigate(ROUTES.CHAT);
        })
    }

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.welcomeText}>
                    Welcome <span className={styles.waveEmoji}>👋</span>
                </h1>
                <p className={styles.subText}>Set a username to get started</p>
                <div className={styles.inputGroup}>
                    <input
                        type="text"
                        className={styles.input}
                        placeholder="Username"
                        value={username}
                        onChange={onUsernameChange}
                    />
                    <button
                        className={styles.button}
                        onClick={onEnter}
                        style={{
                            opacity: isLoading ? 0.5 : 1,
                            pointerEvents: isLoading ? 'none' : 'auto'
                        }}
                    >Enter</button>
                </div>
            </div>
        </div>
    );
}
