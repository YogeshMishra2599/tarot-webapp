# Adding new articles

1. Create a new file in this folder with a **short slug name** and the `.md` extension (e.g. `my-new-article.md`).

2. At the **top** of the file, add this block (with your own title, date, and excerpt):

```
---
title: Your Article Title Here
date: 2026-03-15
excerpt: A short description that appears on the card and in search results.
---
```

3. Below the `---` block, write your article in normal paragraphs. You can use **bold** and *italic* and [links](https://example.com).

4. After saving, run this in the project folder (one time per new or edited article):

   **`node build-articles.js`**

   This updates the list of articles so they appear on the site.

That’s it. Don’t change any other code — just add or edit `.md` files and run the build script.
