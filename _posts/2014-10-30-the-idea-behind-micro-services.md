---
layout: post
title:  "The idea behind micro services"
date:   2014-10-30 14:58:00 -0500
categories:
---

Micro services are so much more than just a way to build a large application. They are not about having a whole bunch of independent tiny web servers talking to each other. It is a design pattern you can use to structure your code, any code. At heart, micro services are about small independent units working together toward a larger goal. Micro services are probably the absolute best hammer for just about every single job. Here's why.

## Single responsibility

The first thing micro services bring to the table is a strong concept of integrity. That is strong cohesion and low coupling. The very concept of having a small object taking care of some very specific needs goes hand in hand with the problem of cohesion and coupling. To understand this, we must first look at what is the service pattern. In OOP, a service is a piece of code, typically a class, that handles processes on a related model. If you look at it from an MVVM point of view, services are what your view models should call to acquire their data, apply your business processes and push the data back to some permanent storage.

Here is a quick example of an application using the service pattern to display a list of employees whom contact information have not been filed:

{% highlight csharp %}
class Employee {}
interface IUserAccessToken {}
interface IRepository {}

interface IEmployeeService
{
 IEnumerable<Employee> GetEmployeesWithInvalidContactInfo();
}

class EmployeeListViewModel
{
 private IEmployeeService _employeeService;
 
 public EmployeeListViewModel(IEmployeeService employeeService)
 {
 _employeeService = employeeService;
 }
 
 public Employee[] InvalidEmployees { get; private set; }
 
 public ICommand RefreshEmployees()
 {
 return SimpleCommand.OnExecute(() =>
 InvalidEmployees = GetEmployeesWithInvalidContactInfo()
 );
 }
 
 private Employee[] GetEmployeesWithInvalidContactInfo()
 {
 return _employeeService
 .GetEmployeesWithInvalidContactInfo()
 .OrderBy(e => e.Name)
 .ToArray();
 }
}

class EmployeeService
{
 private IUserAccessToken _token;
 private IRepository _employeeSource;
 
 public EmployeeService(IUserAccessToken token, IRepository employeeSource)
 {
 _token = token;
 _employeeSource = employeeSource;
 }
 
 public IEnumerable<Employee> GetEmployeesWithInvalidContactInfo()
 {
 return _employeeSource
 .Query()
 .WithAccess(_token)
 .Where(e => e.ContactInfo.Any() && e.EmergencyContactInfo.Any());
 }
}
{% endhighlight %}

Here, we are using an IEmployeeService to fill a list of invalid employees in the view model when a refresh is triggered. The goal of this service is to hide the complexities of the underlying query, leaving only display logic to be taken care of in the view model. The service takes care of forwarding the security token to the remote repository and gives a meaning to "Invalid Contact Info" by saying that an employee must have a contact and an emergency contact to be valid.

In those services, the more you focus on a specific task, the more you have to remove distractions around. You could put everything into a single class and call it a service. This kind of thinking works very well for extremely small projects because those applications usually end up with 1 to 3 simple concerns. The moment you want to deal with real applications though, you have to start breaking things apart. In a JavaScript web application, you might end up with an AJAX service that takes care of sending requests to your server. You might also have a persistence service that lets you save data to various destinations like the browser's local storage or the AJAX service itself. Let's say you are working on an IDE, you might want to provide some code auto-complete feature to your users, this can be crammed into a service too. In the case of our employee management example, there might be a lot more services, each taking care of a single responsibility like the one from IEmployeeService.

The more you think in term of services, the more you end up with reusable block of independent features. This is because you can clearly see what belongs into a service and what doesn't. The code that doesn't ends up distracting when trying to accomplish the main service's task just feels out of place. It might be a method that deals with significantly different data than the others or a block of code that doesn't look like it has been written in the same style that the others. It might sound counter-intuitive, but the latter is usually easier to spot than the former. Code that is imperative stands out in a sea of declarative or fluent calls, highly nested loops or conditions are clearly, visually not aligned with more linear algorithms and finally injecting a dependency for a single line of code is the epiphany of those examples. On the other side, it is hard to tell if the `Employee` class have anything to do with the `Person` class or if you should handle a `Person` emails or hand that over to a different service. In our case, it is safe to say that an `CreateEmployee` method would make quite a lot of sense in our `IEmployeeService`, but a `CreateManager` method would probably deserve its own service as it deals with a different entity and repository.

In other words, well designed services tends toward having a single responsibility and micro services are exactly that: a single service for a single task.

## Extensible

Another reason why you might be interested in using micro services is that their nature makes them highly extensible. They tends to have a fair amount of injectable dependencies that you can swap to create new behaviors. They also expose almost everything they can do through an interface making it easy to override part of the behaviors. Finally, in most languages, it is trivial to implement the most complicated behavior the application might need in a service and expose this behavior through overloads that offers simpler variations as needed.

Let's say we update our example to support paging and filtering. The interface will probably be updated to look like this:

{% highlight csharp %}
interface IEmployeeService
{
 IEnumerable<Employee> GetEmployeesWithInvalidContactInfo(Func<Employee, bool> filter, int count, int page);
}
{% endhighlight %}

But you might also want to be able to take some shortcuts when some values can be inferred like in our existing view model:

`_employeeService.GetEmployeesWithInvalidContactInfo();`

This can easily be accomplished using a simple extension method.

{% highlight csharp %}
public IEnumerable<Employee> GetEmployeesWithInvalidContactInfo(this IEmployeeService service)
{
    return service.GetEmployeesWithInvalidContactInfo(e => true, int.MaxValue, 0);
}
{% endhighlight %}

While those are just simple overloads, you could go a lot further using simple extension methods. The important thing to remember here is that the service itself does not have to be modified to support those overloads. Everything can be done from outside in separate classes. Smaller services makes for easier code organization when dealing with those extensions.

## Reusable

The second your start thinking in terms of services, you have to deal with dependencies. Since services are highly cohesive, they strongly depends their users to provide them with their dependencies. This means that services ends up being shared between each other in your code quite often. Taking a look at our previous example, many view models will probably use an `IEmployeeService` and many services will use an `IUserAccessToken`. Their code ends up being reused dozens of times throughout your application.

They are often highly decoupled from your business domain which makes them great candidate for external code reuse in other projects. As a matter of fact, AngularJs, a popular JavaScript framework, already provides a tons of services to you to take care of DOM manipulation and AJAX queries. This shows how reusable a service can become and it greatly help reducing the amount of repetitions in your codebase.

## Segregated

Sometimes, some services might have a common codebase and you might be tempted to leave everything in a single class to simplify the data flow. This is questionable, but in such a case, nothing forces your to expose a single interface for both behaviors. You can easily implement two interfaces in a single service. This enables you to publish your service to other developers while keeping the ability to split it in two later on when the need arise.

For instance, we could have an `IReadEmployeeService`, an `ICreateEmployeeService` and an `IUpdateEmployeeService`. We can always add an `IDeleteEmployeeService` later if we need to. In the end, all of that code can end up in the same `EmployeeService` class we already have. The important thing is, we can always change our mind later on.

## Injectable

As I already mentioned, a side effect of dealing with highly decoupled services is that you end up having to deal with dependencies a lot. Because of this, micro services are a clear use case for constructor dependency injection and inversion of control. Each services should always expose an interface. Other services can then depend on them through constructor injection without imposing a specific implementation. You can then truly let your dependency injection framework shine and take care of resolving those dependencies for you.

In fact, you can even inject new services at run-time through a plugin architecture which lets you extend your application as it is running. Having all of those reusable blocks of code helps in exposing points of interactions with the plugin's developers and simplify their job. Everyone wins!

## Conclusion... or is it?

As you can see, there are a lot of advantages to micro services, the main one being that they not only respect but actually impose SOLID principles onto your code. It is harder to write micro services without ending up respecting those principles than trying to force your way against them. This makes the micro services pattern a really good design candidate for just about any code base. But, there are even more advantages...

Aside from the SOLID principles, micro services also comes with other additional goodies that you might like.

## Immutability

When dealing with very small, reusable piece of code, it gets harder to track and store states. There are so many places where you could store data that you are better-off without states at all. This encourage the use of stateless patterns like pure methods which not only improve code readability but also reduce the chances of bugs. Good micro services design usually abuse of the principle of immutability to reduce side effects as they would get amplified very quickly as a service gets reused.

For instance, instead of adding a `SetCurrentPage` or `SetMaxResultCount` method on the service, we prefer to share those states through the method parameters. Having to deal with such a state would be really troublesome if we started to have multiple instances of the `EmployeeService` class. In this case, immutability is just a simpler path.

## Code Ownership

Usually, in a serious development environment, when you write a piece of code, you end up owning it. People can easily track who wrote a block of code through the use of source control systems or even through knowledge sharing meetings. Your coworkers will ends up depending on your knowledge of the code when using your services or figuring out issues. As the original writer, you will be the first resource everyone will go to when they have questions.

This can be really painful when you author a large piece of code because by the time you come back to them a few months later to answer questions, you will have a much more complex puzzle to wrap your mind around before answering anyone's questions. With micro services, there are also less chances someone else will change your code in a way that makes it unfamiliar to you. If a large refactor happens, they will have to take ownership of the new services and your name will usually end up erased from history as new classes gets created. Normally though, you will rarely see someone else change a service you own. Instead, most people will be creating new files all the time which makes it easier when you come back to your code a few months later.

## The truth...

You probably noticed that I never attached micro services to any specific communication technologies . This is why they are in fact a pattern. They can be implemented inside an application or through an entire cloud application by using multiple segregated applications that communicate to each others using message queues, rest or protocol buffer endpoints or even simple piping. In fact, *nix is strongly based on the micro services pattern as it is built as a collection of small tools like `grep`, `test` or `chmod`. Thing is, it wasn't a thing at the time so they didn't advertised it as such. In my head though, linux is a perfect example of a very successful micro service architecture.

Next time you design an application or refactor an existing one, consider this: micro services are a pattern that provides a SOLID foundation and helps reduce bugs through immutability and fix them through better code ownership. They truly are a recipe for success.

Read ya later!