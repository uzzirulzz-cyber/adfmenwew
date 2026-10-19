import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { findUserByEmail, upsertUser, createSession } from '../../../../lib/auth/store';
import { setSessionCookie, CSRF_COOKIE } from '../../../../lib/auth/sessions';
import { loginAllowed, recordLoginFailure, recordLoginSuccess, issueCsrfToken, csrfCookieOptions, safeEqual } from '../../../../lib/auth/guard';
import { audit } from '../../../../lib/audit';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function POST(req){
 const origin=req.headers.get('origin');
 if(origin && origin!==new URL(req.url).origin)return NextResponse.json({error:'Invalid origin.'},{status:403});
 const ip=req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'unknown';
 const key='shared-pin:'+ip;
 const gate=await loginAllowed(key);
 if(!gate.allowed)return NextResponse.json({error:'Too many attempts. Please wait.'},{status:429});
 let body;try{body=await req.json()}catch{return NextResponse.json({error:'Invalid request.'},{status:400})}
 const expected=process.env.PLAYBEAT_SHARED_PIN;
 if(!expected||!/^\d{6}$/.test(String(body.pin||''))||!safeEqual(body.pin,expected)){
  await recordLoginFailure(key);return NextResponse.json({error:'Incorrect PIN.'},{status:401});
 }
 const email='gateway-operator@playbeatarena.asia';
 let user=await findUserByEmail(email);
 if(user?.disabled)return NextResponse.json({error:'Workspace access is disabled.'},{status:403});
 if(!user){user={id:'playbeat-gateway-operator',email,name:'Gateway Operator',role:'Super Admin',apps:['*'],pinHash:await bcrypt.hash(expected,12),disabled:false};await upsertUser(user);}
 const userAgent=req.headers.get('user-agent')||'unknown';
 const sid=await createSession(user,{ip,userAgent});await setSessionCookie(sid);
 (await cookies()).set(CSRF_COOKIE,issueCsrfToken(),csrfCookieOptions());
 await recordLoginSuccess(key);await audit({action:'auth.shared-pin',actor:user.email,role:user.role,ip,userAgent,result:'success'});
 const next=String(body.next||'');const redirect=/^\/admin(?:\/|$)/.test(next)&&!next.includes('://')&&!next.includes('\\')?next:'/admin/command-center';
 return NextResponse.json({ok:true,redirect},{headers:{'Cache-Control':'no-store'}});
}
