---
layout: post
title:  "My Pinia Journey (contd. from My Vuex Journey)"
date:   2022-03-12 23:30:00 -0500
categories:
---

## Part 0 - Some background
Last week, I posted an article about my journey with Vue.js and Vuex. In a nutshell, as I got more and more interested in the toolset, I began to design some automation to deal with promises, and eventually paging as well (though that is still a work in progress). I initially decided to write this article in the hope that the outlet would help me think about the design of my paging tooling. I can confidently say that it did help quite a bit. I managed to come up with the idea of a binder and bookmarks because of that post. This is all really cool stuff and, you should check it out if you haven't already. Don't worry though, we will get back to it soon enough.

My day was going really well. I was on track to get something going until I had to validate the behavior of an API on the Vuex docs... I fired my browser and went to the Vue.js website, only to notice that the usual link that I use down in the "ecosystem" section was gone.

> Uh... That's odd... Where's Vuex? And where's the cli!? Oh no... You gotta be kidding me...

Yep! With Vue.js 3 now officially out, the entire ecosystem as finally been revamped! It turns out that Pinia, the new recommended global state management solution, was in development since 2019; and I just completely missed it. It was meant to be a temporary name until they got the API stable for Vuex 5, but they instead decided to keep the name and move on. Pinia released in October of last year... about 5 months ago.

Similarly, @vue/cli is also gone, replaced by Vite, which I knew about for a long time, but mostly ignored as it was a lot less mature than the original cli. It always felt like a great idea, but not quite ready for prime time. In fact, the cli was still the recommended solution when I started this project, a few months ago. To add insult to injury, with a new build system I also had to reconfigure my test setup, which in my case meant switching to Vitest, another new tool. 

It turns out that, even with all of this unplanned work I had to do, I still had a great week! You see, Evan You, the guy behind the entire Vue.js ecosystem, is a god-tier developer. Somehow, with all of his technical expertise, he manages to keep in touch with the passion side of the craft. This means that he designs his projects to be a joy to use. He knows he will be using them. He knows he won't if they're bad. It took me 3 days to port my entire project to those new tools, from learning about their existence to trying out the new testing features and **including re-designing the promise store for Pinia**. I cannot think of any other ecosystem where this would have been possible. Last time I dealt with a tooling revamp like this was when I ported an Angular app from Cordova to Capacitor it took multiple months for our *team* of devs to get it done.

With that in mind, let's start over and look at how we can design a much better promise store around Pinia's shiny new API.

## Part 1 - Promises Redux... Pinia! I meant Pinia....
First, I propose that we quickly go over the Vuex version of the Promise store module. Even though I talked about it extensively in my last post, I think this refresher might help with some context as I will use a slightly more developed version than the one I have talked about before. This module was designed to provide a conversion mechanism between a Promise and Vue's Proxy objects so that we can directly bind them to the template of a component. It answers the question: "What if we could `<my-component :some-value="aPromise" />` and everything (including all edge cases) would just work?"

```typescript
export interface AsyncValue<V> {
  status: 'initial' | 'loading' | 'resolved' | 'rejected';
  value?: V;
  error?: unknown;
}

return function createAsyncModule<K extends string, V, S = { [P in K]: AsyncValue<V> }>(
  prefix: K,
  trigger: (payload?: any) => Promise<V>,
) {
  return {
    state() {
      return {
        [prefix]: {
          status: 'initial',
          value: undefined,
          error: undefined,
        }
      };
    },
    mutations: {
      [`${prefix}_load`](state: S) {
        state[prefix].status = 'loading';
        state[prefix].value = undefined;
        state[prefix].error = undefined;
      },
      [`${prefix}_resolve`](state: S, payload: V) {
        state[prefix].status = 'resolved';
        state[prefix].value = payload;
      },
      [`${prefix}_reject`](state: S, error: unknown) {
        state[prefix].status = 'rejected'
        state[prefix].error = error;
      },
    },
    actions: {
      [`${prefix}_trigger`]({ commit }: ActionContext<S, unknown>, payload?: any) {
        commit(`${prefix}_load`);
        
        return trigger(payload).then(
          v => commit(`${prefix}_resolve`, v),
          e => commit(`${prefix}_reject`, e),
        );
      }
    }
  } as Module<S, unknown>;
}
```

### Composable stores
The first challenge we will encounter with converting this code over to Pinia's API is that there are no such thing as modules anymore. Instead, we have composable stores. This is a blessing in disguise since this pattern turned out to need a lot of supporting functions to be used comfortably. Notably, the state, mutations, and actions all had to get prefixed by a unique name so that we could easily merge those modules into a single unit. It really felt like we were fighting against the Vuex library. There were a ton of boilerplate that is simply gone in Pinia. Instead, we get to replace the whole mechanism with a single id parameter in our higher-order function.

```typescript
export function definePromiseStore<V>(id: string, trigger: (payload?: any) => Promise<V>) {
  return defineStore({
    id,
    state: () => ({
      status: 'initial',
      value: undefined,
      error: undefined,
    } as AsyncValue<V>),
    ...
  });
}
```

> Funny enough, we already needed that "id" parameter in the other version since we needed to provide a unique prefix to the store's properties in order for them to merge together correctly for non-namespaced modules. In other words, the app was already ready for this "new" requirement in Pinia. I only had to make sure they were all globally unique, instead of unique to their namespace.

One of the challenges that wasn't really talked about in the original article was how this additional wrapping had to deal with multiple edge cases. For instance, Vuex supports both a state object and a state function. Merging multiple AsyncModules together meant that we had to unwrap those state functions and reconstruct a whole new one during the merge process. Not only does Pinia do away with state objects, now, we don't even need to merge the stores together. We can just export each of our stores completely independently.

```typescript
export const useFooStore = definePromiseStore('foo', () => Promise.resolve(42));
export const useBarStore = definePromiseStore('bar', () => Promise.resolve('biz'));
```

### Mutate me no more
The next major change since Vuex is that mutations are gone. The Pinia team found that their users were more confused than not about their existence. When you're used to just change the state any time you need to, they were not that intuitive. Pinia's philosophy is "stay opt-in"; a big change from Vuex's "you can't use it wrong" view of the world. This means that not only are actions also optional, you can in fact change the state directly from your components; and get this... they still manage to track it like the old Vuex mutations. I think the worst part about mutations was that, even when you knew why they were necessary, you still had to write them. They were very repetitive, sometimes even for a change on a single property. You can get a feel of this in the AsyncStore were we needed three mutations to support what is basically a 4 lines action. Out of 22 effective lines in the store's declaration, 11 were dedicated to mutations. 

In our case though, we still need atomic state changes to ensure that the status of our promise store always match its content. For this, Pinia provides a `$patch` function. Unfortunately, it isn't supported in the composition API for Pinia, so we are stuck with the old-style object API for now.

```typescript
export function definePromiseStore<V>(id: string, trigger: (payload?: any) => Promise<V>) {
  return defineStore({
    id,
    state: () => ({
      status: 'initial',
      value: undefined,
      error: undefined,
    } as AsyncValue<V>),
    actions: {
      trigger(payload?: any) {
        this.$patch({ status: 'loading' })

        return trigger(payload).then(
          value => this.$patch({ status: 'resolved', value }),
          error => this.$patch({ status: 'rejected', error }),
        );
      }
    },
  });
}
```

### Direct actions
The next big difference between Vuex and Pinia is that you get to call your actions directly. No more "dispatch". This also means that you have full control over your function parameters and aren't forced to cram everything into a single "payload" argument. Before, with Vuex, typing that payload was very flaky, so we stuck to the unceremonious `any` of Vuex's API. Now though, we can get fancy and build the parameters of the `trigger` action based on the `trigger` callback extremely easily.

```typescript
export function definePromiseStore<P extends unknown[], V>(id: string, trigger: (...args: P) => Promise<V>) {
  return defineStore({
    id,
    state: () => ({
      status: 'initial',
      value: undefined,
      error: undefined,
    } as AsyncValue<V>),
    actions: {
      trigger(...args: P) {
        this.$patch({ status: 'loading' })

        return trigger(...args).then(
          value => this.$patch({ status: 'resolved', value }),
          error => this.$patch({ status: 'rejected', error }),
        );
      }
    },
  });
}
```

In JavaScript, you can use destructuring to extract an array of arguments passed as parameters to a function. This is what we do here on the trigger action as well as the trigger function provided up top. We could keep the type as an `unknown[]`, but using a constrained generic type here means that we can transpose the types of its parameters from our input trigger to the one we create for our store. This will not only ensure that the two are compatible, but also provide auto-completion when calling the trigger action on the store.

This change in design doesn't only apply to actions. It also applies to state properties. With all of them directly accessible on the store instance, its usage now looks like this:

```typescript
const useFooStore = definePromiseStore('foo', (mul: number) => Promise.resolve(42 * mul));

const fooStore = useFooStore();

fooStore.state === 'initial';
fooStore.trigger(2);  //< Auto-completed as: (mul: number) => Promise<void>
fooStore.state === 'loading';
// ...
fooStore.state === 'resolved'
fooStore.value === 84;
```

Our adapter now really looks and feels like a standalone and self-contained utility. This new design is also a lot cleaner when it comes to binding to the view. As a refresher, here's the original design in action:

```html
<template>
    <!-- do stuff with users.status, users.value and users.error -->
</template>
<script setup>
    const store = useStore();
    
    const users = computed(() => store.users);
    store.dispatch('users/trigger');
</script>
```

And here is the Pinia version:

```html
<template>
    <!-- do stuff with usersStore.status, usersStore.value and usersStore.error -->
</template>
<script setup>
    const usersStore = useUsersStore();
    usersStore.trigger();
</script>
```

The computed is gone. One less variable to deal with. Best of all, if you implemented a presentation component to deal with the various states, you can also pass in the entire store as your AsyncValue. That computed, and maybe even the status, stays completely out of sight.

### More safety!
Let's push this a little further before we move on. Here's an alternative, safer, declaration for the `AsyncValue<V>` type:

```typescript
export interface AsyncValueInitial {
  status: 'initial';
}
export interface AsyncValueLoading {
  status: 'loading';
}
export interface AsyncValueContent<V> {
  status: 'resolved';
  value: V;
}
export interface AsyncValueError {
  status: 'error';
  error: unknown;
}
export type AsyncValue<V> = AsyncValueInitial | AsyncValueLoading | AsyncValueContent<V> | AsyncValueError;
```

This version takes advantage of a TypeScript feature to automatically tie the list of properties available in the type to a given string value, in this case the `status` property. We could use this pattern with Vuex, but with limited safety because of the various mutation functions. For instance, the 'resolve' mutation had to assume that the previous state was 'loading'. There were no guaranty. Everything had to be typed cast all the time to handle those transitions properly. Even if you typed the mutation's payload correctly in its declaration, the `commit` method still expected `any` so you wouldn't get any completion of validation there either. With Pinia, the `$patch` method will not let you set a state that isn't valid. You will even get completion for the different statuses and properties that goes with them. No more safety issues.

## Part 2 - Binders, Coming up!
Ok! Well, it's getting pretty late over here so, that will be all for now. In the next part, I'll talk (or at least, I hope I will) about how I got the Binder's store to work with this new toolset. I also have a couple of discussions going on in the Pinia GitHub about some of the more advanced features I've added to the Promise store. Depending on how they evolve, maybe we'll get to talk about those too!

Anyway, Read ya later!