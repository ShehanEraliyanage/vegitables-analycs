import './BrandLogo.css';

interface BrandLogoProps {
  className?: string;
  size?: number;
}

/** Uses public favicon.svg so shell and browser chrome stay aligned. */
const BrandLogo = ({ className = '', size = 40 }: BrandLogoProps) => (
  <img
    src="/favicon.svg"
    alt=""
    width={size}
    height={size}
    className={`brand-logo ${className}`.trim()}
    aria-hidden
  />
);

export default BrandLogo;
