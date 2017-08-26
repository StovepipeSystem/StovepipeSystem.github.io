---
layout: post
title:  "Challenging the traditional vision of tests"
date:   2017-08-25 19:57:00 -0500
categories:
---

As I was watching one of many YouTube videos on the great Computerphile channel
today, I got struck by a really interesting idea. Most developers see tests as
*small, independent little pieces of code* that are their own little complete
program. They setup a context, validate an hypotheses, and cleanup the stage.
What I am about to bring to the table here will completely change this
assumption and alter the way you see, read and write test forever.

## Test Driven Development
TDD is a brilliant idea. It suggests that by writting test code before writting
production code, you can forge a form of trust with your final product. To get
there, you must be incredibly well disciplined and critique every single
charater you type if not even every single thought you have to avoid falling in
the trap of overthinking. This state of mind is hard to attain, but it pays off
in some of the most gratuitious ways.

When every single charater written is justified, when every path is considered,
you can trust that the software will behave exactly as you want it too in every
single situation.

To get there, you must have an excellent understanding of the tools that you
use like the language and its libraries. One of the key tool at your disposal
is code design practices; Things like SOLID and functional design. Let's talk
about one of them in particular: purity.

Pure code is code that have no side-effects. In other words, it is code that
have all of its inputs and outputs as clearly defined and predictable endpoints.
For instance, the following function is considered pure:

```
function pow(x: number): number {
    return x * x;
}
```

All of the inputs of this function comes in form of parameters. The single
output of this function goes in the form of a returned value. This is just the
way this language works. Maybe your language is different. In the end, only one
source and one destination is allowed and they both must be explicit for the
code to be pure.

This kind of code is incredibly easy to test. Pure code have no context to
setup or cleanup to take care of besides the parameters the function takes
and disposing of the return value if needed by the language or situation.
Everything can be mocked and controlled. Every edge case can be predicted.

## Complex code
In reality though, very few method are as simple as this example. You will have
complex context to setup, errors to handle, state to manage... But what if...
What if you could isolate as much as these pain points into separate
dependencies?

```
function suggestRelevantProducts(
    clock: Clock,
    state: Repository,
    customer: User
): Product[] | QueryError {
    return state.query<Product>("products")
        .where(p => p.updateDate > clock.now().addDays(-14))
        .where(p => p.isInStock)
        .where(p => p.interestCategories.intersect(customer.interests))
        .acquire()
}
```

Let's see if this function can be considered as pure. While it queries an
external database to gather data, interact with the current time and depends on
a specific user context, all of these dependencies are provided as an explicit
input. The time comes from a clock entity which can be manipulated to give out
any possible time. The products comes from a repository which can be faked to
query from a list that the test controls. Finally the customer, obviously can
be just about anything we want it to be. From the other side, the result of
this function can be either a list of products or an error. As long as the
dependencies are well behaved, this function is completely predictable and pure.

Now let's look at this repository for a moment.

```
class Repository {
    query<T>(source: string): QueryBuilder<T> {
        return new HttpQueryBuilder<T>(
            "http://source.example.com/api/products",
            []
        );
    }
}
```

Ok, for a given source the returned builder will always be the same so the fact
that this method is in a class has not changed anything so far. This still looks
pure to me. That builder looks a little shady though... We should dive in!

```
class QueryBuilder<T> {
    constructor(source: Url, params: QueryParam[]) {
        this.source = source;
        this.params = params;
    }

    where(param: QueryParam): QueryBuilder<T> {
        return new HttpQueryBuilder<T>(
            this.source,
            this.params.concat([ param ])
        );
    }

    aquire(): T[] | QueryError {
        return new HttpRequest(
            this.source + "?q=" + string.join(" AND ", this.params)
        );
    }
}
```

Whoa! Clearly there is state there! We see a constructor, state and `this` all
over the place, surely this cannot be considered...

```
type QueryBuilder<T> = {
    source: Url;
    params: QueryParams[];
}

where(this: QueryBuilder<T>, param: QueryParam): QueryBuilder<T> {
    return new HttpQueryBuilder<T>(
        this.source,
        this.params.concat([ param ])
    );
}

aquire(this: QueryBuilder<T>): T[] | QueryError {
    return new HttpRequest(
        this.source + "?q=" + string.join(" AND ", this.params)
    );
}
```

Oh...

Well seen under this angle. This code still looks pure. Remember, given a
consistent explicit input, the code should always return a consistend output.
Using classes and `this` only makes the input easier to pass around but it is
still technically coming from a single place and can still be easily
manipulated.

## Down the rabbit hole
Given that all of this clearly complex code is pure, it must all be easily
testable. All of this ease of testing comes from the matematical fact that pure
code is predictable. Given an input, it's output will always be the same.

What is really interesting is that this idea stacks up. Given an input to a
pure function calling an other pure function, it's output will always be the
same.

From the context of testing, this means that a test is no longer just *small,
independent little pieces of code* that are their own little complete program.
They are *their own language*; their own DSL. Tests, just like functions,
stacks on top of each other to build a higher level understanding of a problem.

Pure test code used to prove prove pure functions can be used to prove that
the composition of those functions is also working. In other words, integration
tests can be written as a composition of appropriately designed unit tests.

## Let's check it out
Based on this idea, here is what I would imagine such a test to look like.

```
// Individual pure functions, unit tested
var pow = describe("pow")
    .as(x => x * x)
    .provenBy(sut => {
        it("should return 0 when given 0", () => expect(sut(0)).to.be(0));
        it("should return 1 when given 1", () => expect(sut(1)).to.be(1));
        it("should return 4 when given 2", () => expect(sut(2)).to.be(4));
        it("should return 9 when given 3", () => expect(sut(3)).to.be(9));

        it("should return 1 when given -1", () => expect(sut(-1)).to.be(1));
        it("should return 4 when given -2", () => expect(sut(-2)).to.be(4));
        it("should return 9 when given -3", () => expect(sut(-3)).to.be(9));
    });

var div = describe("div")
    .as((x, y) => x / y)
    .provenBy(sut => {
        it("should return 0 when given 0 and n", [1, 2, 3, 10, 100], n => expect(sut(0, n).to.be(0)));
        it("should return 1 when given n and n", [1, 2, 3, 10, 100], n => expect(sut(n, n).to.be(1)));
        it("should return 0.5 when given 1 and 2", () => expect(sut(1, 2).to.be(1)));

        it("should return crash when given n and 0", [1, 2, 3, 10, 100], n => expect(() => sut(n, 0).to.throw()));
    });

// Integrated systems, integration tested
var halfPow = describe("halfPow")
    .as(x => div(pow(x), 2))
    .provenBy(sut => {
        it("should return 0.5 when given 1", () => expect(sut(1)).to.be(0.5));
        it("should return 2 when given 2", () => expect(sut(2)).to.be(2));
        it("should return 4.5 when given 3", () => expect(sut(3)).to.be(4.5));
    });
```

At first glance, this just looks like a normal BDD test framework tightly
coupled into the language. In reallity, this coupling enables so much more
capabilities when testing this code. For instance, it is only possible to run
proven code. Only code that is used needs to be proven to work. The proof of
work is embeded as part of the library code itself. Code that is not proven can
be dynamically disabled at compile time to ensure only working code is used.
To me, the best of all of this is that integration tests, which are renounded
to be low in value due to their lack of precision when failing, can now be so
much easier to debug as they depend on their components own tests.

In the end, the only thing that this idea does not improve is trust in external
dependencies. If you do not trust an external system to send valid messages to
your application, then nothing can help you. Not even traditional integration
tests because those invalid messages are, by definition, impossible to predict.

## Conclusion
As you can see by this small demonstation, a lot can still be done in the field
of software testing. Proving code to work is a challenge and can only be done
by building a pyramid of trust from the deepest piece of code you use all the
way to your entry points.

Tools can be build to help define this trust and make it accessible. Seeing
tests as their own independent code can actually be harmful to the discussion
and hide some potential solutions to this trust problem.

And as always, read y'all next time!
