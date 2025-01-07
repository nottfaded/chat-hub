import { useState, useEffect, useRef } from 'react';
import styles from './chat.module.scss';

interface Message {
    user: string;
    text: string;
}

export default function Chat() {
    const [users, setUsers] = useState<string[]>([]);
    const [messages, setMessages] = useState<Message[]>(Array.from({ length: 30 }, () => ({ user: 'user', text: 'Welcome to the chat' })));
    const [currentMessage, setCurrentMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const newUser = 'User' + Math.floor(Math.random() * 1000);
        setUsers(prev => [...prev, newUser]);
        setMessages(prev => [...prev, { user: '', text: `${newUser} has joined the chat` }]);

        return () => {
            setUsers(prev => prev.filter(user => user !== newUser));
            setMessages(prev => [...prev, { user: '', text: `${newUser} has left the chat` }]);
        };
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = () => {
        if (currentMessage.trim()) {
            setMessages(prev => [...prev, { user: 'Me', text: currentMessage }]);
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
                            <div key={index} className={`${styles.message} ${msg.user === 'Me' ? styles.me : ''}`}>
                                <div className={styles.messageBox}>
                                    {msg.user !== 'Me' && <strong>{msg.user}: </strong>}
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
                    onKeyPress={handleKeyPress}
                    className={styles.input}
                    placeholder="Type a message"
                />
                <button onClick={sendMessage} className={styles.button}>Send</button>
            </div>
        </div>
    );
}
