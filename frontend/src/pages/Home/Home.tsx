import { useEffect, useRef, useState } from 'react';
import styles from './home.module.scss';
import { useNavigate } from 'react-router';
import ROUTES from '../../config/routes';
import useUserStore from '../../hooks/userStore';

export default function Main() {
    const [username, setUsername] = useState('');
    const user = useUserStore();
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const onUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(e.target.value);
    }

    const onEnter = async () => {
        if (!username.trim()) {
            return;
        }

        setIsLoading(true);

        const response = await fetch(`http://192.168.0.129:5002/chat?username=${username}`);

        if (!response.ok) {
            const errorText = await response.text();
            alert(errorText);
            setIsLoading(false);
            return;
        }

        const socket = new WebSocket(`ws://192.168.0.129:5002/chat?username=${username}`);

        socket.onopen = () => {
            user.setSocket(socket);
            user.setUsername(username);
            // socket.send(JSON.stringify({ type: 'check-username', username }));
            navigate(ROUTES.CHAT);
        };

        socket.onclose = (e) => {
            console.log('Socket closed');
        }
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            onEnter();
        }
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
                        onKeyDown={onKeyDown}
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
