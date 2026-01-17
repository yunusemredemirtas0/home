export default function Logo() {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            background: 'var(--accent-gradient)',
            borderRadius: '12px',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1.2rem',
            boxShadow: '0 4px 10px rgba(124, 58, 237, 0.4)',
            userSelect: 'none'
        }}>
            YD
        </div>
    );
}
