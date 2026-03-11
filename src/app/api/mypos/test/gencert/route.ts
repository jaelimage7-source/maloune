import { NextResponse } from 'next/server';
import { execSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

export async function GET() {
  try {
    const b64Key = process.env.MYPOS_PRIVATE_KEY_B64 || '';
    const privateKey = b64Key
      ? Buffer.from(b64Key, 'base64').toString('utf-8')
      : (process.env.MYPOS_PRIVATE_KEY || '').replace(/\\n/g, '\n');

    const tmpDir = os.tmpdir();
    const keyPath = path.join(tmpDir, 'mypos_priv.pem');
    const certPath = path.join(tmpDir, 'mypos_pub.crt');
    fs.writeFileSync(keyPath, privateKey, { mode: 0o600 });

    execSync(`openssl req -new -x509 -key ${keyPath} -out ${certPath} -days 3650 -subj "/CN=MALOUNE/O=MALOUNE/C=FR"`);

    const cert = fs.readFileSync(certPath, 'utf-8');
    fs.unlinkSync(keyPath);
    fs.unlinkSync(certPath);

    return new Response(cert, {
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': 'attachment; filename="maloune_public_cert.crt"',
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
