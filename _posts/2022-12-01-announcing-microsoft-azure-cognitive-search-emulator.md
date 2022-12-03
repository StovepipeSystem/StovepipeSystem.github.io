---
layout: post
title:  "Announcing Microsoft Azure Cognitive Search Emulator"
date:   2022-12-01 00:00:00 -0500
categories:
---

## About Azure Cognitive Search
[Microsoft Azure](https://azure.microsoft.com/en-us/) is a cloud service that generally provides an amazing development
experience. Contrary to competitors like AWS or GCP, a large amount of their services can be easily mocked or replaced
with local variants to help you iterate on your code quickly, without the overhead and costs of deploying to the cloud
every time to test your code. This is especially notable for users of
[Azure AppService](https://azure.microsoft.com/en-us/products/app-service/#overview),
[Azure Functions](https://azure.microsoft.com/en-us/products/functions/#overview),
[Azure CosmosDB](https://azure.microsoft.com/en-us/products/cosmos-db/#overview),
[Azure SQL](https://azure.microsoft.com/en-us/products/azure-sql/database/#overview),
and [Azure Storage](https://azure.microsoft.com/en-us/products/category/storage/).
These five services alone already cover a very large portion of what developers want out of a cloud provider: WebSite
hosting, Serverless hosting, NoSQL databases, SQL databases, and unstructured storage. For each of those services,
Microsoft already offer great solutions for local development. Sometimes, they are even cross-platform.

You have the [dotnet Kestrel web server](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/kestrel)
which runs on every platform and let you test your ASP.NET applications quickly before they end up on AppService.

You have the [Azure Functions Core Tools](https://learn.microsoft.com/en-us/azure/azure-functions/functions-run-local)
which lets you emulate the whole Azure Functions platform in a single command line, including support for
[Durable Functions](https://learn.microsoft.com/en-us/azure/azure-functions/durable/durable-functions-overview).

You have the [CosmosDB emulator](https://learn.microsoft.com/en-us/azure/cosmos-db/local-emulator) that can simulate the
entire set of supported APIs from the cloud service of the same name with very little configuration (with a linux
version in preview that supports the SQL and MongoDB APIs).

You have [SQL Server Express LocalDB](https://learn.microsoft.com/en-us/sql/database-engine/configure-windows/sql-server-express-localdb)
which has a free version that can be installed on your machine for testing, and I believe that also have an equivalent
available on linux.

And finally, you have [Azurite](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite), the Azure
Storage emulator, that is also cross-platform and support all forms of unstructured storage.

You might have noticed that, so far, there's one conspicuously missing server from this list...
[Azure Cognitive Search](https://azure.microsoft.com/en-us/products/search/#overview)

For some reason, Microsoft have yet to provide an emulator for their very powerful search index; even just a limited one.
There are a couple of low-key open source emulators available out there. They however either have massive dependencies
like Solr and Java, or offer little to no features. All of them are also built in .NET, due to its facilities to
implement the few OData queries that the service supports.

I thought it might be time to fix those problems...

## A look at the competition
The main issue with these emulators is that they do not help developers write an application that will eventually target
the official Azure Search Service. This is because they focus on implementing the full text search part of the API,
instead of the infrastructure part of the API. While Azure search gives you the ability to write queries using a
comprehensive set of Lucene-based syntax, this is surprisingly not where most of us spend our time. More often than not,
the query will be taken straight from a text box in our UI, so the exact syntax here doesn't matter that much. What's
important is that everything around this query, things like the various field types, filtering, scoring, mapping,
ordering, faceting, highlighting, suggesting, autocompleting, and document operations works flawlessly.

If you are building an e-commerce website and your emulator doesn't support facets, it doesn't matter if you can query
it with Lucene.

If you need to provide product suggestions to your users and your emulator doesn't support suggestions, it doesn't
matter if you can query it with Lucene.

If you need to include autocomplete to quickly browse through lists of thousands of entries in your demos and your
emulator doesn't support autocompletion, it doesn't matter if you can query it with Lucene.

If you need to spend so much time to install tons of complex dependencies and preload them with data that it would be
faster and cheaper to spin up an instance of the real thing, it doesn't matter if your emulator supports Lucene.

Even worse, some of those emulators even imposes you an AGPL license to ensure that you do not use them in production,
which completely excludes two massive sides of the market:
1) Azure Search is extremely expensive to start and having a free version available in production for a very lite load 
   might be useful for a small business.
2) Having an emulator also means having a local version of Azure Search that requires no external network communication 
   to function which can open up some new possibilities in a privacy-oriented or offline context, amongst others.

## Introducing Azure Cognitive Search Emulator JS
A boring name, I know, but trust me, this is bigger than it looks. This package aims at replicating the entirety of the
official [Azure Cognitive Search API](https://learn.microsoft.com/en-us/rest/api/searchservice/) for structured data.
The goal here is that everything that can be done with the official JavaScript client should be doable while targeting
the emulator. In theory, that should be the same goal as every other emulator out there. The key is how I approached it
to fix every single one of the previous issues I've mentioned.

First, this emulator is built in [TypeScript](https://www.typescriptlang.org/). This means that you can either front it
with an [ExpressJs](https://expressjs.com/) server in [NodeJs](https://nodejs.org/), or you can embed it directly into
your web application. Yes, it can run in the browser. This is a huge opportunity for people with static sites that needs
a quick search capability. With just a bit of javascript, you can preload your index when the page loads from known
documents and hook the emulator to a search field. You could also use the emulator for local development to avoid the
costs and complexities of managing an instance of Azure Cognitive Search in your dev environment. This is ideal when you
need to spin-up a quick demo version of your app, again with a predefined index, and trivial to setup with tools like
[MirageJs](https://miragejs.com/).

Second, this emulator focuses on APIs that have an impact on your code. It provides every single functionality that
might impact the structure of the queries and responses that you create, while de-prioritizing features that are mostly
user facing. For instance, while it is planned to have support for the
[full Lucene query syntax](https://learn.microsoft.com/en-us/azure/search/query-lucene-syntax), right now, only the
[simple query syntax](https://learn.microsoft.com/en-us/azure/search/query-simple-syntax) is supported. This is fine
though since Lucene is designed as a syntax for end users to manipulate, and not for you to generate from a prompt.
Lucene let you search for `bil*`, `price: !free`, or `wooden matches~1` and expect end-users to know what those
operators are. There is definitely a reason why Lucene exists, and also why your end-users want it, even if they never
heard the name. However, we, developers, can live with limited queries in a dev environment at least for a while. What
we cannot live without, is features that can impact the entire architecture of our code, like complex types,
location-based queries, suggestions and autocompletion, all things that changes how you design and write your application.
This is why everything listed here is supported right now in the emulator. As long as you let your users type in they
own query, the full lucene syntax can come later.

Third, this emulator helps you quickly iterate over your index's design. With a near zero spin-up time, you can quickly
change the structure of your index, and in fact, have multiple indices running at the same time in the same emulator,
just like the real service. It also validates that every document you insert matches your schema and that queries you
make (including $filter, $oderBy, and $select) only uses fields that are enabled in the schema. This quick validation
reduces the development cycle time and ensures that, if you built your entire schema and document structure with the
emulator, it should work as expected when you move it to the official Azure Search service to scale up.

## I want in!
If you're still reading at this point, then this is probably a tool you want in your arsenal. There's a demo, right here
at the top of the homepage of this very blog, and you can find the package and a ton more info over
[on NPM](https://www.npmjs.com/package/azure-search-emulator-js).

For now, that's all I have for you. Read you later!
