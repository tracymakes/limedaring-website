---
{
  "date": "2016-06-10",
  "featuredimage": "",
  "featured": "True",
  "author": "Tracy Osborn",
  "excerpt": "In this walkthrough, we're going to build something relatively easy: a simple contact form where your users can enter their name, email address, and message, and your website will email you the message (with the user's email as the reply-to.)",
  "title": "How to set up a contact form with Django",
  "external": "",
  "category": "development, instruction",
  "slug": "external-django-form",
  "originalUrl": "https://hellowebapp.com/news/tutorial-setting-up-a-contact-form-with-django/",
  "sourceUrl": "https://hellowebbooks.com/news/tutorial-setting-up-a-contact-form-with-django/",
  "imported": true
}
---

<section><p><em>This tutorial is intended as a follow-on to my book, <a href="https://hellowebbooks.com/learn-django/">Hello Web App</a>, which teaches the basics of web app development — from ideation to deployment. <a href="https://hellowebbooks.com/order/">You can order the book here (starting at $14.95).</a></em></p>
<p>In this walkthrough, we're going to build something relatively easy: <strong>a simple contact form where your users can enter their name, email address, and message</strong>, and your website will email you the message (with the user's email as the reply-to.)</p>
<h2>Set up the URL</h2>
<p>Pretty much every new feature that'll go into your web app will go through the same process: set up the URL, set up the logic, set up the template. For the URL, we're going to set up a simple page under contact, so: <em>http://localhost.com/contact/</em>.</p>
<p><em><strong>Hint:</strong> "collection" is the name of the specific Django app we set up in the <a href="https://hellowebbooks.com/learn-django/">Hello Web App tutorial</a>. Replace it with the name of your own web app.</em></p>
<p>Add the below to your <em>urls.py</em>:</p></section>
            
              <section><p>urls.py</p>
<pre><code>
# add to the top
from collection import views

urlpatterns = [
    url(r'^$', views.index, name='home'),
    # new url definition
    url(r'^contact/$', views.contact, name='contact'),
</code></pre></section>
            
              <section><h2>Start setting up the view</h2>
<p>Now in <em>views.py</em>, we need to start setting up the logic. Let's set it up to just display a form for now, and we'll do the rest of the logic for after the form is submitted in a bit:</p></section>
            
              <section><p>views.py</p>
<pre><code>
# add to the top
from collection.forms import ContactForm

# add to your views
def contact(request):
    form_class = ContactForm

    return render(request, 'contact.html', {
        'form': form_class,
    })
</code></pre></section>
            
              <section><p>We're just grabbing a form (which we haven't defined yet) and passing it over into the template (which we haven't created yet.)</p>
<h2>Set up the form</h2>
<p>In <em><a href="https://hellowebbooks.com/learn-django/">Hello Web App</a></em>, we went over creating forms with <code>ModelForm</code>s, but skipped creating basic forms without a model. It's just as simple!</p>
<p>In our <em>forms.py</em>, add the below form code:</p></section>
            
              <section><p>forms.py</p>
<pre><code>
# make sure this is at the top if it isn't already
from django import forms

# our new form
class ContactForm(forms.Form):
    contact_name = forms.CharField(required=True)
    contact_email = forms.EmailField(required=True)
    content = forms.CharField(
        required=True,
        widget=forms.Textarea
    )
</code></pre></section>
            
              <section><p>We're going to define the fields we want in our form, which'll be just <strong>the contact's name, their email, and what they'd like to say to you.</strong></p>
<p>All those form fields were grabbed from <a href="https://docs.djangoproject.com/en/1.8/ref/forms/fields/">Django's Form fields documentation</a>, which is pretty easy to read to see what other fields are available. We're making all the form fields required, using an <code>EmailField</code> for the email so we can take advantage of the additional email formatting checks, and making the "content" field a larger <code>Textarea</code>.</p>
<h2>Create the template</h2>
<p>Now we need to create the <em>template.html</em> page to display the contact form on our website. We're going to extend the base layout we created in the <em><a href="https://hellowebbooks.com/learn-django/">Hello Web App</a></em> tutorial, and then create the form using the form passed in from our view.</p></section>
            
              <section><p>contact.html</p>
<pre><code>
{% extends 'layouts/base.html' %}
{% block title %}Contact - {{ block.super }}{% endblock %}

{% block content %}
&lt;h1&gt;Contact&lt;/h1&gt;
&lt;form role="form" action="" method="post"&gt;
    {% csrf_token %}
    {{ form.as_p }}
    &lt;button type="submit"&gt;Submit&lt;/button&gt;
&lt;/form&gt;
{% endblock %}
</code></pre></section>
            
              <section><p>At this point, we have all the pieces in place to display the form. Load <em>/contact/</em> and check it out:</p></section>
            
              <section><figure>
    <img src="/static/imported/external-django-form/13532c19e486.png" alt="" loading="lazy" decoding="async">
</figure></section>
            
              <section><p>Nice! Now let's start adding the logic in the back end to handle the information submitted by the user.</p>
<h2>Set up our local email server...</h2>
<p>This will be redundant for you if you've finished the <em><a href="https://hellowebbooks.com/learn-django/">Hello Web App</a></em> tutorial. In case you haven't, all you need to do to set up a local email server is add these lines to the bottom of your <em>settings.py</em>:</p></section>
            
              <section><p>settings.py</p>
<pre><code>
EMAIL_BACKEND =
  'django.core.mail.backends.console.EmailBackend'
DEFAULT_FROM_EMAIL = '<a href="mailto:testing@example.com">testing@example.com</a>'
EMAIL_HOST_USER = ''
EMAIL_HOST_PASSWORD = ''
EMAIL_USE_TLS = False
EMAIL_PORT = 1025
</code></pre></section>
            
              <section><p>This tells Django to output the "email" to your console, where you ran your <code>python manage.py runserver</code> command. We'll see what this looks like in a second.</p>
<h2>Add the email logic</h2>
<p>Let's fill out the rest of the email logic. Here's the view from before, now filled in:</p></section>
            
              <section><p>views.py</p>
<pre><code>
# new imports that go at the top of the file
from django.core.mail import EmailMessage
from django.shortcuts import redirect
from django.template.loader import get_template

# our view
def contact(request):
    form_class = ContactForm

    # new logic!
    if request.method == 'POST':
        form = form_class(data=request.POST)

        if form.is_valid():
            contact_name = request.POST.get(
                'contact_name'
            , '')
            contact_email = request.POST.get(
                'contact_email'
            , '')
            form_content = request.POST.get('content', '')

            # Email the profile with the
            # contact information
            template =
                get_template('contact_template.txt')
            context = {
                'contact_name': contact_name,
                'contact_email': contact_email,
                'form_content': form_content,
            }
            content = template.render(context)

            email = EmailMessage(
                "New contact form submission",
                content,
                "Your website" +'<hi@weddinglovely.com>',
                ['<a href="mailto:youremail@gmail.com">youremail@gmail.com</a>'],
                headers = {'Reply-To': contact_email }
            )
            email.send()
            return redirect('contact')

    return render(request, 'contact.html', {
        'form': form_class,
    })
</hi@weddinglovely.com></code></pre>

<p>Phew, a lot of logic! If you read the it from top to bottom, here's what's happening:</p>

<ul>
    <li>If the form was submitted:
        <ul>
            <li>Apply the information from the form to the form class we set up before.</li>
            <li>Make sure that everything is valid (no missing fields, etc.)</li>
            <li>Take the form information and put it in variables.</li>
            <li>Stick the form information into a contact form template (which'll we will create in a second)</li>
            <li>Create an email message using that contact template, and send the message.</li>
            <li>Redirect to our contact page (not ideal, we'll go into why below.)</li>
        </ul>
    </li>
    <li>Otherwise, just create the template with a blank form.</li>
</ul></section>
            
              <section><h2>Create a template form for your email</h2>
<p>Before we can test our logic, we need to create an email template. Our email template is going to be simple, just showing the sections that our user filled out. Create a new file in your templates directory (<code>touch contact_template.txt</code>) and fill it in with the info below:</p></section>
            
              <section><p>contact_template.txt</p>
<pre><code>
Contact Name:
{{ contact_name }}

Email:
{{ contact_email }}

Content:
{{ form_content|safe|striptags }}
</code></pre></section>
            
              <section><h2>Improve the form (optional)</h2>
<p>In the screenshot of the form above, we can see that the labels of the form aren't very "pretty" — for example, just saying "Contact name" which is very impersonal.</p>
<p>Django creates these names automatically from your field names, but we can set our own pretty label names in the form definition in <em>forms.py</em>. Update your code to the below:</p></section>
            
              <section><p>forms.py</p>
<pre><code>
class ContactForm(forms.Form):
    contact_name = forms.CharField(required=True)
    contact_email = forms.EmailField(required=True)
    content = forms.CharField(
        required=True,
        widget=forms.Textarea
    )

    # the new bit we're adding
    def __init__(self, *args, **kwargs):
        super(ContactForm, self).__init__(*args, **kwargs)
        self.fields['contact_name'].label = "Your name:"
        self.fields['contact_email'].label = "Your email:"
        self.fields['content'].label =
            "What do you want to say?"
</code></pre></section>
            
              <section><p>We've added the bit the starts with <code>__init__</code>, which might look a bit confusing. If you ignore the first two lines, the rest are pretty easy to read — we're just grabbing the relevant fields in our form, and updating the label. <a href="http://www.pydanny.com/overloading-form-fields.html">You can see more information about updating form fields and attributes here in this excellent post.</a></p>
<p>Once we've reloaded our form, we can see the new labels:</p></section>
            
              <section><figure>
    <img src="/static/imported/external-django-form/52e6855da393.png" alt="" loading="lazy" decoding="async">
    <figcaption>(Of course, this is minus any pretty CSS styling we need to do.)</figcaption>
</figure>

<p>Once we stick in some test information and submit the form, we can see the "email" in our console:</p>

<figure>
    <img src="/static/imported/external-django-form/623defe813e3.png" alt="" loading="lazy" decoding="async">
</figure></section>
            
              <section><h2>Set up our live email server (optional)</h2>
<p>The local email server will output "emails" to your local server, so you can confirm everything is working locally — but when your web app is live, you obviously want those emails to actually land in your email inbox, rather than the server output.</p>
<p>You can do this by setting up something like <a href="https://sendgrid.com/">Sendgrid</a> or <a href="http://mandrill.com/">Mandrill</a> — freemium email servers where you should just need to sign up for an account, and set the details of your account in your settings.py.</p>
<p><a href="https://sendgrid.com/docs/Integrate/Frameworks/django.html">Sendgrid has a great short walkthrough here.</a> If you're at the point in <em><a href="https://hellowebbooks.com/learn-django/">Hello Web App</a></em> where we've set up a production settings file, you can stick the email server stuff in there, and keep your local/test emails (using the Django console) in your normal <em>settings.py</em> file. This way you can "send emails" as you're developing your app, but you don't have to worry about going over the daily email limit that these email delivery products have in their freemium accounts.</p>
<h2>Things that could be improved</h2>
<p>I mentioned above that we're, upon successful form submission, redirecting to our app homepage. That would be really confusing to the user, because there is no success message. We have two options here:</p>
<ul>
<li><strong>We could set up a separate template that just says "Success!" that we redirect to after successful submission.</strong> The easiest, but adding these kind of templates tends to clutter up your templates directory.</li>
<li><strong>Better, we could utilize the Django messages framework.</strong> In your base template file, you can add a "messages" block, and then when you redirect to a page, you could pass along a message (an alert, an error, a warning, an info message, etc.) that'll pop into the top of any page. It's what I use for my production web apps, and I'll probably write a longer article about how to integrate messages soon. <a href="https://docs.djangoproject.com/en/1.8/ref/contrib/messages/">In the meanwhile, check out the Django documentation on the messages framework here.</a></li>
</ul>
<h2>Your contact form is complete!</h2>
<p>You now have a working contact form that allows visitors to your web app to email you messages, and hopefully you learned some new skills about creating forms in Django and working with email.</p>
<p>If you haven't taken a look at my book, <em><a href="https://hellowebbooks.com/learn-django/">Hello Web App</a></em>, teaching beginner web app development using Django yet, I highly encourage you to: <a href="https://hellowebbooks.com/learn-django/]">https://hellowebbooks.com/learn-django/</a></p>
<p>Thanks everyone, and happy to answer any questions in the comments!</p></section>
