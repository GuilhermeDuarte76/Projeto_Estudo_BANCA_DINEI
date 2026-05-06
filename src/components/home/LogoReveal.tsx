interface Props {
  className?: string;
}

export default function LogoReveal({ className }: Props) {
  return (
    <img
      src="/logo-reveal.svg"
      alt="Banca do Dinei"
      draggable={false}
      className={`select-none ${className ?? ''}`}
    />
  );
}
