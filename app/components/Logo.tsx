export default function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="22" stroke="#E62E04" strokeWidth="4" />
      <line x1="32" y1="2" x2="32" y2="18" stroke="#E62E04" strokeWidth="4" strokeLinecap="round" />
      <line x1="32" y1="46" x2="32" y2="62" stroke="#E62E04" strokeWidth="4" strokeLinecap="round" />
      <line x1="2" y1="32" x2="18" y2="32" stroke="#E62E04" strokeWidth="4" strokeLinecap="round" />
      <line x1="46" y1="32" x2="62" y2="32" stroke="#E62E04" strokeWidth="4" strokeLinecap="round" />
      <circle cx="32" cy="32" r="4" fill="#FF6F00" />
    </svg>
  );
}
