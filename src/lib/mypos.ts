// myPOS utility - no hardcoded credentials
// All credentials must come from environment variables

export function getMyPOSConfig() {
  const requiredVars = ['MYPOS_SID', 'MYPOS_WALLET', 'MYPOS_KEY_INDEX'];
  for (const v of requiredVars) {
    if (!process.env[v]) {
      throw new Error(`Missing required env var: ${v}`);
    }
  }
  return {
    sid: process.env.MYPOS_SID!,
    wallet: process.env.MYPOS_WALLET!,
    keyIndex: process.env.MYPOS_KEY_INDEX!,
    isLive: process.env.MYPOS_LIVE === 'true',
  };
}
