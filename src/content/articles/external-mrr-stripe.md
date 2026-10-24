---
{
  "date": "2016-08-06",
  "featuredimage": "",
  "featured": "True",
  "author": "Tracy Osborn",
  "excerpt": "I love Stripe (the customer payment solution I advocate using in Hello Web App: Intermediate Concepts), but I wish the Stripe's dashboard came with a bit more information about the state of your project and revenue.",
  "title": "Calculating your Stripe monthly recurring revenue (MRR)",
  "external": "",
  "category": "development, instruction",
  "slug": "external-mrr-stripe",
  "originalUrl": "https://hellowebapp.com/news/calculating-mrr-with-stripe/",
  "sourceUrl": "https://hellowebbooks.com/news/calculating-mrr-with-stripe/",
  "imported": true
}
---

<section><p>I love <a href="https://stripe.com/">Stripe</a> (the customer payment solution I advocate using in <a href="http://hellowebapp.com/intermediate-concepts">Hello Web App: Intermediate Concepts</a>), but I wish the Stripe's dashboard came with a bit more information about the state of your project and revenue.</p></section>
            
              <section><figure>
    <img src="/static/imported/external-mrr-stripe/1b8705db9742.png" alt="" loading="lazy" decoding="async">
    <figcaption>Actually the current WeddingLovely dashboard. #YOLO</figcaption>
</figure></section>
            
              <section><p>In particular, I wish it had MRR (monthly recurring revenue), which is a good indicator of health for your app's revenue. For <a href="http://weddinglovely.com/">WeddingLovely</a>, my wedding planning and vendor marketplace app, I have people on monthly <em>and</em> (mostly) yearly subscriptions, not to mention a lot of folks with discounts. Calculating MRR just based on the number of customers I have would be fairly inaccurate. So I need to query Stripe and calculate MRR based on the subscriptions and discounts applied to my actual customers, and I wrote a script to do this.</p>
<p>Note: This does not comply with generally accepted accounting principles, so don't use this for your accounting. It's just a quick estimation of your Stripe subscriptions.</p>
<p><strong>Prerequisites</strong>: Django app with an active Stripe account (with the <a href="https://pypi.python.org/pypi/stripe/">Stripe Python library</a> installed), with at least a few active customers (can be test data).</p>
<p>I recommend reading <a href="http://hellowebapp.com/intermediate-concepts">Hello Web App: Intermediate Concepts</a>'s Stripe chapter if you're looking to learn how to tie in Stripe to your Django app.</p>
<h2>The code:</h2>
<p>The necessary bits of code to calculate and return MRR:</p></section>
            
              <section><pre><code>
# Import me at the top.
import stripe
from django.conf import settings
stripe.api_key = settings.STRIPE_SECRET

# Grab all your customers from Stripe.
# I have about 200 customers so I set the limit to 50 - the 
# default is 10.
stripe_customers = stripe.Customer.list(
    limit=50,
    expand=['data.subscription'],
)

# The results are auto-paginated, so you need to loop over 
# the pages.
for customer in stripe_customers.auto_paging_iter():

    # Grab the subscriptions for the specific customer.
    subscriptions = customer.subscriptions

    # Start tracking revenue for that customer.
    rev = 0
    for sub in subscriptions:
        # Year subscriptions need to be divided by 12. Update
        # this to match your specific subscription intervals.
        if sub.plan.interval == "year":
            rev += sub.plan.amount / 12.0
        elif sub.plan.interval == "month":
            rev += sub.plan.amount

    # If your customer has a coupon attached, make sure to take 
    # that into account for your revenue.
    if customer.discount:
        percent_off = customer.discount.coupon.percent_off
        discount = rev * (percent_off / 100.0)
        rev = rev - discount

    # Add this customer's revenue to your total.
    monthly_rev += rev

# Total monthly revenue, divided by 100 because Stripe gives 
# revenue in cents
monthly_rev = monthly_rev / 100
</code></pre></section>
            
              <section><p>This looks deceptively simple, but it took me a couple of hours to figure out that I need to loop over the results returned from Stripe, and that I can't <code>len(stripe_customers)</code> because it actually isn't a simple list (It'll always return <code>4</code> because that's the number of keys in the underlying dict structure.)</p>
<h2>The Django management command:</h2>
<p>Here's my full script if you'd like to copy my Django management command that has nice printouts and whatnot. There is also a chapter on scripts in <a href="http://hellowebapp.com/intermediate-concepts">Hello Web App: Intermediate Concepts</a> if you're interested in learning more!</p>
<p><em>mrr.py</em></p></section>
            
              <section><pre><code>
import stripe

from django.conf import settings
from django.core.management.base import BaseCommand
stripe.api_key = settings.STRIPE_SECRET

class Command(BaseCommand):
    def handle(self, *args, **options):
        monthly_rev = 0
        stripe_customers = stripe.Customer.list(
            limit=50,
            expand=['data.subscription'],
        )

        print "------"
        for customer in stripe_customers.auto_paging_iter():
            print "Profile: %s" % customer.description
            subscriptions = customer.subscriptions

            rev = 0
            for sub in subscriptions:
                print "Interval: %s" % sub.plan.interval
                if sub.plan.interval == "year":
                    rev += sub.plan.amount / 12.0
                elif sub.plan.interval == "month":
                    rev += sub.plan.amount
                else:
                    print "ISSUE"
            if customer.discount:
                percent_off = customer.discount.coupon.percent_off
                discount = rev * (percent_off / 100.0)
                rev = rev - discount
                print "Rev with discount: %f (%f off)" % (rev, percent_off)
            else:
                print "Revenue: %f" % rev 

            monthly_rev += rev
            print "Total revenue now: %f" % monthly_rev
            print "&gt;"

        print "------"

        # because Stripe gives us revenue in cents...
        monthly_rev = monthly_rev / 100

        print "MRR: $%f" % monthly_rev
</code></pre></section>
            
              <section><p>After all this work, I figured out that WeddingLovely's MRR is $1568.25. Not bad, not bad at all.</p>
<p>Go forth and conquer with your new datapoint for your app's health!</p>
<p><strong>Update</strong>: Discovered <a href="https://stripe.com/docs/api#expanding_objects">Stripe's "expanding objects" feature on API calls</a>, so we can grab subscriptions as well when we're making the API call for customers, so we don't have to do additional API calls.</p></section>
