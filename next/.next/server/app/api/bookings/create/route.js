(()=>{var e={};e.id=7305,e.ids=[7305],e.modules={96330:e=>{"use strict";e.exports=require("@prisma/client")},10846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},44870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},29294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},63033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},84297:e=>{"use strict";e.exports=require("async_hooks")},79646:e=>{"use strict";e.exports=require("child_process")},55511:e=>{"use strict";e.exports=require("crypto")},14985:e=>{"use strict";e.exports=require("dns")},94735:e=>{"use strict";e.exports=require("events")},29021:e=>{"use strict";e.exports=require("fs")},81630:e=>{"use strict";e.exports=require("http")},55591:e=>{"use strict";e.exports=require("https")},91645:e=>{"use strict";e.exports=require("net")},21820:e=>{"use strict";e.exports=require("os")},33873:e=>{"use strict";e.exports=require("path")},27910:e=>{"use strict";e.exports=require("stream")},34631:e=>{"use strict";e.exports=require("tls")},79551:e=>{"use strict";e.exports=require("url")},28354:e=>{"use strict";e.exports=require("util")},74075:e=>{"use strict";e.exports=require("zlib")},57075:e=>{"use strict";e.exports=require("node:stream")},9717:(e,t,o)=>{"use strict";o.r(t),o.d(t,{patchFetch:()=>k,routeModule:()=>y,serverHooks:()=>h,workAsyncStorage:()=>f,workUnitAsyncStorage:()=>x});var r={};o.r(r),o.d(r,{POST:()=>v,runtime:()=>m});var i=o(47268),s=o(61657),n=o(52624),a=o(88125),d=o(35524),l=o(87109),p=o(22944);async function u(e){let t=process.env.APP_URL||"http://localhost:3000",o=e.booking;if((0,p.x4)()||!process.env.STRIPE_SECRET_KEY)return{id:`dev_session_${o.id}`,url:`${t}/checkout/success?bookingId=${o.id}`};let r=function(){let e=process.env.STRIPE_SECRET_KEY;return e?new l.A(e):null}();if(!r)throw Error("Missing STRIPE_SECRET_KEY");let i=o.pricingSnapshotJson,s=i?.stripeLineItems||[];if(!Array.isArray(s)||0===s.length)throw Error("Missing Stripe line items in pricingSnapshotJson");return await r.checkout.sessions.create({mode:"payment",customer_email:e.customerEmail,expires_at:Math.floor((o.paymentExpiresAt?.getTime()||Date.now()+6e4)/1e3),success_url:`${t}/checkout/success?bookingId=${o.id}`,cancel_url:`${t}/checkout/cancelled?bookingId=${o.id}`,metadata:{bookingId:o.id},line_items:s,payment_intent_data:{metadata:{bookingId:o.id}}})}d.k5(["DIAGNOSTICS","PPI"]),d.k5(["REQUIRED","DEPOSIT","PAY_LATER"]);var c=o(54844);let m="nodejs",g=d.k5(["DIAGNOSTICS","PPI"]),b=d.Ik({serviceType:g,scheduledStartLocal:d.Yj().min(1),address:d.Yj().min(5),vehiclePlate:d.Yj().min(2),vehicleMake:d.Yj().optional().nullable(),vehicleModel:d.Yj().optional().nullable(),vehicleYear:d.vk(e=>""===e||null==e?null:e,d.au.number().int().min(1900).max(2100)).optional().nullable(),vehicleFuel:d.Yj().optional().nullable(),odometer:d.Yj().optional().nullable(),symptoms:d.Yj().min(3),customerName:d.Yj().min(2),customerEmail:d.Yj().email(),customerPhone:d.Yj().min(6)});async function v(e){try{let t=await e.json(),r=b.parse(t);if(!process.env.DATABASE_URL)return new a.NextResponse("Missing DATABASE_URL (database not configured on Vercel)",{status:500});if(!process.env.STRIPE_SECRET_KEY)return new a.NextResponse("Missing STRIPE_SECRET_KEY (Stripe not configured on Vercel)",{status:500});if(!process.env.APP_URL)return new a.NextResponse("Missing APP_URL (set to https://nzmobileauto.vercel.app)",{status:500});try{await (0,p.BG)()}catch(e){if(e instanceof p.XU)return console.error("/api/bookings/create degraded - db unavailable",{message:e.message,db:await (0,p.Fz)()}),a.NextResponse.json({ok:!1,degraded:!0,error:"Booking system temporarily offline. Please call or text 027 642 1824 to book.",fallback:{phone:"+64276421824",displayPhone:"027 642 1824"}},{status:503});throw e}if("DIAGNOSTICS"!==r.serviceType)return new a.NextResponse("Only DIAGNOSTICS booking is enabled in v1",{status:400});let i=function(e){let t=/^([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2})$/.exec(e);if(!t)throw Error("Invalid scheduledStartLocal format");let o=Number(t[1]),r=Number(t[2]),i=Number(t[3]),s=Number(t[4]),n=new Date(Date.UTC(o,r-1,i,s,Number(t[5]),0)),a=function(e,t){let o=new Intl.DateTimeFormat("en-NZ",{timeZone:t,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hourCycle:"h23"}).formatToParts(e),r=e=>o.find(t=>t.type===e)?.value,i=Number(r("year")),s=Number(r("month")),n=Number(r("day")),a=Number(r("hour")),d=Number(r("minute"));return Date.UTC(i,s-1,n,a,d,Number(r("second")))-e.getTime()}(n,"Pacific/Auckland");return new Date(n.getTime()-a)}(r.scheduledStartLocal),s=function(){let e=Number(process.env.BOOKING_DIAGNOSTICS_DURATION_MINUTES||"60")||60,t=Number(process.env.BOOKING_TRAVEL_BUFFER_MINUTES||"15")||15,o=Number(process.env.BOOKING_ADMIN_BUFFER_MINUTES||"15")||15;return{durationMinutes:e,travelMinutes:t,adminMinutes:o,totalMinutes:e+t+o}}(),n=new Date(i.getTime()+6e4*s.totalMinutes);!function(e){let{weekday:t,hour:o,minute:r}=function(e){let t=new Intl.DateTimeFormat("en-NZ",{timeZone:"Pacific/Auckland",weekday:"short",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).formatToParts(e),o=e=>t.find(t=>t.type===e)?.value,r=(o("weekday")||"").toLowerCase(),i=Number(o("hour"));return{weekday:r,hour:i,minute:Number(o("minute"))}}(e);if("sat"===t||"sun"===t)throw Error("Weekends are by request only. Please choose a weekday time or contact us.");let i=60*o+r,s=Number(process.env.BOOKING_RESERVED_MINUTES||"0")||0;if(i<540||i>1020-(s>0?s:90))throw Error("Bookings are available 9am–5pm Monday to Friday. Please select a time within business hours.")}(i);try{let{prisma:e}=await o.e(3374).then(o.bind(o,93374));if(await e.booking.findFirst({where:{OR:[{status:"CONFIRMED"},{status:"PENDING_PAYMENT",paymentExpiresAt:{gt:new Date}}],slotStart:{lt:n},slotEnd:{gt:i}},select:{id:!0,publicId:!0,slotStart:!0,slotEnd:!0}}))return new a.NextResponse("That time is already booked. Please choose a different time.",{status:409})}catch(e){if(String(e?.message||"").toLowerCase().includes("can't reach database server")||"P1001"===String(e?.code||""))return console.error("/api/bookings/create degraded - conflict check db error",e),a.NextResponse.json({ok:!1,degraded:!0,error:"Booking system temporarily offline. Please call or text 027 642 1824 to book.",fallback:{phone:"+64276421824",displayPhone:"027 642 1824"}},{status:503});throw e}let d=function(e){let t=function(e){let t=/^([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2})$/.exec(e);if(!t)return!1;let o=Number(t[1]),r=Number(t[2]),i=Number(t[3]),s=Number(t[4]),n=new Date(Date.UTC(o,r-1,i)).getUTCDay();return 0===n||6===n||s<8||s>=18}(e.scheduledStartLocal),o=t?.25:0;return"DIAGNOSTICS"===e.serviceType?{paymentPolicy:"REQUIRED",paymentExpiryMinutes:60,pricingJson:{currency:"NZD",diagnosticsTotalCents:14e3,afterHours:t,labourSurchargeRate:o,stripeLineItems:[{quantity:1,price_data:{currency:"nzd",unit_amount:14e3,product_data:{name:"Mobile Diagnostics"}}}]}}:{paymentPolicy:"DEPOSIT",paymentExpiryMinutes:60,pricingJson:{currency:"NZD",ppiDepositCents:15e3,afterHours:t,labourSurchargeRate:o,stripeLineItems:[{quantity:1,price_data:{currency:"nzd",unit_amount:15e3,product_data:{name:"Pre-Purchase Inspection (Deposit)"}}}]}}}({serviceType:r.serviceType,scheduledStartLocal:r.scheduledStartLocal}),l=new Date(Date.now()+6e4*d.paymentExpiryMinutes),m=r.address.split(",").map(e=>e.trim()).filter(Boolean),g=m[0]||r.address,v=m[1]||"West Auckland",y=m[2]||"Auckland",f=await (0,p.db)().createDiagnosticsBooking({customer:{fullName:r.customerName,email:r.customerEmail,phone:r.customerPhone},address:{line1:g,suburb:v,city:y,postcode:null,lat:null,lng:null,travelBand:null},vehicle:{plate:r.vehiclePlate.toUpperCase().replace(/[^A-Z0-9]/g,""),make:r.vehicleMake||null,model:r.vehicleModel||null,year:r.vehicleYear??null,fuel:r.vehicleFuel||null,odometer:r.odometer||null},slotStart:i,slotEnd:n,afterHours:!!d.pricingJson?.afterHours,symptomPreset:null,notes:r.symptoms,pricingSnapshotJson:d.pricingJson,paymentExpiresAt:l}),x=await u({booking:f,customerEmail:r.customerEmail});if(!x?.url)return new a.NextResponse("Payment session could not be created. Please try again or contact support.",{status:500});return await (0,p.db)().updateBookingStripeSession({id:f.id},{stripeSessionId:x.id}),await (0,c.$2)({bookingId:f.id,toEmail:r.customerEmail,checkoutUrl:x.url}),a.NextResponse.json({checkoutUrl:x.url})}catch(o){console.error("/api/bookings/create failed",o);let e=o?.issues;if(Array.isArray(e)&&e.length>0){let t=e.map(e=>`${e.path?.join(".")||"field"}: ${e.message}`).join(", ");return new a.NextResponse(`Invalid request: ${t}`,{status:400})}let t="string"==typeof o?.message&&o.message.trim()?o.message.trim():"Unknown server error";return new a.NextResponse(t,{status:500})}}let y=new i.AppRouteRouteModule({definition:{kind:s.RouteKind.APP_ROUTE,page:"/api/bookings/create/route",pathname:"/api/bookings/create",filename:"route",bundlePath:"app/api/bookings/create/route"},resolvedPagePath:"C:\\nzmobileautos\\next\\src\\app\\api\\bookings\\create\\route.ts",nextConfigOutput:"",userland:r}),{workAsyncStorage:f,workUnitAsyncStorage:x,serverHooks:h}=y;function k(){return(0,n.patchFetch)({workAsyncStorage:f,workUnitAsyncStorage:x})}},42167:()=>{},95311:()=>{},54844:(e,t,o)=>{"use strict";o.d(t,{$2:()=>m,BY:()=>c,FN:()=>u,Tc:()=>d,ch:()=>p,kU:()=>l});var r=o(46342),i=o(28207);function s(){let e=process.env.RESEND_API_KEY;return e?new r.u(e):null}function n(){let e=(process.env.SMTP_USER||"").trim(),t=(process.env.SMTP_PASS||"").trim();if(!e||!t)return null;let o=(process.env.SMTP_HOST||"smtp.gmail.com").trim(),r=Number((process.env.SMTP_PORT||"465").trim()),i=String(process.env.SMTP_SECURE||"").trim()?"true"===String(process.env.SMTP_SECURE).trim().toLowerCase():465===r;return{host:o,port:r,secure:i,user:e,pass:t}}async function a(e){let t=process.env.EMAIL_FROM||"Mobile Autoworks <bookings@localhost>",o=n();if(o){let r=i.createTransport({host:o.host,port:o.port,secure:o.secure,auth:{user:o.user,pass:o.pass}});await r.sendMail({from:t,to:e.to,subject:e.subject,html:e.html});return}let r=s();if(!r){console.log("[DEV EMAIL]",{to:e.to,subject:e.subject});return}await r.emails.send({from:t,to:[e.to],subject:e.subject,html:e.html})}async function d(e){let t=s(),o=`New confirmed booking: ${e.bookingPublicId}`,r=`
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
  </div>`;await a({to:e.toEmail,subject:t,html:o})}async function u(e){let t=s(),o=`New quote request: ${e.quotePublicId}`,r=`
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
  </div>`;if(!t&&!n()){console.log("[DEV EMAIL]",{to:e.toEmail,subject:o,bookingRef:e.bookingRef,reportUrl:e.reportUrl});return}await a({to:e.toEmail,subject:o,html:r})}async function m(e){let t=s(),o="Complete payment to confirm your booking",r=`
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
  </div>`;if(!t&&!n()){console.log("[DEV EMAIL]",{to:e.toEmail,subject:o,bookingId:e.bookingId,checkoutUrl:e.checkoutUrl});return}await a({to:e.toEmail,subject:o,html:r})}}};var t=require("../../../../webpack-runtime.js");t.C(e);var o=e=>t(t.s=e),r=t.X(0,[4762,7560,5524,536,7109,2944],()=>o(9717));module.exports=r})();