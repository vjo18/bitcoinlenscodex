---
layout: page
title: Blog
icon: fas fa-pen
order: 3
permalink: /blog/
---

{% assign posts = site.posts %}
{% if posts.size == 0 %}
<p>Er zijn nog geen posts. Kom later terug 👋</p>
{% else %}

<div class="post-list">
  {% for post in posts limit: 20 %}
  <article class="post-preview">
    <h2 class="post-title" style="margin-bottom:.25rem">
      <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
    </h2>
    <p class="post-meta">
      {{ post.date | date: "%-d %B %Y" }}
      {% if post.categories and post.categories.size > 0 %} •
        in {{ post.categories | array_to_sentence_string }}
      {% endif %}
    </p>
    {% if post.excerpt %}
      <p>{{ post.excerpt | strip_html | truncate: 180 }}</p>
    {% endif %}
  </article>
  <hr/>
  {% endfor %}
</div>

<p>
  👉 Op zoek naar oudere stukken? Check ook de
  <a href="{{ '/archives/' | relative_url }}">archieven</a>.
</p>

{% endif %}
