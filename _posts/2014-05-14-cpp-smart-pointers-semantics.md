---
layout: post
title:  "C++ smart pointers semantics"
date:   2014-05-14 22:27:00 -0500
categories:
---

As C++ is becoming more and more mature, new features starts to appear within the standard that makes it a good candidate for modern development scenarios. One of those features which made it to the C++11 standard was smart pointers. When you first look at them, how they should be used might not be obvious for you. This is because not everyone are used to the semantics they represent. Since the meaning of things are a lot more important than their dictionary definition, this post will take a quick look at those super useful objects by focusing on semantics.

## Smarting up

First thing first, it is important to properly understand the semantics of basic, raw pointers. Yes they are used to point at values in memory, but in context, there are a lot more we can comprehend through their presence in the code. Looking at the following code snippet, what can you tell from the way pointers are used?

{% highlight cpp %}
Bar Foo()
{
    auto obj = new Object();
    auto bar = new Bar();

    obj.DoSomething(bar);

    delete obj;

    return bar;
}
{% endhighlight %}

There are three different types of semantics represented here. The first type is used by the obj pointer which lives for a specific scope. You can think of this as a scoped pointer. They are generally associated with temporary objects that cannot be defined on the stack (they might require polymorphism) and have a very limited life-time. This might be a connection to a database that needs to be opened just for a few lines of code and cleaned up properly when the query is done. The next type is used by the bar pointer which lives for some unknown amount of time. These pointers usually represent dependencies. When a method returns a pointer, it hands back a value that you have explicitly requested. For instance, a thread pool will hand over a thread when requested. It might be a new thread or a recycled one and you do not care about that. You just want a valid thread to do your work. Finally, the third type is used by the DoSomething method which takes a pointer as its input. This will happen when the method have an optional dependency or a dependency.

In all cases, the concept of memory management is a big caveat. You will never use a pointer because you want to manage memory. You will manage memory because you need to do something that is somewhat related to the three semantics I mentioned so far. This is where smart pointers becomes interesting. Since they manage the memory of their associated instances for you, you can stop focusing on the risks of memory leaks and null values and put your energy on semantics instead.

### Scoped pointers - Nostalgia

Back in the days of C++03, we used to have a type called `auto_ptr`. Just like boost's `scoped_ptr`, this type tried to take care of the first semantic category. Unfortunately, while it did a great job at managing memory, it did a poor job at enforcing the semantics of a scoped pointer. Because of this, most developers recommended against using  The following snippet will illustrate why it had those issues.

{% highlight cpp %}
auto_ptr<Object> Foo()
{
    auto obj = auto_ptr<Object>();

    DoSomething(obj);

    return obj;
}
{% endhighlight %}

While it would have been perfectly correct to use `auto_ptr` for the `obj` pointer in the previous example, here, the concept of scope is not enforced properly. Calling the DoSomething method by passing in an `auto_ptr` is OK in this case since it will finish within the execution of the parent method. On the other side, returning an `auto_ptr` object enables the obj pointer to leave the scope that `auto_ptr` was supposed to manage. When will obj be deleted? It seems to confuse the scope semantics with the dependency acquisition semantics.

The most important problem with this example does not even have anything to do with semantics! An important implementation detail to know about `auto_ptr` is that it is a strict owning pointer. This means that depending on how the DoSomething method call is declared, the value returned by this method might be empty. More precisely, when an `auto_ptr` gets copied, it will actually move the content from its previous instance back into the new instance; leaving the older instance empty. That is, you cannot copy an `auto_ptr`, only move them.

### Unique pointers - Modern scope life-time management

The solution to this problem came in the form of new language features and a new object that replaced `auto_ptr`: `unique_ptr`. Even though `auto_ptr` made sure to delete its associated object as it died, or to move its content to a new instance when needed, it did so before the apparition of true move semantics into the language. This made it really hard to make sure that `auto_ptr`s behaved as expected because its move behavior could only be guarantied at runtime. A common case for this is the std::vector class for which almost every range operations takes copies of its content in predicates instead of references. Thus, using any of those operations on a vector of `auto_ptr` would effectively delete its content.

`unique_ptr` addresses this by preventing copy all-together and making it a compilation error. This means that there are now additional safeties inside the smart pointer to properly enforce its uniqueness semantic at compile time. Let us take a look at what this means:

{% highlight cpp %}
std::auto_ptr<int> storage;

std::auto_ptr<int> GetValue()
{
    storage = std::auto_ptr<int>(new int(42));

    return storage;
}
{% endhighlight %}

This snippet will compile and will return the value 42 as you would expect. It will also wipe out the value contained within storage so anyone trying to access it later on will get a null pointer. On the other side, replace all of those `auto_ptr` with `unique_ptr` and...

{% highlight cpp %}
std::unique_ptr<int> storage;

std::unique_ptr<int> GetValue()
{
    storage = std::unique_ptr<int>(new int(42));

    return storage;
}
{% endhighlight %}

This version here will not even compile. The value pointed by the instance of `unique_ptr` created within this method cannot be owned by more than one party. This example tries to share this value with storage and whoever is using the value returned by this function. This is illegal and will fail the build. To extract the value of storage and return it from the function, you need to explicitly call the `std::move()` method. This enforce that a `unique_ptr` is truly the only owner of a value and thus can safely delete the associated instance when it leaves the pointer's scope.

### Shared_ptr - Sharing is caring

But what of when you really need to have shared ownership? What of those examples where the thread pool needs to keep track of the threads at the same time you need to use it, or those DI containers that holds instances of services and anyone, at any time can request a pointer to anyone of them? The `shared_ptr` object is there to solve this issue. Contrary to `unique_ptr`, `shared_ptr` will use reference counting to keep track of own many objects are currently owning an instance to the pointed value and will release it when the counter hits zero. This prevents the issue seen when trying to return a member value owned by an `auto_ptr`. Instead of moving the content from the member to the returned value like we seen earlier with `auto_ptr` and `unique_ptr`, it will increment its counter by one thus making sure that the member value is still valid.

{% highlight cpp %}
std::shared_ptr<int> storage;

std::shared_ptr<int> GetValue()
{
    storage = std::shared_ptr<int>(new int(42));

    return storage;
}
{% endhighlight %}

In this sample, after calling the GetValue function and storing its result somewhere, the `shared_ptr` instance counter will have a value of two. This behavior ensures that as long as someone needs its value, the `shared_ptr` will keep its reference alive. There is no importance in the order which those pointers will get released as the shared memory will simply be freed once the counter hits zero.

This does not mean that `unique_ptr` should be avoided. You should see `unique_ptr` as an optimization on top of `shared_ptr`, for those cases where holding a reference count would not bring any added value.

## Extended semantics

So far, this takes care of what each objects means by themselves, but it does not necessarily give sense to each kind of smart pointers in context. Here's a few lines of code that we will try to make clear.

{% highlight cpp %}
void F1(const std::unique_ptr<Bar>&);

void F2(std::unique_ptr<Bar>&&);

void F3(const std::shared_ptr<Bar>&);

std::unique_ptr<Bar> F4();

std::shared_ptr<Bar> F5();
{% endhighlight %}

All of those covers the most common use cases of passing around smart pointers and they all mean something different. Learning to read and use those patterns will help you understand C++ code in a much easier way. Before jumping in there, it is important to understand that even with smart pointers, the old sayings still stands: "there should be one delete for every new in your code". Since we are using smart pointers, there is no reason to use new anymore, so you should use `std::make_unique` and `std::make_shared` instead when creating new instances of those types. These methods makes it impossible for a smart pointers to store a value from the stack. It ensures that the pointer completely owns the lifetime of the instance it manages.

Passing a `unique_ptr` by constant reference means that the method will use it directly but not store it for later use. This tells us right away that F1 cannot be a setter. It can only be a processing method.

Providing a `unique_ptr` by non-constant r-value reference means that this method is trying to take ownership of the value. It says that once you called this method, your instance will be invalid. This makes F2 a great candidate for a setter or a service that requires a dependency that is not shared with other one like most of an object's properties.

When dealing with interfaces, references can be painful to maintain. Even though polymorphism will work with them, you cannot store them as references or pointers in your class properties because you simply don't know if they came from a heap variable, in which case everything would be fine, or a stack variable, in which case the pointer would be invalidated at the end of the caller's scope. The use of constant shared pointer references solves this issue. F3 means that this method expect a reference to a specific type that must come from the heap. This is specially useful when passing around shared services to constructors via ctor dependency injection. This way, you are guarantied that the value you receive will not get invalidated before you release it, even if your caller says it does not need it anymore.

F4 is a perfect candidate for a factory method. Returning a `unique_ptr` means that the callee will never need this value again and that the caller is the only one who can take care of this value and that it is its job to keep it alive if needed. A factory should always return a `unique_ptr`. This imposes nothing to the user of your factory method as `unique_ptr` can be converted to `shared_ptr` directly so if the caller needs to share the value with many other instances, it still can.

Finally, the F5 case should only be used for getters of shared values. The only reason why this is required is because you should never break the encapsulation provided by a smart pointer and return the pointer directly. Doing this is extremely unsafe as there is no way for you to know when the memory associated to the value you received will be released. On the same note, be careful not to store publicly accessible data in a `unique_ptr` field as returning it through a `shared_ptr` property via std::move will cause the field to loose its value. This is also an acceptable optimization when you know that the user of a factory will always keep multiple copies of your value. In this case, you should use `shared_ptr` instead of `unique_ptr`.

## Conclusion

Using these patterns, you can now write code that enforce good pointer semantics without having to care about memory management. You will be able to deduce specific behaviors out of methods without even needing to read their documentation. Things like "you must not delete this pointer as the method will take care of it" or "you must delete this pointer yourself" are not needed anymore, not only because they are automatic, but because those principles are baked into the smart pointer objects of C++11.