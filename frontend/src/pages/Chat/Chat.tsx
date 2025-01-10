import { useState, useEffect, useRef } from 'react';
import styles from './chat.module.scss';
import useUserStore from '../../hooks/userStore';
import ROUTES from '../../config/routes';
import { useNavigate } from 'react-router';

interface Message {
    user: string;
    text: string;
}

export default function Chat() {
    const userStore = useUserStore();
    //const [users, setUsers] = useState<string[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentMessage, setCurrentMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const socket = useRef<WebSocket | null>(null);
    const navigate = useNavigate();
    const isFirstRender = useRef(true);

    if (userStore.socket && userStore.socket.readyState === WebSocket.OPEN) {
        userStore.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);

            setMessages(prev => [...prev, { user: data.Username, text: data.Message }]);

            console.log(event.data);
        };
    }

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        if(!userStore.socket || userStore.socket.readyState !== WebSocket.OPEN){
            navigate(ROUTES.HOME);
            return;
        }

        return () => {
            userStore.socket?.close();
        }
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = () => {
        if (currentMessage.trim() && userStore.socket?.readyState === WebSocket.OPEN) {
            userStore.socket.send(JSON.stringify({ Type: 'chat-message', Message: currentMessage }));
            setCurrentMessage('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    };

    return (
        <div className={styles.chatContainer}>
            <div className={styles.messages}>
                {messages.map((msg, index) => (
                    msg.user === ''
                        ? (
                            <div key={index} className={`${styles.message} ${styles.system}`}>
                                {msg.text}
                            </div>
                        ) : (
                            <div key={index} className={`${styles.message} ${msg.user === userStore.username? styles.me : ''}`}>
                                <div className={styles.messageBox}>
                                    {msg.user !== userStore.username && <strong>{msg.user}: </strong>}
                                    {msg.text}
                                </div>
                            </div>
                        )
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className={styles.inputGroup}>
                <input
                    type="text"
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className={styles.input}
                    placeholder="Type a message"
                />
                <button onClick={sendMessage} className={styles.button}>Send</button>
            </div>
        </div>
    );
}
