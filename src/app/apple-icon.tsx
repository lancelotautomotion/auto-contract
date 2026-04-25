import { ImageResponse } from 'next/og';
import { readFileSync } from 'fs';
import { join } from 'path';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  const markData = readFileSync(join(process.cwd(), 'public/mark_prysme.png'));
  const markSrc = `data:image/png;base64,${markData.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img src={markSrc} width={116} height={112} />
      </div>
    ),
    { width: 180, height: 180 }
  );
}
