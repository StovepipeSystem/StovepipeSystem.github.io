---
layout: post
title:  "Announcing Velours"
date:   2022-11-08 12:00:00 -0500
categories:
---

## Background
Some of you might remember a series of post I made about [dealing with async data](https://etiennemaheu.com/2019/09/10/avp.html),
[my first vuex experience](https://etiennemaheu.com/2022/03/09/vuex-journey.html), and then
[my first pinia experience](https://etiennemaheu.com/2022/03/13/pinia-journey.html), with the switch to VueJs 3. In these
posts, we slowly but surely explore the idea of automating a common problem in software engineering: caching and
presenting data from an API while properly handling special cases. Something that I mentioned a few times in this series
is the idea of also handling pagination automatically. My initial plan was to make a post about it, but just trying to
figure out a solution eventually meant that... well... I had a solution!

## Announcing Velours
Velours ([@NPM](https://www.npmjs.com/package/velours)) is a VueJs 3 library that handles not only async data sources,
but it also understands various forms of pagination and automatically manages them for you, all while giving you
complete control over how to display your data.

Velours is one step ahead of my previous post. It makes the move from an object-style pinia store into a setup-style
pinia store, and then again into bare-bone VueJs composables. That's right. You can use Velours with, or without pinia!
This architecture change gives you even more control on how the data is cached in your application. Do you need to keep
a global copy? Use the store version. Do you want fresh data every time your component loads? Use the composable version.

But that's not why you're here...

## Let's talk about binders
While you can read my previous post to learn about the basics of the PromisePresenter component/composable/store chain,
I chose to dedicate this post to the big challenger in the room: Binders.

Binders are an extension of the idea of the PromisePresenter. While a promise can only have a few states (initial,
loading, content, empty, refreshing, error, retrying), paginated data adds a whole new dimension to this problem. There
isn't just a single state anymore. Each page that you want to fetch have their own request, and so their own promise and
set of states that comes with it. On top of that, there are some situations where we need a global state as well, like
when you don't even have a page yet and don't even know if you'll ever get one. This multi-layered state/data-cache is
what Velours call a Binder.

Binders in Velours works just like a binder in real life. Once you have a binder, you can add pages into it as you need.
Each page is identified by a Bookmark, a small data structure that tell you where the page is within the data set you
are building. Often, you'll only add pages at the end, but sometimes you might add one in the middle. Each page owns
their state and content and can be accessed individually. Evey time you add more pages to the binder, you might learn
more about the overall dataset that you're collecting, and so the binder also tracks some of that information for you.

The NPM page already contains a good example of how to use Binders, so instead, I'll focus on a single piece of the
puzzle and show you how it works.

```typescript
const results = useEnumerableBinder((query: string) => (bookmark: B.RelativeBookmark | null): Promise<Page<User>> =>
    fetch(`https://example.com/users?q=${query}&p=${bookmark?.page}&s=${bookmark?.pageSize}`).then(r => r.json())
);

let binder;
const search = (query: string) => {
  binder = results.bind(query);

  binder.next();
}
const more = () => binder.next();
```

Here, we create an enumerable binder. This is a kind of binder that is optimized to deal with data sources that don't
let you index a specific page. This is common in APIs with a latency guaranties, where they return as much data as
possible within a fix time and give you a continuation token if you want to ask for more. With these APIs, you can't
simply get the third page without getting the two previous ones. The enumerable binder can also emulate this behavior on
top of data sources that are directly indexable, like in this example. Instead of giving you a `ProgressiveBookmark` (a
Bookmark that can only progress forward through the use of a `token`) it will give you either a `RelativeBookmark` (a
bookmark that contains a `page` number and a `pageSize`) or an `AbsoluteBookmark` (a bookmark that contains an `offset`
and a `count`) and will automatically generate the next page number or offset for you based on the size of the previous
page of data.

This is very useful if you're building an infinite-scrolling UI. You can use the enumerable binder to manage all calls
to your API, and your UI only have to call the `next` function when it needs to fetch more data. In this example, you'll
see that we turn the `results` of `useEnumerableBinder` into two functions: `search` and `more`.

`search` calls the `bind` function on the `results` which creates a facade that you can use to interact with the
binder's data. This facade is bound to the specific query that we're trying to make on the API. This is because, the
moment one of the query parameter changes, the pages that we already have don't make sense anymore. In this example,
if you were to query for *bob*, load a few pages, and then change the query to *alice*, the data that you will get have
nothing to do with the data that you already got. The `bind` function represents this separation in the part of the call
that have to stay the same for the pages to make sense as a whole, and the part of the call that can change freely,
notably the bookmark. This separation is also expressed in how you device the `trigger` function that
`useEnumerableBinder` needs as a parameter. The `trigger` function takes the fixed side of the call, and returns a
function that can deal with the dynamic side of the call. In this case, the call is super simple, so we can do
everything in a single function, but you might want to serialize the static parameters in the first function if it takes
a while to do so.

Once we have this facade, we can then call `next` to load our first page, then second page, then third page, ... This
function will create a new page in the binder and call the bound `trigger` function with the proper bookmark. It will
track the status of the promise returned by the call and make the data available in the `results` once it's ready.

Alternatively, you can also use the indexable binder. This binder provides a more powerful facade, but cannot be used
with `ProgressiveBookmark`s. With this binder, you can `open` a page by bookmark, which will set it as the current page
and call the bound `trigger` function, you can `load` a page by bookmark, which will only load the data in the binder
without changing the current page, you can `refresh` a page by index, which will re-call the `trigger` function for that
page and update the existing state and data accordingly, or you can call `next` or `previous` to open a page relative to
the current page of the binder.

This is a useful set of features if your goal is to build a paginated UI, where users can arbitrarily navigate to any
page of the data set, or request the next or previous page. The binder still consider the amount of items in a page as
a dynamic parameter in the query, which might not be what you're looking for. In this case, you can simply add your own
page size parameter in the static side of the `trigger` function to fix it for the whole query. This is useful as, you
might want to let the user pick how big the pages are from a list. However, the binder is smart and known that the
server might refuse to honor this value (most APIs will limit the page size to something small, so you can't request a
million items in a single page) and will still continue to include the `pageSize` or `count` in the bookmark. You should
always use the one provided in the bookmark if it's available.

## Behind the scenes
### The core
With that overview of binders out of the way, let's dig in the code a little to see how this is accomplished. Our entry
points are [useEnumerableBinder](https://github.com/kawazoe/velours/blob/main/src/composables/binders.ts#L480) and
[useIndexableBinder](https://github.com/kawazoe/velours/blob/main/src/composables/binders.ts#L529). In reality, they are
two sides of the same coin, the [useBinderFactory](https://github.com/kawazoe/velours/blob/main/src/composables/binders.ts#L130)
function. These two functions are responsible for providing a small, meaningful facade to the result of the factory for
the specific kind of data set we're expected to deal with in both variants. They both depend on `useBinderFactory` to
provide the backing state and bind function, but the specifics of making sense of the responses from the `trigger`
function and calling the bound `trigger` are handled by the facades. They are thus responsible for tracking the current
page and building the bookmarks required by the bound `trigger` function. However, processing the responses is a complex
task delegated to a set of middlewares that are chained together and then called as needed.

The middleware pattern is used here because processing the responses is a multistep process that varies depending on
which kind of binder we're using, with some steps reused in both. Those middlewares are:

 - The [afterEndOfRangeMiddleware](https://github.com/kawazoe/velours/blob/main/src/composables/binders.ts#L306) which
validates that, once we know how many pages are supposed to be in the dataset, we're not trying to add a page passed
that limit.
 - The [pageRebookmarkingMiddleware](https://github.com/kawazoe/velours/blob/main/src/composables/binders.ts#L325) which
updates the expected bookmark of the page with the actual bookmark returned by the trigger. This is important when, for
instance, the server disagree with your choice of page size.
 - The [progressiveBookmarkBinderMiddleware](https://github.com/kawazoe/velours/blob/main/src/composables/binders.ts#L353)
which associates the correct bookmark and metadata to pages in progressive binders.
 - The [addressedBookmarkBinderMiddleware](https://github.com/kawazoe/velours/blob/main/src/composables/binders.ts#L380)
which associates the correct bookmark and metadata to pages in addressable (either indexable or emulated enumerable) binders.
 - And finally the [responseMiddleware](https://github.com/kawazoe/velours/blob/main/src/composables/binders.ts#L419)
which stores the data and metadata of the response itself.

Everything else in the code (mostly the [useBinderFactory](https://github.com/kawazoe/velours/blob/main/src/composables/binders.ts#L130))
is there to handle state transitions in the binder and pages. These states are:

- binder:initial which happens when the binder is created, but no page has been inserted yet.
- binder:nested which happens when the first page is inserted.
- binder:error which happens when an error that cannot be tied to a specific page has occurred[1].
- binder:retrying which happens when the binder attempts to add a page again after binder:error.
- page:loading which happens when a page has just been created and the trigger function called.
- page:content which happens when a page has produced a response that isn't empty.
- page:empty which happens when a page has produced a response that is empty.
- page:error which happens when an error that can be tied to a specific page has occurred[2].
- page:refreshing which happens when a page has already received a valid response but is asked to reload.
- page:retrying which happens when a page has received an error but is asked to reload.

[1] This can happen during the initial call to `trigger`, where we do not necessarily have a bookmark yet, so we cannot
tie the error to a specific page. This usually happens when there is an error in the static part of the query.
[2] This usually happens when the server fails to load a given page. This can happen when the server goes down in the
middle of a query.

### How it differs from the previous posts
The key difference with the prototype we explored in the previous posts is that everything here is designed to be used
as a VueJs composable. Composables are small, one-liner function calls that provides reusable pieces of logic that you can,
shockingly, compose together to build your components' setup function. Some composables in VueJs 3 are `ref`, `computed`
and `useRouter`. Composables are everywhere in VueJs 3 and so using this pattern feels very natural for a VueJs developer.

The main reason why [the PromiseStore from My Pinia Journey](https://etiennemaheu.com/2022/03/13/pinia-journey.html#direct-actions)
uses the object form of `defineStore` instead of the setup form was debuggability. Only the object form supports the
`$patch` function in pinia, which lets your group together state changes so that they show up as a single even in the
VueJs dev tools. To me, this was important as every change to the `status` property should be accompanied by their
associated data. However, I completely missed the forest for the tree here. It turns out that there is another way of
accomplishing this feat without the need of special tools:

Design your state so that you can change everything that needs to change together as a single assignation.

This simple idea turned into a single `ref` backing the whole state of the Velours' binder (and the new promise
composable as well). Everytime we want to update the binder, we replace the entire state and depend on VueJs' rendering
optimizations to only update the UI for the state that actually changed. This simple change means that we can use the
setup-style function to declare our pinia stores, which means that we can actually extract everything in a composable
and turn the pinia store into [a simple wrapper](https://github.com/kawazoe/velours/blob/main/src/stores/binderStore.ts)
for our composable. Furthermore, since we know that the only thing that can change the binder is its internals, wee can
turn that `ref` into a `shallowRef` and gain some performance that way.

### Utilities
Having a composable architecture means that we can now also provide more utilities as composables that interact with our
binder. As described earlier, one of the best usages of Velours' enumerable binder is to build an infinite scrolling
UI on top of a paginated API. This means that we must be able to trigger the `next` function on the binder's facade when
more content is needed. While you could handle this yourself, this is such a common use-case that Velours ships with a
[useIntersectionObserver](https://github.com/kawazoe/velours/blob/main/src/composables/intersectionObservers.ts) composable
out of the box. This little composable takes a `Ref<HTMLElement>` to observe, and will call a function every time its
visibility in the view port of the browser changes. Moreover, it will trigger this function *as long as* the element is
visible, or you tell it to stop. This means that an infinite scroll UI is now only a few lines of code:

```typescript
// Using the binder from our previous example...

// See vue's documentation on how to get a ref on an HTMLElement.
const usersLoader = ref<HTMLElement | null>(null);

// Call next as long as usersLoader is visible, or we reached the last page of the data set.
useIntersectionObserver(usersLoader, e => e.isIntersecting && binder.next().then(() => !results.currentPage?.metadata.last));
```

Magic? Nah, that's absolute sorcery!

### Presenters
The last step in our journey toward softer async data sources in VueJs is displaying our data. At this point, there
isn't really much left to do. Binders already store their data in a structure that is display-friendly, so you could
simply bind the pages straight in your UI if you wanted. But, you still have to manage the `status` of those pages and
the binder itself. This isn't a lot of work, but it's error-prone, and there are some meaningful defaults that make
sense in some cases. For instance, most people probably won't care about distinguishing the `initial` state with the
`loading` state. Sometimes, you probably won't care about the nuances between `empty` or `content`. To deal with this,
Velours comes with a set of components to display binders (and promises) in a unified and safe way. You can get a pretty
good feel of how they work in the npm package's description. But here's a small recap.

The `VlBinderPResenter`, `VlBinderPagePresenter`, and `VlPromisePresenter` all works in a similar way. The take as input
the entire composable (whether it's a promise or binder composable) and exposes its data through a set of slots. There
is one slot for each possible status, and some slots also have fallbacks to other slots if the component cannot find the
definition it's looking for.

```html
<vl-binder-presenter :value="results">
  <template #nested="{ pages }">
    <vl-binder-page-presenter v-for="page in pages" :value="page" :key="page.key">
      <template #loading>
        loading...
      </template>
      <template #content="{ value }" v-for="entry in value" :key="entry.username">
        {{entry.username}}
      </template>
      <template #empty>
        No results.
      </template>
      <template #error="{ error }">
        Oh no... {{error.bookmark}} {{error.message}}
      </template>
    </vl-binder-page-presenter>
  </template>
</vl-binder-presenter>
```

If you don't want to handle a state, you don't have to specify it. In this example, you'll see that we only deal with
errors tied to specific pages, but we ignore global errors. In this case, the component will render a html comment tag
to let you know that an error has occurred, but nothing will be visible to your users. Similarly, we do not specify the
refreshing state for the pages, so it will use the content template instead and refresh silently. That way, you only
have to cover the cases you want to deal with.

## Wrap Up
That's it! That's Velours. A small library that deals with some of the most painful boilerplate of modern VueJs
applications by turning complex async data source into simple to reason abstractions. Does it do the job for you? Do you
need more features? Found a bug, or just want to contribute? Come take a look at https://github.com/kawazoe/velours/
and participate in its development.

For now, that's everything I have. Read you next time!
