import { Plus_Jakarta_Sans } from 'next/font/google';
import '@/styles/book.css';

const font = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${font.className} book-page`}>
      {children}
    </div>
  );
}
