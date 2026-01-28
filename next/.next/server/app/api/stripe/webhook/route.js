(()=>{var e={};e.id=3287,e.ids=[3287,3374],e.modules={96330:e=>{"use strict";e.exports=require("@prisma/client")},10846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},44870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},29294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},63033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},84297:e=>{"use strict";e.exports=require("async_hooks")},79646:e=>{"use strict";e.exports=require("child_process")},55511:e=>{"use strict";e.exports=require("crypto")},14985:e=>{"use strict";e.exports=require("dns")},94735:e=>{"use strict";e.exports=require("events")},29021:e=>{"use strict";e.exports=require("fs")},81630:e=>{"use strict";e.exports=require("http")},55591:e=>{"use strict";e.exports=require("https")},91645:e=>{"use strict";e.exports=require("net")},21820:e=>{"use strict";e.exports=require("os")},33873:e=>{"use strict";e.exports=require("path")},27910:e=>{"use strict";e.exports=require("stream")},34631:e=>{"use strict";e.exports=require("tls")},79551:e=>{"use strict";e.exports=require("url")},28354:e=>{"use strict";e.exports=require("util")},74075:e=>{"use strict";e.exports=require("zlib")},57075:e=>{"use strict";e.exports=require("node:stream")},82127:(e,t,o)=>{"use strict";o.r(t),o.d(t,{patchFetch:()=>y,routeModule:()=>v,serverHooks:()=>f,workAsyncStorage:()=>b,workUnitAsyncStorage:()=>x});var r={};o.r(r),o.d(r,{POST:()=>m,runtime:()=>g});var i=o(47268),s=o(61657),n=o(52624),a=o(72646),d=o(88125),l=o(87109),p=o(22944),c=o(54844),u=o(93374);let g="nodejs";async function m(e){let t;if((0,p.x4)())return d.NextResponse.json({received:!0,devNoDb:!0});try{await (0,p.BG)()}catch(e){if(e instanceof p.XU)return console.error("/api/stripe/webhook degraded - db unavailable",{message:e.message,db:await (0,p.Fz)()}),new d.NextResponse("Database unavailable, please retry",{status:503});throw e}let o=(await (0,a.b3)()).get("stripe-signature");if(!o)return new d.NextResponse("Missing stripe-signature",{status:400});let r=process.env.STRIPE_WEBHOOK_SECRET;if(!r)return new d.NextResponse("Missing STRIPE_WEBHOOK_SECRET",{status:500});let i=process.env.STRIPE_SECRET_KEY;if(!i)return new d.NextResponse("Missing STRIPE_SECRET_KEY",{status:500});let s=new l.A(i),n=await e.text();try{t=s.webhooks.constructEvent(n,o,r)}catch(e){return new d.NextResponse(`Webhook signature verification failed: ${e?.message||""}`.trim(),{status:400})}if(!(await (0,p.db)().createIdempotencyKeyOnce({scope:"stripe_webhook",key:t.id,requestHash:null,responseJson:null})).created)return d.NextResponse.json({received:!0,duplicate:!0});if("checkout.session.completed"===t.type){let e=t.data.object,o=e?.metadata?.bookingId;if(o){await (0,p.db)().updateBookingStatus({id:o},{status:"CONFIRMED"});let e=process.env.BUSINESS_EMAIL,t=process.env.APP_URL||"http://localhost:3000";if(e){let r=await u.prisma.booking.findUnique({where:{id:o},include:{customer:!0,address:!0,vehicle:!0}});if(r){let o=`${r.address.line1}, ${r.address.suburb}, ${r.address.city}`,i=r.vehicle?.plate||"(not provided)";await (0,c.Tc)({toEmail:e,bookingPublicId:r.publicId,scheduledStartIso:r.slotStart.toISOString(),addressOneLine:o,customerName:r.customer.fullName,customerPhone:r.customer.phone||"(not provided)",customerEmail:r.customer.email||null,vehiclePlate:i,symptoms:r.notes||r.symptomPreset||"(not provided)",adminUrl:`${t}/admin`})}}}else{let o=(process.env.BUSINESS_EMAIL||"").trim();if(o)try{await (0,c.ch)({toEmail:o,stripeEventId:t.id,stripeSessionId:e?.id||null,bookingId:null,amountTotal:e?.amount_total??null,currency:e?.currency??null})}catch(e){console.error("sendStripeOrphanPaymentBusinessEmail failed",e)}}}return d.NextResponse.json({received:!0})}let v=new i.AppRouteRouteModule({definition:{kind:s.RouteKind.APP_ROUTE,page:"/api/stripe/webhook/route",pathname:"/api/stripe/webhook",filename:"route",bundlePath:"app/api/stripe/webhook/route"},resolvedPagePath:"C:\\nzmobileautos\\next\\src\\app\\api\\stripe\\webhook\\route.ts",nextConfigOutput:"",userland:r}),{workAsyncStorage:b,workUnitAsyncStorage:x,serverHooks:f}=v;function y(){return(0,n.patchFetch)({workAsyncStorage:b,workUnitAsyncStorage:x})}},42167:()=>{},95311:()=>{},54844:(e,t,o)=>{"use strict";o.d(t,{$2:()=>g,BY:()=>u,FN:()=>c,Tc:()=>d,ch:()=>p,kU:()=>l});var r=o(46342),i=o(28207);function s(){let e=process.env.RESEND_API_KEY;return e?new r.u(e):null}function n(){let e=(process.env.SMTP_USER||"").trim(),t=(process.env.SMTP_PASS||"").trim();if(!e||!t)return null;let o=(process.env.SMTP_HOST||"smtp.gmail.com").trim(),r=Number((process.env.SMTP_PORT||"465").trim()),i=String(process.env.SMTP_SECURE||"").trim()?"true"===String(process.env.SMTP_SECURE).trim().toLowerCase():465===r;return{host:o,port:r,secure:i,user:e,pass:t}}async function a(e){let t=process.env.EMAIL_FROM||"Mobile Autoworks <bookings@localhost>",o=n();if(o){let r=i.createTransport({host:o.host,port:o.port,secure:o.secure,auth:{user:o.user,pass:o.pass}});await r.sendMail({from:t,to:e.to,subject:e.subject,html:e.html});return}let r=s();if(!r){console.log("[DEV EMAIL]",{to:e.to,subject:e.subject});return}await r.emails.send({from:t,to:[e.to],subject:e.subject,html:e.html})}async function d(e){let t=s(),o=`New confirmed booking: ${e.bookingPublicId}`,r=`
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
  </div>`;await a({to:e.toEmail,subject:t,html:o})}async function c(e){let t=s(),o=`New quote request: ${e.quotePublicId}`,r=`
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
  </div>`;if(!t&&!n()){console.log("[DEV EMAIL]",{to:e.toEmail,subject:o,quotePublicId:e.quotePublicId});return}await a({to:e.toEmail,subject:o,html:r})}async function u(e){let t=s(),o=`${e.reportTitle} is ready`,r=`
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
  </div>`;if(!t&&!n()){console.log("[DEV EMAIL]",{to:e.toEmail,subject:o,bookingRef:e.bookingRef,reportUrl:e.reportUrl});return}await a({to:e.toEmail,subject:o,html:r})}async function g(e){let t=s(),o="Complete payment to confirm your booking",r=`
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
  </div>`;if(!t&&!n()){console.log("[DEV EMAIL]",{to:e.toEmail,subject:o,bookingId:e.bookingId,checkoutUrl:e.checkoutUrl});return}await a({to:e.toEmail,subject:o,html:r})}},93374:(e,t,o)=>{"use strict";o.d(t,{prisma:()=>i});var r=o(96330);let i=global.__prisma||new r.PrismaClient}};var t=require("../../../../webpack-runtime.js");t.C(e);var o=e=>t(t.s=e),r=t.X(0,[4762,7560,2646,536,7109,2944],()=>o(82127));module.exports=r})();