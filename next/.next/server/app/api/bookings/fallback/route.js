(()=>{var e={};e.id=2383,e.ids=[2383],e.modules={10846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},44870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},29294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},63033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},84297:e=>{"use strict";e.exports=require("async_hooks")},79646:e=>{"use strict";e.exports=require("child_process")},55511:e=>{"use strict";e.exports=require("crypto")},14985:e=>{"use strict";e.exports=require("dns")},94735:e=>{"use strict";e.exports=require("events")},29021:e=>{"use strict";e.exports=require("fs")},81630:e=>{"use strict";e.exports=require("http")},55591:e=>{"use strict";e.exports=require("https")},91645:e=>{"use strict";e.exports=require("net")},21820:e=>{"use strict";e.exports=require("os")},33873:e=>{"use strict";e.exports=require("path")},27910:e=>{"use strict";e.exports=require("stream")},34631:e=>{"use strict";e.exports=require("tls")},79551:e=>{"use strict";e.exports=require("url")},28354:e=>{"use strict";e.exports=require("util")},74075:e=>{"use strict";e.exports=require("zlib")},57075:e=>{"use strict";e.exports=require("node:stream")},22788:(e,t,o)=>{"use strict";o.r(t),o.d(t,{patchFetch:()=>x,routeModule:()=>u,serverHooks:()=>b,workAsyncStorage:()=>m,workUnitAsyncStorage:()=>v});var r={};o.r(r),o.d(r,{POST:()=>c,runtime:()=>p});var i=o(47268),s=o(61657),n=o(52624),a=o(88125),d=o(35524),l=o(54844);let p="nodejs",g=d.Ik({scheduledStartLocal:d.Yj().min(1),address:d.Yj().min(5),vehiclePlate:d.Yj().min(2),symptoms:d.Yj().min(3),customerName:d.Yj().min(2),customerEmail:d.Yj().email().nullable().optional(),customerPhone:d.Yj().min(6)});async function c(e){try{let t=await e.json(),o=g.parse(t),r=(process.env.BUSINESS_EMAIL||"").trim();if(!r)return a.NextResponse.json({ok:!1,error:"BUSINESS_EMAIL is not configured. Please call or text 027 642 1824 to book.",fallback:{phone:"+64276421824",displayPhone:"027 642 1824"}},{status:500});return await (0,l.kU)({toEmail:r,customerName:o.customerName,customerEmail:o.customerEmail??null,customerPhone:o.customerPhone,scheduledStartLocal:o.scheduledStartLocal,address:o.address,vehiclePlate:o.vehiclePlate.toUpperCase().replace(/[^A-Z0-9]/g,""),symptoms:o.symptoms}),a.NextResponse.json({ok:!0})}catch(t){let e=String(t?.message||"Invalid request");return new a.NextResponse(e,{status:400})}}let u=new i.AppRouteRouteModule({definition:{kind:s.RouteKind.APP_ROUTE,page:"/api/bookings/fallback/route",pathname:"/api/bookings/fallback",filename:"route",bundlePath:"app/api/bookings/fallback/route"},resolvedPagePath:"C:\\nzmobileautos\\next\\src\\app\\api\\bookings\\fallback\\route.ts",nextConfigOutput:"",userland:r}),{workAsyncStorage:m,workUnitAsyncStorage:v,serverHooks:b}=u;function x(){return(0,n.patchFetch)({workAsyncStorage:m,workUnitAsyncStorage:v})}},42167:()=>{},95311:()=>{},54844:(e,t,o)=>{"use strict";o.d(t,{$2:()=>u,BY:()=>c,FN:()=>g,Tc:()=>d,ch:()=>p,kU:()=>l});var r=o(46342),i=o(28207);function s(){let e=process.env.RESEND_API_KEY;return e?new r.u(e):null}function n(){let e=(process.env.SMTP_USER||"").trim(),t=(process.env.SMTP_PASS||"").trim();if(!e||!t)return null;let o=(process.env.SMTP_HOST||"smtp.gmail.com").trim(),r=Number((process.env.SMTP_PORT||"465").trim()),i=String(process.env.SMTP_SECURE||"").trim()?"true"===String(process.env.SMTP_SECURE).trim().toLowerCase():465===r;return{host:o,port:r,secure:i,user:e,pass:t}}async function a(e){let t=process.env.EMAIL_FROM||"Mobile Autoworks <bookings@localhost>",o=n();if(o){let r=i.createTransport({host:o.host,port:o.port,secure:o.secure,auth:{user:o.user,pass:o.pass}});await r.sendMail({from:t,to:e.to,subject:e.subject,html:e.html});return}let r=s();if(!r){console.log("[DEV EMAIL]",{to:e.to,subject:e.subject});return}await r.emails.send({from:t,to:[e.to],subject:e.subject,html:e.html})}async function d(e){let t=s(),o=`New confirmed booking: ${e.bookingPublicId}`,r=`
  <div style="background:#0a0a0a;padding:24px;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;">
    <div style="max-width:720px;margin:0 auto;background:#111;border:1px solid rgba(255,255,255,0.08);border-radius:12px;overflow:hidden;">
      <div style="padding:20px 24px;border-bottom:1px solid rgba(255,255,255,0.08);">
        <div style="color:#f6c90e;font-weight:700;">Mobile Autoworks</div>
        <div style="color:#fff;font-size:18px;font-weight:700;margin-top:6px;">New booking confirmed (paid)</div>
      </div>
      <div style="padding:20px 24px;color:rgba(255,255,255,0.86);font-size:14px;line-height:1.6;">
        <div style="margin-bottom:14px;"><strong>Reference:</strong> ${e.bookingPublicId}</div>
        <div style="margin-bottom:14px;"><strong>Preferred time (ISO):</strong> ${e.scheduledStartIso}</div>
        <div style="margin-bottom:14px;"><strong>Address:</strong> ${e.addressOneLine}</div>
        <div style="margin-bottom:14px;"><strong>Vehicle:</strong> ${e.vehiclePlate}</div>
        <div style="margin-bottom:14px;"><strong>Symptoms:</strong><br/>${(e.symptoms||"").replace(/\n/g,"<br/>")}</div>

        <div style="margin-top:18px;padding:14px;border:1px solid rgba(255,255,255,0.08);border-radius:10px;background:rgba(255,255,255,0.04);">
          <div style="font-weight:700;color:#fff;margin-bottom:8px;">Customer</div>
          <div><strong>Name:</strong> ${e.customerName}</div>
          <div><strong>Phone:</strong> ${e.customerPhone}</div>
          <div><strong>Email:</strong> ${e.customerEmail||"(not provided)"}</div>
        </div>

        <p style="margin:18px 0;">
          <a href="${e.adminUrl}" style="display:inline-block;background:#f6c90e;color:#000;padding:12px 16px;border-radius:10px;text-decoration:none;font-weight:700;">Open Admin Dashboard</a>
        </p>
      </div>
    </div>
  </div>`;if(!t&&!n()){console.log("[DEV EMAIL]",{to:e.toEmail,subject:o,bookingPublicId:e.bookingPublicId});return}await a({to:e.toEmail,subject:o,html:r})}async function l(e){let t=`Booking request (DB offline): ${e.customerName}`,o=`
  <div style="background:#0a0a0a;padding:24px;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;">
    <div style="max-width:720px;margin:0 auto;background:#111;border:1px solid rgba(255,255,255,0.08);border-radius:12px;overflow:hidden;">
      <div style="padding:20px 24px;border-bottom:1px solid rgba(255,255,255,0.08);">
        <div style="color:#f6c90e;font-weight:700;">Mobile Autoworks</div>
        <div style="color:#fff;font-size:18px;font-weight:700;margin-top:6px;">Booking request received (database offline)</div>
      </div>
      <div style="padding:20px 24px;color:rgba(255,255,255,0.86);font-size:14px;line-height:1.6;">
        <div style="margin-bottom:14px;"><strong>Preferred time (local):</strong> ${e.scheduledStartLocal}</div>
        <div style="margin-bottom:14px;"><strong>Address:</strong> ${e.address}</div>
        <div style="margin-bottom:14px;"><strong>Vehicle plate:</strong> ${e.vehiclePlate}</div>
        <div style="margin-bottom:14px;"><strong>Symptoms:</strong><br/>${(e.symptoms||"").replace(/\n/g,"<br/>")}</div>
        <div style="margin-top:18px;padding:14px;border:1px solid rgba(255,255,255,0.08);border-radius:10px;background:rgba(255,255,255,0.04);">
          <div style="font-weight:700;color:#fff;margin-bottom:8px;">Customer</div>
          <div><strong>Name:</strong> ${e.customerName}</div>
          <div><strong>Phone:</strong> ${e.customerPhone}</div>
          <div><strong>Email:</strong> ${e.customerEmail||"(not provided)"}</div>
        </div>
      </div>
    </div>
  </div>`;await a({to:e.toEmail,subject:t,html:o})}async function p(e){let t=`Stripe payment received but booking missing: ${e.stripeEventId}`,o=`
  <div style="background:#0a0a0a;padding:24px;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;">
    <div style="max-width:720px;margin:0 auto;background:#111;border:1px solid rgba(255,255,255,0.08);border-radius:12px;overflow:hidden;">
      <div style="padding:20px 24px;border-bottom:1px solid rgba(255,255,255,0.08);">
        <div style="color:#f6c90e;font-weight:700;">Mobile Autoworks</div>
        <div style="color:#fff;font-size:18px;font-weight:700;margin-top:6px;">Orphan Stripe payment alert</div>
      </div>
      <div style="padding:20px 24px;color:rgba(255,255,255,0.86);font-size:14px;line-height:1.6;">
        <div style="margin-bottom:10px;"><strong>Event:</strong> ${e.stripeEventId}</div>
        <div style="margin-bottom:10px;"><strong>Session:</strong> ${e.stripeSessionId||"(unknown)"}</div>
        <div style="margin-bottom:10px;"><strong>bookingId metadata:</strong> ${e.bookingId||"(missing)"}</div>
        <div style="margin-bottom:10px;"><strong>Amount:</strong> ${null!=e.amountTotal?String(e.amountTotal):"(unknown)"} ${e.currency||""}</div>
        <div style="margin-top:14px;color:rgba(255,255,255,0.7);">
          Action: check Stripe dashboard for the session/payment intent, then verify booking persistence and reconcile manually.
        </div>
      </div>
    </div>
  </div>`;await a({to:e.toEmail,subject:t,html:o})}async function g(e){let t=s(),o=`New quote request: ${e.quotePublicId}`,r=`
  <div style="background:#0a0a0a;padding:24px;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;">
    <div style="max-width:720px;margin:0 auto;background:#111;border:1px solid rgba(255,255,255,0.08);border-radius:12px;overflow:hidden;">
      <div style="padding:20px 24px;border-bottom:1px solid rgba(255,255,255,0.08);">
        <div style="color:#f6c90e;font-weight:700;">Mobile Autoworks</div>
        <div style="color:#fff;font-size:18px;font-weight:700;margin-top:6px;">New quote request</div>
      </div>
      <div style="padding:20px 24px;color:rgba(255,255,255,0.86);font-size:14px;line-height:1.6;">
        <div style="margin-bottom:14px;"><strong>Reference:</strong> ${e.quotePublicId}</div>
        <div style="margin-bottom:14px;"><strong>Category:</strong> ${e.category}</div>
        <div style="margin-bottom:14px;"><strong>Urgency:</strong> ${e.urgency}</div>
        <div style="margin-bottom:14px;"><strong>Address:</strong> ${e.addressOneLine}</div>
        <div style="margin-bottom:14px;"><strong>Vehicle:</strong> ${[e.vehiclePlate,e.vehicleYear?String(e.vehicleYear):null,e.vehicleMake,e.vehicleModel].filter(Boolean).join(" ")}</div>
        <div style="margin-bottom:14px;"><strong>Symptoms:</strong> ${(e.symptoms||[]).length?(e.symptoms||[]).join(", "):"(none)"}</div>
        <div style="margin-bottom:14px;"><strong>Description:</strong><br/>${(e.description||"").replace(/\n/g,"<br/>")}</div>

        <div style="margin-top:18px;padding:14px;border:1px solid rgba(255,255,255,0.08);border-radius:10px;background:rgba(255,255,255,0.04);">
          <div style="font-weight:700;color:#fff;margin-bottom:8px;">Customer</div>
          <div><strong>Name:</strong> ${e.customerName}</div>
          <div><strong>Phone:</strong> ${e.customerPhone}</div>
          <div><strong>Email:</strong> ${e.customerEmail||"(not provided)"}</div>
        </div>

        <p style="margin:18px 0;">
          <a href="${e.adminUrl}" style="display:inline-block;background:#f6c90e;color:#000;padding:12px 16px;border-radius:10px;text-decoration:none;font-weight:700;">Open Admin Dashboard</a>
        </p>
      </div>
    </div>
  </div>`;if(!t&&!n()){console.log("[DEV EMAIL]",{to:e.toEmail,subject:o,quotePublicId:e.quotePublicId});return}await a({to:e.toEmail,subject:o,html:r})}async function c(e){let t=s(),o=`${e.reportTitle} is ready`,r=`
  <div style="background:#0a0a0a;padding:24px;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;">
    <div style="max-width:640px;margin:0 auto;background:#111;border:1px solid rgba(255,255,255,0.08);border-radius:12px;overflow:hidden;">
      <div style="padding:20px 24px;border-bottom:1px solid rgba(255,255,255,0.08);">
        <div style="color:#f6c90e;font-weight:700;">Mobile Autoworks</div>
        <div style="color:#fff;font-size:18px;font-weight:700;margin-top:6px;">Your report is ready</div>
      </div>
      <div style="padding:20px 24px;color:rgba(255,255,255,0.86);font-size:14px;line-height:1.6;">
        <p>Your <strong>${e.reportTitle}</strong> is ready to view.</p>
        <p style="margin:18px 0;">
          <a href="${e.reportUrl}" style="display:inline-block;background:#f6c90e;color:#000;padding:12px 16px;border-radius:10px;text-decoration:none;font-weight:700;">View report</a>
        </p>
        <p style="color:rgba(255,255,255,0.65);font-size:12px;">Booking reference: ${e.bookingRef}</p>
      </div>
    </div>
  </div>`;if(!t&&!n()){console.log("[DEV EMAIL]",{to:e.toEmail,subject:o,bookingRef:e.bookingRef,reportUrl:e.reportUrl});return}await a({to:e.toEmail,subject:o,html:r})}async function u(e){let t=s(),o="Complete payment to confirm your booking",r=`
  <div style="background:#0a0a0a;padding:24px;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;">
    <div style="max-width:640px;margin:0 auto;background:#111;border:1px solid rgba(255,255,255,0.08);border-radius:12px;overflow:hidden;">
      <div style="padding:20px 24px;border-bottom:1px solid rgba(255,255,255,0.08);">
        <div style="color:#f6c90e;font-weight:700;">Mobile Autoworks</div>
        <div style="color:#fff;font-size:18px;font-weight:700;margin-top:6px;">Payment required to confirm</div>
      </div>
      <div style="padding:20px 24px;color:rgba(255,255,255,0.86);font-size:14px;line-height:1.6;">
        <p>Thanks for your booking request. To confirm your appointment, please complete payment using the button below.</p>
        <p style="margin:18px 0;">
          <a href="${e.checkoutUrl}" style="display:inline-block;background:#f6c90e;color:#000;padding:12px 16px;border-radius:10px;text-decoration:none;font-weight:700;">Pay now to confirm</a>
        </p>
        <p style="color:rgba(255,255,255,0.65);font-size:12px;">Booking reference: ${e.bookingId}</p>
      </div>
    </div>
  </div>`;if(!t&&!n()){console.log("[DEV EMAIL]",{to:e.toEmail,subject:o,bookingId:e.bookingId,checkoutUrl:e.checkoutUrl});return}await a({to:e.toEmail,subject:o,html:r})}}};var t=require("../../../../webpack-runtime.js");t.C(e);var o=e=>t(t.s=e),r=t.X(0,[4762,7560,5524,536],()=>o(22788));module.exports=r})();