---
layout: post
title:  "My Vuex Journey"
date:   2022-03-09 14:30:00 -0500
categories:
---

## Part 0 - Some background
About 3 years ago, I used Vue.js for the first time in my life. In fact, it would be my first serious foray into a new front-end framework since I started learning Angular, and Angular.JS beforehand. I knew about React.js and how it works internally for years already, but I never really used anything else outside of Angular, simply because I didn't get the chance to use it on a project for an extended period of time. It took me a week to learn, and another week to build the groundwork for what would become a year-and-a-half-long project.

This project was a medium scale survey app that would get deployed on hundreds of different tablets around the world (most of them the cheapest money could buy), in varying network conditions (including no network at all), and often running a large collection of outdated browsers and operating systems. It took about 2 months for the first prototype and 6 months for the initial release. As you can imagine, it didn't go very well... Oh! The client was definitely satisfied, but... You cannot build a quality app alone in that kind of time frame. In fact over half of the time was dedicated integrating the 40+ translations I got as word documents as well as making it work for right to left (RTL) languages. It was a nightmare of spaghetti as the only decent solution was to build massive, thousands-of-loc components to handle the questionnaires. It was a mess.

That kind of environment isn't exactly great for learning how to use a tool like Vuex properly for the first time. Specially since it was also my first time using the Redux/Flow pattern. I learnt a lot about Vue.js itself, though. I basically used every feature the framework had to offer, including more obscure things like provide/inject and fancy render-functions with dynamic slots. I had a lot of fun, but I wouldn't call it scalable or good design. This is specially true when it comes to the Vuex side of thing.

Fast-forward to today. I'm a few months into a very interesting personal project built with Vue.js 3 and Vuex 4, the *latest and recently released* version of the toolset. It's semi-stealth right now, so I won't disclose too much; even though you can probably find it if you dig around. The project is 2 years, on and off, in the making, with the first prototype being built in Angular in a 6 weeks rush.

After that experience, I decided to switch to a more modern framework. This project really made me pay attention to how much useless stuff there is in Angular just for the sake of "The Framework shall provide everything"... Anyway, that's another story. Suffice to say, I have spent about 2 months, in the last year building a solid version of my app inspired by my initial prototype's shortcomings; all of it in Vue.js with Vuex and Tailwind as its core libraries.

I'm alone in this project, and with my previous Angular experience, I want to reduce the boilerplate to a minimum. While Vue.js is way better than Angular when it comes to verbosity, it still has its quirks. My goal is to produce a large scale application while keeping code as reusable as possible. If I can build the logic for a feature quickly, it means I have more time to focus on the user experience for things like accessibility, or unique features that needs special logic to work. This is why I started to research my main shortcoming in this framework, Vuex, and what I found was... not... good...

### Is Vuex... niche?
If you look for insanely common stuff to do with Redux, like how to do an API call, you get a mountain of blog posts, libraries, examples, etc. If you do the same for Vuex you get... Unanswered StackOverflow questions? Wait a minute, this isn't right! What if you look for async loading states? Error handling? Data that expires? Normalized data? Nothing... The best you'll find is some low quality content about how the person doesn't understand that the state is meant to be immutable and took days to figure out what mutations are. This situation is so bad, I had to open [an issue about it on their GitHub](https://github.com/vuejs/vuex/issues/2058#issuecomment-1020848268), requesting better docs.

Unsurprisingly, multiple people have shown an interest in this issue. It's been slowly accumulating likes and requests over time, but no one ever took any concrete action to fix it. Until today.

### I'm not a Vuex expert
I'm not qualified to write the Vuex docs, or to do performance recommendations based on its internals... But you can't stop me trying!

Welcome to:
**My Vuex's Journey: the docs and libs you wished you had when you started with Vuex, part 1, the third, organic, sans GMO... &trade;**

## Part 1 - Promises and their edges
Vue.js has its own abstraction for dealing with the concept of a value that can change. It uses proxy objects that wrap around data destined to be bound to the UI. This proxy provides the necessary hooks for the render engine to get notified when data changes, so it can re-render the components. It's a very clever, generic implementation of the observable pattern, that lets you use plain objects like you're used to. Except it comes with a massive problem: promises.

Promises are javascript's most common abstraction for data that might/will change. They are objects with the ability to register a callback to be notified when a value or error is produced. Contrary to Vue.js proxies, the value will only change up to once, so they have their drawbacks and aren't an equivalent abstraction, but this difference in ability isn't the issue. Instead, the problem is one of compatibility. You cannot simply give a promised value to the render engine and hope that everything will work out.

Vuex builds on top of the idea of proxy objects to provide an entire Flux-style store for your application. This store is an abstraction over the global state of your app that only lets you interact with it in specific ways. You can read the state, either directly or through getters. In both cases, you will end up with proxy objects that will trigger Vue.js renders when they change. Seamless! You can only change the state through atomic mutation functions, and you can orchestrate those mutations though asynchronous action functions. Centralized!

> A component will dispatch Actions that orchestrates Mutations to change the State which updates Getters that notifies the component to update its Vue.js. A neat, self-contained cycle.

Let's think about how promises fits inside this loop. Promises _eventually_ comes back with a value, so we need a way to represent that we are waiting for the promise. Promises can resolve with a value, but also reject with an error, so we need a way to store this information as well. Promises are not actionable, they are the result of an operation, not their trigger, so we need a way to produce them.

### We need
- A function to call that returns a promise.
- A way for this function to receive parameters from the dispatch call.
- A way to track the status of that promise.
- The result of the promise.

### What I initially came up with
```typescript
export interface AsyncValue<V> {
  status: 'initial' | 'loading' | 'resolved' | 'rejected';
  value?: V;
  error?: unknown;
}

return function createAsyncModule<V>(trigger: (payload?: any) => Promise<V>) {
  return {
    state() {
      return {
        status: 'initial',
        value: undefined,
        error: undefined,
      };
    },
    mutations: {
      load(state: AsyncValue<V>) {
        state.status = 'loading';
        state.value = undefined;
        state.error = undefined;
      },
      resolve(state: AsyncValue<V>, payload: V) {
        state.status = 'resolved';
        state.value = payload;
      },
      reject(state: AsyncValue<V>, error: unknown) {
        state.status = 'rejected'
        state.error = error;
      },
    },
    actions: {
      trigger({ commit }: ActionContext<AsyncValue<V>, unknown>, payload?: any) {
        commit('load');
        
        return trigger(payload).then(
          v => commit('resolve', v),
          e => commit('reject', e),
        );
      }
    }
  }
}
```

And with that, we have a way to create a reusable Vuex module for dealing with promises. I'm sure you have seen something like this before. Using a status variable to track the loading state of an action isn't anything new. What is interesting here, is that you don't have to do it every single time. It is standardized and packaged into a single function call. It can easily be reused everywhere we need to store a promise. Therefore, we can extend around it with components that understand the various statuses and expect them to work every single time. It also means much simpler unit tests as you only need to test the trigger function in your app. You can now assume that, as long as this trigger works, the whole status update mechanism will work as expected; disconnecting the trigger from its use. Any improvement made to this design will also instantly reflect on the entire application. You can easily add tons of features to this base idea. Considering how many uses modern apps have for promised data, that's a quick way to massively reduce boilerplate.

### Using it in a project
```typescript
// store.ts
const usersRepository = () => fetch('/users').then(r => r.json());

export const store = createStore<any>({
  modules: {
    users: createAsyncModule<User[]>(usersRepository)
  }
});
```
```html
<template>
    <div v-if="users.status === 'loading'">
        Loading users...
    </div>
    <ul v-else-if="users.status === 'resolved'">
        <li v-for="user in users">{{user.name}}</li>
    </div>
    <div v-else>
        Something bad happened!
    </div>
</template>
<script setup>
    const store = useStore();
    
    const users = computed(() => store.users);
    store.dispatch('users/trigger');
</script>
```

This solution uses Vuex's modules to encapsulate the state of a promise and make it ready to be exposed to the UI. If you paid attention to my previous post, this is similar to the Async Value Presenter pattern I've already discussed in the past. In fact, it would be trivial to implement an AVP component that handles the status checks for you and instead exposes a slot for each possible status. In fact, this is something that I have already done in my project. I think that the safety provided by a strict set of slots adds a lot of value when compared to a simple chain of v-ifs.

I also mentioned that you can easily add more to this idea. As-is, it lasted me for about a week before I needed something more powerful. I now have multiple states to distinguish between resolved states with content or ones that are empty. I handle cases when you might want to call the trigger action multiple times to refresh a value, retry a failed call, or simply reload everything from scratch. I've also added a safety that prevents multiple concurrent calls with the same parameters, turning the entire thing into a powerful caching mechanism. I even detect legitimate uses of concurrent calls and only keep the most recent result to handle scenarios like "search as you type". Finally, I noticed that I would have a large amount of these modules often bunched together and the extra module definition was getting noisy, so I found a way to safely merge them together without creating a whole module every time.

It works quite well and makes patching data from an API to components a one liner... except when it doesn't...

## Part 2 - Paging and progressive data
When working with large collections of data, it is common to implement some form of paging. I can think of three different mechanism on top of my head: Absolute, Relative, and Progressive.

Absolute paging is when you request elements from a collection between specific offsets. It can be expressed as offset+limit or lbound+rbound. In the end, your call might look something like this: `/users?offset=100&limit=25`. You have no guaranty that the limit will be respected. Usually APIs will impose a max size that you can request. You also have no guaranty that data will be available at that offset, with the API typically returning an empty collection in that case. This is basically how SQL implements paging, and is a convenient way to get exactly what you want when you don't know if the server will support the limit you have chosen. You just know it will start at the provided lbound, whichever the rbound of limit value you pick.

Relative paging is very similar, except that the offset depends on the provided page size. It usually looks like this: `/users?page=2&count=25`. Again, you have no guaranty that the limit will be respected, which is a bit more annoying because it might impact the page you'll end up getting. Instead, you now have the option to completely omit the page size and trust the server's default. You will also usually get an empty collection if nothing at that page is available. This is the most convenient way to handle paging in business applications as the server can provide metadata to display a pager in the app, with a first, previous, "numbers", next, and last button. Sometimes, you'll also get the total count of results, as well as a filtered count if available.

Progressive paging is completely different. It uses tokens to bookmark the page you are on. If you want to get the next page of the request, you need to provide the token to continue reading further in the collection. Usually, the first call will be done with an empty token, but subsequent calls will include the token in the query: `/users?token=d674eb278b352aaf5c26e1388e21faef7c47a147`. This is very different because you cannot jump anywhere you want in the data set. You have to continue where you left off, which makes this solution very convenient for two kinds of scenarios: infinite scrolling, and APIs with guarantied response times. If your data becomes less and less relevant as you read further in the collection, this is a great tool to use since most requests will request the first page anyway. It can also provide a guarantied upper bound to the response time since the server can just get "as much data as possible" in a fixed time, create a token for the next page, and return the set. You never know how much data you'll get, but you know you can always ask for more, reducing the time to first frame in your app.

They all have their reason to exist, and they all completely break the AsyncValue module that I've shown in part 1. This happens because, fundamentally, you can't provide paged data through a single promise. You will always have at least one promise to handle *per page* and this number is pretty much unbounded.

You might think of a trivial solution like dynamically registering more AsyncValue modules as needed. Vuex does support dynamic registration after all. But, you also need to track the metadata that might come from those responses as one single entity. If the server says there are 327 results when you get the first page, and 328 when you get the second, the count need to change globally across all pages. They aren't individual counts.

Speaking of which, absolute paging also have a high risk of overlap. It is easy to request "offset 100" and "limit 25", then "offset 105" with "limit 10". This will lead to overlapping data, and both promises can even be in flight at the same time... and one can fail! Dealing with overlapping data means that you have to store the bookmark for that page together with the data if you want to quickly scan for overlaps; now we also have metadata on a per-page basis.

It's common for relative paging system to load their first page somewhere in the middle of the set, so it is totally fine to not have any data on page 1 but stuff on page 12. This also means that you need to know what page is what to build the page collection in the right order.

Progressive paging also comes with its own woes, though it is mostly performance related as the data set grows. Maybe some data eviction mechanism is required to keep the app performant? How do you deal with scrolling if the data gets evicted? At lest with the other mechanism, you *can* assume that only one page at a time will be rendered...

So, you can't reuse the AsyncValue module, but you still need to handle a barrage of promises, with their status, data, and errors... what's the trick?

**I don't know! Don't look at me like I have all the answers! This is supposed to be a journey, remember?**

### Skeuomorphism!
What I can tell you right now, though, is how far I made it into the idea. We need a couple of concepts to handle all of these problems. First, we talked about 3 different kinds of patterns to represent which page we are looking for. Let's call them Bookmarks.

### Bookmarks
```typescript
type AbsoluteBookmark = { offset: number, limit: number };
type RelativeBookmark = { page: number, pageSize: number };
type ProgressiveBookmark = { token: unknown };
type Bookmark = AbsoluteBookmark | RelativeBookmark | ProgressiveBookmark;
```

Bookmarks are a simple structure that represents where a page is located in a collection. It can be used to store its position in the store, or even to request a specific page from a remote API.

### Pages
```typescript
type PageStatus = 'initial' | 'loading' | 'content' | 'empty' | 'error' | 'refreshing' | 'retrying';
type Page<V> = {
  status: PageStatus,
  bookmark?: Bookmark,
  value: V[],
  error?: unknown,
  // TODO: metadata
};
```

I mentioned that we not only have pages of data to store, but also metadata associated to each those pages, as well as some global metadata about the entire request. To stick with the paper semantics, I call them Pages and Binders. Pages are very similar to AsyncValue, except they also store the related bookmark to quickly scan through them during de-duplicating operations. I'm also considering using a Set to store some form of unique id related to each entry in a page. This would help with duplicate detection, but Sets are not serializable, and thus cannot be stored in the Vuex state. I'm not too sure of what is the best way to handle this without breaking SSR and the hydration process.

The bookmark property can be undefined. This is because in some cases, we simply won't have a bookmark until we get actual content. This is useful for progressive paging, or other kinds of paging if you don't want to specify the first page all the time. This is contrary to the value, which will be set to an empty array by default. Normally, I would prefer to keep it undefined until the promise resolve. This helps distinguish between a content and empty state, but we already have a status for that anyway.

> We also have a bunch of additional statuses, as well as a queryKey concept, compared to the previous AsyncValue example. This is because this code builds from the more advanced version of AsyncValue I have yet to share with you. For now, I will leave their meaning as an exercise for the reader, but I will eventually include a link to all of this stuff in the post... maybe even publish the whole thing as a lib on NPM?

### Binders
```typescript
type BinderStatus = 'initial' | 'loading' | 'nested';
type Binder<V> = {
  status: BinderStatus,
  queryKey: unknown,
  pages: Page<V>[],
  // TODO: metadata
};
```

Binders are a bit different. They also have a status, but it only handles the initial request, up until when the first page is added to the binder. At this point, the status switches to 'nested' and all the global metadata, like the total page count, should be available. In fact, I expect the first page status of a binder to be one of the resolved or rejected status. The initial and progress statuses for pages will only be used for subsequent pages.

Just like pages, binders will have an empty collection of pages as their default.

> You will notice the complete lack of metadata support in those types... Ironically, while I know that some will be local to pages, and some will be shared for the whole binder, I don't know what they will look like yet. I think I might keep them as an amorphous keyed collection, but I'm not sure if that's the best solution if I want to make component writing easy.

That should be the whole state structure for this new module. Usage wise, it's a bit more murky. I don't know how many actions are needed to represent the initial request, fetching more pages, resetting the whole binder, etc. For now, binders have two actions: trigger, and page.

> In fact, I don't like the fact that everything is done through a single call for the AsyncModule either. It gets specially messy when it comes to the queryKey. For Binders, you can end up with additional parameters, like collection filters, that needs to remain consistent between page calls. You might find it awkward as well while reading through this next sample. I might revise this in the future as well.

### Setup proposition
```typescript
// store.ts
export const store = createStore<any>({
  modules: {
    users: mergeModule(
      { namespaced: true },
      AsyncModule.fromPromise<User>(
        'current',
        ({ id }: { id: string }) =>
          fetch(`/users?id=${id}`).then(r => r.json())
      ),
      PagingModule.fromRelativePaging<User>(
        'all',
        ({ filter }: { filter: string }) =>
          (bookmark: RelativeBookmark) =>
            fetch(`/users?filter=${filter || ''}&page=${bookmark.page}&count=${bookmark.count}`).then(r => r.json())
      ),
    ),
  }
});
```

This example shows the PagingModule side by side with the advanced version of the AsyncModule we've looked at in part 1. They are very similar. They both take the "property" name as their first parameter. It will be used as prefix for all state/mutations/actions in the Vuex module produced by the library. This makes them easy to merge with yet another tool provided by the library: `mergeModule()`. This function is basically a fancy version of `Object.assign()` that understands Vuex's module semantics. It can merge state functions, as well as the mutations, actions, and modules objects together. Finally, we can see how parameters are sent from the dispatch payload inside the trigger's parameters. They are simply forwarded as is, and it's up to the user to deconstruct them as they see fit. Both modules work the same here.

Moving on to the differences, the PagingModule's trigger doesn't return a promise, but rather a higher-order function. This pattern enables us to split the dispatch parameters from the paging bookmark. This is useful for mocking scenarios, where you might want to keep all of your data in memory, but still support paging for your UI. It also makes the implementation a lot easier since we don't have to extend the payload we provide to the trigger with varying bookmark types. Usually, this means the payload and bookmarks will be passed as is, reducing the amount of useless copying we will be doing on every call. In the end, the trigger itself will only be called if its parameters changes. The bookmarked function will be called each time a page of data is requested.

The type of the promise also have to respect some constraints. With the AsyncModule, anything would do. Here, we need the value to include bookmark information, metadata, and the page itself. In this example, I assume the API already provides the right data, but you can always adapt it in the function call if needed.

> I am thinking of providing support for different standards as a higher-order function you can use to process responses. This way, you could easily write repositories that do something like this: `fetch(...).then(PagingModule.unwrapJsonAPI())`.

### Using it in a project
```html
<template>
    <input type="search" v-model="filter"> <button @click="search()">Search...</button>
    
    <div v-if="users.status === 'loading'">
        Spinning...
    </div>
    <template v-else-if="users.status === 'nested'">
        <h2>Page {{pos}}</h2>
        <div v-if="currentPage.status === 'loading'">
            Turning the page...
        </div>
        <ul v-if="currentPage.status === 'content'">
            <li v-for="user in page">{{user.name}}</li>
        </ul>
        <div v-if="currentPage.status === 'error'">
            Oh no!
        </div>
    </template>
    
    <button @click="previous()">Previous</button>
    <button @click="next()">Next</button>
</template>
<script setup>
    const store = useStore();

    const pos = ref(0);
    const filter = ref('');
    
    const users = computed(() => store.users.all);
    const currentPage = computed(() => store.users.all.pages[pos.value]);
    
    function search() {
        store.dispatch('users/all_trigger', { filter: filter.value });
    }
    function next() {
        store.dispatch('users/all_page', { bookmark: { page: ++pos.value } });
    }
    function previous() {
        store.dispatch('users/all_page', { bookmark: { page: --pos.value } });
    }
    
    search();
</script>
```

The final usage of such a Vuex module would look a lot like the AsyncModule, though here the status handling is getting a bit more complicated. Here, a component to deal with the whole structure is definitely getting more of a priority. I've also kept the presentation side of thing completely independent on purpose. Page representations, page "turning", filtering, etc. All of this stuff is left to the app developer. Again, this could probably be standardized with a set of nice components that store part of their state in Vuex and/or the URL for the sweet, sweet browser history support.

> Thinking about it, SSR support will be my top priority if I ever publish some components to handle all of this. The trivial implementation will probably hydrate the client with initial or loading states, which would be pretty useless. Getting it to hydrate on a content state would be really nice for people without javascript support by default (like me) or bots.

## Part 3 - What!? Really now!?

[https://github.com/vuejs/pinia/releases/tag/pinia%402.0.0](https://github.com/vuejs/pinia/releases/tag/pinia%402.0.0) (released 27 Oct 2021)

> Q: Is Pinia the successor of Vuex?
> 
> A: Yes

FFFffff....