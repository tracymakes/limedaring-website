---
{
  "date": "2019-03-20",
  "featuredimage": "",
  "featured": "True",
  "author": "Tracy Osborn",
  "excerpt": "A month ago, an error with my business's email address caused it to bounce. Even after I discovered and fixed the issue, this led to a still-unknown amount of emails to silently be suppressed while I carried on unaware. Email suppressions should be something everyone should be aware about but I've found over the last few weeks that no service provider was aware their mail API services (e.g., Mailgun, Sendgrid, and others) would suppress bounced emails.",
  "title": "Does your inbox feel too quiet? The hidden consequences for temporarily breaking your email.",
  "external": "",
  "category": "development",
  "slug": "external-inbox-quiet",
  "originalUrl": "https://hellowebbooks.com/news/does-your-inbox-feel-too-quiet-hidden-consequences-temporarily-breaking-your-email",
  "sourceUrl": "https://hellowebbooks.com/news/does-your-inbox-feel-too-quiet-hidden-consequences-temporarily-breaking-your-email",
  "imported": true
}
---

<section><p><strong>A month ago, an error with my business's email address caused it to bounce. Even after I discovered and fixed the issue, this led to a still-unknown amount of emails to silently be suppressed while I carried on unaware. </strong></p>
<p>Email suppressions <em>should</em> be something everyone should be aware about but I've found over the last few weeks that no service provider was aware their mail API services (e.g., Mailgun, Sendgrid, and others) would suppress bounced emails.</p>
<p>I'm writing this article not only to share my experiences, but hopefully raise awareness for this sort of problem with both customers and service providers so no one will have to go through this very annoying mess like I have.</p>
<h2>Making a dumb mistake and breaking my email, causing issues I didn't anticipate.</h2>
<p>As I am a person who runs this web app, I wanted a personal email address using the domain — <a href="mailto:tracy@hellowebbooks.com">tracy@hellowebbooks.com</a>.</p>
<p>Of course, setting up an email address requires some logistics, and I originally went the easy-but-pricey way of setting up Google Apps and paying $5/month. I set up my personal Gmail to receive emails sent from <a href="mailto:tracy@hellowebbooks.com">tracy@hellowebbooks.com</a> and promptly moved onto other things. This was probably done in mid 2018.</p>
<p><strong>In February 2019, I noticed the $5 monthly charge on my credit card and decided to kill my Google Apps account to save myself some pocket change, completely forgetting that that was what powered <a href="mailto:tracy@hellowebbooks.com">tracy@hellowebbooks.com</a>.</strong> I have a bunch of other emails that were set up using a legacy, free, version of Google Apps that forward to my Gmail account, and in a short-sided moment, I failed to remember that this email address was not set up that way as well, nor that it wouldn't fall back to this behavior after cancelling the paid subscription.</p>
<p><strong>All emails from any service that was using that email would now bounce, and of course, I had no idea this was happening.</strong></p>
<p>Later, a kind soul emailed me to let me know my email address was bouncing, leading to a frantic few hours discovering that I broke my email when I disabled Google Apps, leading me to set up a temporary mail server, and then setting up Google Domains for future forwarding. Voila, <a href="mailto:tracy@hellowebbooks.com">tracy@hellowebbooks.com</a> worked again! I moved forward with my life confident that I fixed the issue.</p>
<h2>My inbox felt quieter, but <em>some</em> emails worked.</h2>
<p>Weeks again later, I started to notice something weird. I received fewer emails than before, and I would wonder if the email was still working. But when sending myself an email from an outside source, the email would arrive successfully so I would put it out of my mind again.</p>
<p>It wasn't until I few days ago I realized that I wasn't receiving <em>any</em> emails from Gumroad, which was particularly worrying, as I needed to ship physical products after receiving a product payment notification.</p></section>
            
              <section><blockquote><p lang="en" dir="ltr">(Yes, notifications are enabled. No, they’re not in spam. Yes, other emails from Gumroad are working.) <a href="https://t.co/40TRaSaE7R">pic.twitter.com/40TRaSaE7R</a></p>— Tracy Osborn (@tracymakes) <a href="https://twitter.com/tracymakes/status/1104117667844288518?ref_src=twsrc%5Etfw">March 8, 2019</a></blockquote> </section>
            
              <section><p>Gumroad responded that they were having issues with Gmail, so I blamed the whole thing on some disappearing Gmail email bug with Gumroad, and not my fault or responsibility, and put it out of my mind yet again.</p></section>
            
              <section><blockquote><p lang="en" dir="ltr">Just to add: it's super weird because they don't effect all emails nor do they go into spam. They just don't show up (and then sometimes they do a while later).</p>— Sahil Lavingia (@shl) <a href="https://twitter.com/shl/status/1104117855358861312?ref_src=twsrc%5Etfw">March 8, 2019</a></blockquote></section>
            
              <section><p>Then I noticed that mailing-list exports weren't arriving in my email from ConvertKit, nor password reset requests. And <em>yet again</em> I sent myself test emails, which arrived promptly, and I reassured myself that my email address was indeed working.</p>
<h2>Fixing my own mail service led me to realize that mail API services were silently suppressing my email.</h2>
<p>It wasn't until I was working on the new version of this web app when I finally discovered what was actually happening. I launched the new version, and in testing, ran into a 500 error. This should have emailed me a report, which never arrived (of course), so I hustled over to Mailgun to see if my web server actually sent the email.</p>
<p><strong>It was there I discovered how mail API services will silently suppress bouncing emails, and I hadn't been receiving emails from my <em>own</em> mail service for about a month.</strong></p></section>
            
              <section><figure>
    <img src="/static/imported/external-inbox-quiet/205b1056a6c3.png" alt="Mailgun screenshot showing suppressed emails" loading="lazy" decoding="async">
    <figcaption>Suppressed emails over the last month.</figcaption>
</figure></section>
            
              <section><p>Seeing <a href="mailto:tracy@hellowebbooks.com">tracy@hellowebbooks.com</a> suppressed by my own mail service caused a big <em>a ha</em> moment: <strong><em>All</em> web services I used with that email were silently suppressing my emails.</strong> It explained why I received some emails, but not others; why emailing from another email address worked fine while emails and notifications from services I used were silently failing.</p>
<p>And web services themselves weren't often aware of this issue, like Gumroad above, who blamed it on Gmail.</p>
<p>I now have the task of pinging <em>every single service I signed up for with this email address to see if my emails are being suppressed.</em></p></section>
            
              <section><figure>
    <img src="/static/imported/external-inbox-quiet/85c2e67cdc1d.png" alt="Screenshot of my email featuring a convo with eFulfillment Service, who was suppressing my emails." loading="lazy" decoding="async">
    <figcaption>Screenshot of my email featuring a convo with eFulfillment Service, who was suppressing my emails.</figcaption>
</figure></section>
            
              <section><h2>Web services and support forget that this is a feature offered by their mail API services.</h2>
<p>For example, on <a href="https://www.mailgun.com/deliverability/bounce-management-software">Mailgun's features page</a>: </p>
<blockquote>
<p>The 2 Types of Email Bounces: (...) Hard bounce: messages may permanently fail because the email address doesn’t actually exist or is no longer valid. For this bounce type, <strong>bounce management software can automatically suppress these emails from your email lists.</strong> This will help you keep a clean email list and a positive email reputation.</p>
</blockquote>
<p>On <a href="https://mandrill.zendesk.com/hc/en-us/articles/205582937-About-Bounces">Mandrill's side</a>:</p>
<blockquote>
<p><strong>After a bounce occurs for a recipient email address, Mandrill stops attempting delivery of the email.</strong> Further email to that address will be rejected temporarily.</p>
<p>Rejections shouldn't be removed in bulk, but if you know that a bounce was temporary or you've resolved an issue with the receiving server, <strong>you can remove individual rejections for a small hit to your account's reputation.</strong></p>
</blockquote>
<h2>Increasing awareness that this is something someone should check out if they suspect email issues.</h2>
<p>The original problem was solely my fault, for making a quick, silly decision to cancel a service I was using and not thinking through the consequences. </p>
<p>However, figuring out and fixing the issue has been made <em>so much more difficult</em> due to the services I used forgetting to check their email suppression lists when I emailed in asking for support. </p>
<p>I had also asked several very computer- and web-savvy friends for help figuring out my email issues and they also failed to remember that email suppression lists could have been the cause of my email issues </p>
<h2>Fixes if this happens to you.</h2>
<ol>
<li>Of course, don't make changes to your email provider that could potentially cause bounces. Prevention is the best medicine.</li>
<li>Password resets are a great way to quickly trigger an email to test whether your email address is being suppressed.</li>
<li>If you're using an email provider like Gmail, you can add +WORD to your email address (for example, <a href="mailto:tracy+test@hellowebbooks.com">tracy+test@hellowebbooks.com</a> will still go to <a href="mailto:tracy@hellowebbooks.com">tracy@hellowebbooks.com</a>). You can switch out the email used on a website and trigger a password reset to see if an email will then arrive. If they do, that likely means your original email is suppressed by their system.</li>
<li>Ask support to remove your email address from their email suppression lists, and be prepared to walk them through the process as quite a few I conversed with weren't aware this could be an issue. </li>
</ol>
<hr>
<p>This has been a <em>fun</em> issue to diagnose and fix over the last few weeks and I've learned a lot in that time. Here's hoping it helps you as well!</p></section>
