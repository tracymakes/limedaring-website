---
{
  "date": "2016-03-28",
  "featuredimage": "",
  "featured": "True",
  "author": "Tracy Osborn",
  "excerpt": "In the original Hello Web App book, I walk you through the process of setting up your registration and login pages so user's can join and log into your new app. We also set up the password reset views on the login form, so if a user doesn't remember their login information, they can get a reset link emailed to them.",
  "title": "Setting up Django's password change functionality",
  "external": "",
  "category": "development, instruction",
  "slug": "external-password-change",
  "originalUrl": "https://hellowebapp.com/news/tutorial-password-change-views/",
  "sourceUrl": "https://hellowebbooks.com/news/tutorial-password-change-views/",
  "imported": true
}
---

<section><p>In the <a href="http://hellowebapp.com/original">original Hello Web App book</a>, I walk you through the process of setting up your registration and login pages so user's can join and log into your new app. We also set up the password reset views on the login form, so if a user doesn't remember their login information, they can get a reset link emailed to them.</p>
<p>We also set up the templates for the password change functionality, so logged in users can update their password, but we didn't set up the URLs and templates in order to get that working. Let's do that here!</p>
<h2>Set up the URL</h2>
<p>We already set up the URLs for password reset functionality — adding the password change functionality is very similar:</p></section>
            
              <section><p>urls.py</p>
<pre><code>
# add to the top
from django.contrib.auth.views import (
    password_reset, 
    password_reset_done,
    password_reset_confirm, 
    password_reset_complete,
    # these are the two new imports
    <b>password_change,
    password_change_done,</b>
)

urlpatterns = [
    # the previously added URL definitions
    url(r'^accounts/password/reset/done/$',
        password_reset_done,
        {'template_name': 'registration/password_reset_done.html'},
        name="password_reset_done"),
    # new url definitions
    <b>url(r'^accounts/password/change/$', password_change, {
        'template_name': 'registration/password_change_form.html'}, 
        name='password_change'),
    url(r'^accounts/password/change/done/$', password_change_done, 
        {'template_name': 'registration/password_change_done.html'},
        name='password_change_done'),</b>
</code></pre></section>
            
              <section><p>We're going to have two new pages on our website, one that allows for changing the password for a logged-in user, and a success page after successful reset.</p>
<p>In our import statement, we import django-registration-redux views for <code>password_change</code> and <code>password_change_done</code>, and then we tie those two the new URLs we're adding, linking to the templates we already set up in the original tutorial.</p>
<h2>Add a link in the templates</h2>
<p>The last thing we need to do is provide a link to these new pages from our app. I'm putting this in the same page where the user updates their object, but it could be put anywhere in your app:</p></section>
            
              <section><p>edit_thing.html</p>
<pre><code>
&lt;!-- add me somewhere in your app --&gt;
&lt;a href="{% url 'password_change' %}"&gt;
    Change password
&lt;/a&gt;
</code></pre></section>
            
              <section><p>We know what URL to link to as we named it <code>password_change</code> in <em>urls.py</em>. Open up the page in your browser and you should see the new form:</p></section>
            
              <section><figure>
    <img src="/static/imported/external-password-change/1515ac0f1be6.png" alt="" loading="lazy" decoding="async">
    <figcaption>Our password change page, using the template we set up in the original tutorial.</figcaption>
</figure>

<figure>
    <img src="/static/imported/external-password-change/d0415635f266.png" alt="" loading="lazy" decoding="async">
    <figcaption>The success page after updating the password.</figcaption>
</figure></section>
            
              <section><p>Try testing it out with one of your test users, and logging in and out using the new passwords. Everything should be working swimmingly. That's all you need to do to get the password change functionality working. Congrats!</p>
<hr>
<p>This tutorial is meant as an add-on to my book, <em>Hello Web App</em>, teaching beginner web app development using Django. If you haven't taken a look at it yet, check it out and buy here: <a href="https://hellowebbooks.com/learn-django/">Hello Web App</a></p>
<p>Thanks everyone, and happy to answer any questions in the comments!</p></section>
