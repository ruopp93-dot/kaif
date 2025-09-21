type Props = {
  onConfirm: () => void;
};

export default function AgeGate({ onConfirm }: Props) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      alignItems: 'center',
      textAlign: 'center',
      background: 'var(--tg-theme-secondary-bg-color, #111)',
      color: 'var(--tg-theme-text-color, #fff)',
      padding: 16,
      borderRadius: 12
    }}>
      <div style={{ fontSize: 18, fontWeight: 700 }}>18+</div>
      <div style={{ opacity: 0.9 }}>Подтвердите, что вам уже есть 18 лет, чтобы продолжить.</div>
      <button
        onClick={onConfirm}
        style={{
          background: 'var(--tg-theme-button-color, #40a9ff)',
          color: 'var(--tg-theme-button-text-color, #fff)',
          border: 'none',
          borderRadius: 8,
          padding: '10px 16px',
          cursor: 'pointer',
          fontWeight: 600
        }}
      >
        Мне есть 18
      </button>
    </div>
  );
}
