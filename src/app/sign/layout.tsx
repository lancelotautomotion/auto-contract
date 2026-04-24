import { Plus_Jakarta_Sans } from 'next/font/google';
import '@/styles/sign.css';

const font = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

export default function SignLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${font.className} sign-page`}>{children}</div>;
}
