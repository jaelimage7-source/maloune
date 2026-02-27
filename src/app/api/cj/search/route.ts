import { NextResponse } from 'next/server';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
const CJ = 'https://developers.cjdropshipping.com/api2.0/v1';
const TOKEN_FILE = join(process.cwd(), '.cj-token.json');
function loadToken() {
  try { const d = JSON.parse(readFileSync(TOKEN_FILE,'utf8')); if(d.token && d.expiry > Date.now()) return d.token; } catch {} return null;
}
function saveToken(token: string) {
  writeFileSync(TOKEN_FILE, JSON.stringify({token, expiry: Date.now()+14*24*60*60*1000}));
}
async function getToken() {
  const saved = loadToken();
  if(saved) return saved;
  const r = await fetch(CJ+'/authentication/getAccessToken', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({apiKey:process.env.CJ_API_PASSWORD}) });
  const d = await r.json();
  if(!d.result) throw new Error('CJ Auth: '+d.message);
  saveToken(d.data.accessToken);
  return d.data.accessToken;
}
export async function POST(request: Request) {
  try {
    const {query,page=1,limit=20} = await request.json();
    if(!process.env.CJ_API_PASSWORD) return NextResponse.json({error:'Add CJ API Key to .env'},{status:500});
    const token = await getToken();
    const params = new URLSearchParams({productNameEn:query,pageNum:String(page),pageSize:String(limit)});
    const r = await fetch(CJ+'/product/list?'+params.toString(), { method:'GET', headers:{'CJ-Access-Token':token} });
    const d = await r.json();
    if(!d.result) return NextResponse.json({error:d.message},{status:400});
    const products = (d.data?.list||[]).map((p:any)=>({pid:p.pid,productName:p.productNameEn||p.productName,productImage:p.productImage,sellPrice:parseFloat(String(p.sellPrice))||0,categoryName:p.categoryName||'',productWeight:parseFloat(String(p.productWeight))||0}));
    return NextResponse.json({success:true,products,total:d.data?.total||0});
  } catch(e:any) { return NextResponse.json({error:e.message},{status:500}); }
}
