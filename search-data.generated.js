---
  layout: script
---

const indexableData = [
  // {% for post in site.posts %}
  {
    '@search.action': 'upload',
    id: `{{ post.id }}`,
    title: `{{ post.title }}`,
    publishedOn: new Date(`{{ post.date }}`),
    prettyPublishedOn: `{{ post.date }}`,
    url: `{{ post.url | prepend: site.baseurl }}`,
    content: `{{ post.content | strip_html | replace: "`", "\\`" | replace: "$", "\\$" }}`,
},
// {% endfor %}
]