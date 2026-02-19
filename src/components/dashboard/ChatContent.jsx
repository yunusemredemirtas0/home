import React, { useState, useEffect, useRef } from 'react';
import { FiSend, FiCpu, FiUser, FiTerminal, FiAlertCircle } from 'react-icons/fi';
import { getModels, chatWithOllama } from '../../services/ollama';

const ChatContent = ({ t }) => {
    const [models, setModels] = useState([]);
    const [selectedModel, setSelectedModel] = useState('');
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [streamedResponse, setStreamedResponse] = useState('');
    const messagesEndRef = useRef(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadModels();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, streamedResponse]);

    const loadModels = async () => {
        try {
            const modelList = await getModels();
            setModels(modelList);
            if (modelList.length > 0) {
                setSelectedModel(modelList[0].name);
            }
        } catch (err) {
            console.error("Failed to load models", err);
            setError("Failed to connect to Ollama. Make sure it's running.");
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || !selectedModel) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setStreamedResponse('');
        setError(null);

        try {
            // Keep track of the full response to update state at the end
            let fullResponse = "";

            await chatWithOllama(selectedModel, [...messages, userMessage], (chunk) => {
                fullResponse += chunk;
                setStreamedResponse(prev => prev + chunk);
            });

            // After stream finishes, add to messages and clear streamedResponse
            setMessages(prev => [...prev, { role: 'assistant', content: fullResponse }]);
            setStreamedResponse('');
        } catch (err) {
            console.error("Chat error", err);
            setError(t.dashboard.chat.error);
        } finally {
            setIsLoading(false);
        }
    };

    // Basic markdown-like rendering (bold, code blocks)
    // Since we don't have a markdown library, we'll do simple formatting
    const renderMessage = (content) => {
        return (
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                {content}
            </div>
        );
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100vh - 140px)', // Adjust based on header/padding
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--dash-radius)',
            border: '1px solid var(--border-color)',
            overflow: 'hidden'
        }}>
            {/* Header / Model Selector */}
            <div style={{
                padding: '1rem 1.5rem',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'var(--bg-primary)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <div style={{
                        padding: '0.5rem',
                        background: 'var(--accent-gradient)',
                        borderRadius: '10px',
                        color: 'white',
                        display: 'flex'
                    }}>
                        <FiTerminal size={20} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0 }}>{t.dashboard.chat.title}</h2>
                        {models.length === 0 && !error && (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Connecting to Ollama...</span>
                        )}
                        {error && (
                            <span style={{ fontSize: '0.8rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <FiAlertCircle /> {error}
                            </span>
                        )}
                    </div>
                </div>

                <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    style={{
                        padding: '0.6rem 1rem',
                        borderRadius: '10px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        outline: 'none',
                        cursor: 'pointer',
                        minWidth: '200px'
                    }}
                    disabled={models.length === 0}
                >
                    {models.length === 0 ? (
                        <option>{t.dashboard.chat.noModels}</option>
                    ) : (
                        models.map(model => (
                            <option key={model.name} value={model.name}>{model.name}</option>
                        ))
                    )}
                </select>
            </div>

            {/* Chat Area */}
            <div style={{
                flex: 1,
                padding: '1.5rem',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem'
            }}>
                {messages.length === 0 && (
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-secondary)',
                        opacity: 0.6
                    }}>
                        <FiCpu size={48} style={{ marginBottom: '1rem' }} />
                        <p>{t.dashboard.chat.typeMessage}</p>
                    </div>
                )}

                {messages.map((msg, index) => (
                    <div key={index} style={{
                        display: 'flex',
                        gap: '1rem',
                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: '80%',
                        flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'
                    }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: msg.role === 'user' ? 'var(--accent-color)' : 'var(--bg-tertiary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            flexShrink: 0,
                            border: '1px solid var(--border-color)'
                        }}>
                            {msg.role === 'user' ? <FiUser size={18} /> : <FiCpu size={18} />}
                        </div>
                        <div style={{
                            padding: '1rem',
                            borderRadius: '16px',
                            background: msg.role === 'user' ? 'var(--accent-gradient)' : 'var(--bg-tertiary)',
                            color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                            boxShadow: 'var(--glass-shadow)',
                            borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px',
                            borderBottomLeftRadius: msg.role === 'user' ? '16px' : '4px'
                        }}>
                            <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.3rem' }}>
                                {msg.role === 'user' ? t.dashboard.chat.you : t.dashboard.chat.assistant}
                            </div>
                            {renderMessage(msg.content)}
                        </div>
                    </div>
                ))}

                {/* Streaming Message - Current Response */}
                {isLoading && streamedResponse && (
                    <div style={{
                        display: 'flex',
                        gap: '1rem',
                        alignSelf: 'flex-start',
                        maxWidth: '80%'
                    }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: 'var(--bg-tertiary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            flexShrink: 0,
                            border: '1px solid var(--border-color)'
                        }}>
                            <FiCpu size={18} />
                        </div>
                        <div style={{
                            padding: '1rem',
                            borderRadius: '16px',
                            background: 'var(--bg-tertiary)',
                            color: 'var(--text-primary)',
                            boxShadow: 'var(--glass-shadow)',
                            borderBottomLeftRadius: '4px'
                        }}>
                            <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.3rem' }}>
                                {t.dashboard.chat.assistant}
                            </div>
                            {renderMessage(streamedResponse)}
                        </div>
                    </div>
                )}

                {isLoading && !streamedResponse && (
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginLeft: '3.5rem', color: 'var(--text-secondary)' }}>
                        <div className="typing-dot" style={{ animationDelay: '0s' }}></div>
                        <div className="typing-dot" style={{ animationDelay: '0.2s' }}></div>
                        <div className="typing-dot" style={{ animationDelay: '0.4s' }}></div>
                        <span style={{ fontSize: '0.85rem', marginLeft: '0.5rem' }}>{t.dashboard.chat.thinking}</span>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} style={{
                padding: '1.2rem',
                background: 'var(--bg-primary)',
                borderTop: '1px solid var(--border-color)',
                display: 'flex',
                gap: '1rem'
            }}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={t.dashboard.chat.typeMessage}
                    style={{
                        flex: 1,
                        padding: '1rem',
                        borderRadius: '12px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        outline: 'none',
                        fontSize: '1rem'
                    }}
                    disabled={isLoading || models.length === 0}
                />
                <button
                    type="submit"
                    disabled={isLoading || !input.trim() || models.length === 0}
                    style={{
                        padding: '0 1.5rem',
                        borderRadius: '12px',
                        background: 'var(--accent-gradient)',
                        color: 'white',
                        border: 'none',
                        cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.1s',
                        opacity: isLoading || !input.trim() ? 0.7 : 1
                    }}
                    onMouseDown={(e) => !isLoading && (e.currentTarget.style.transform = 'scale(0.96)')}
                    onMouseUp={(e) => !isLoading && (e.currentTarget.style.transform = 'scale(1)')}
                >
                    <FiSend size={20} />
                </button>
            </form>

            <style>{`
                .typing-dot {
                    width: 6px;
                    height: 6px;
                    background: var(--text-secondary);
                    border-radius: 50%;
                    animation: bounce 1.4s infinite ease-in-out both;
                }
                @keyframes bounce {
                    0%, 80%, 100% { transform: scale(0); }
                    40% { transform: scale(1); }
                }
            `}</style>
        </div>
    );
};

export default ChatContent;
