1. [Overview](#overview)
1. [Grafana Prototyping Enviromment (grape)](#grafana-prototyping-environment)
1. [Quantum Safe Password Manager (qspm)](#quantum-safe-password-manager)
1. [RSA Demo](#rsa-demo)
1. [z-tables](#z-tables)

## Overview
These are open source projects that i have developed either in my personal account or in
my employers (eSentire) open source account.

> This page only contains a subset of the projects i have worked on.
> I will be adding more as time goes on.

## Grafana Prototyping Environment
The Grafana prototyping environment is a repository that provides a tool named `grape` that
enables you to easily create Grafana visualizations using Docker containers to create a Grafana server and
a PostgreSQL database on your laptop that can be saved and used in other environments without having
to install any Grafana or database specific software.

* The project is available [here](https://github.com/eSentire/grape).

## Quantum Safe Password Manager
The quantum safe password manager (`qspm`) is a single page application (SPA) demonstration
webapp that shows how to build a simple password management system using symmetric key encryption
algorithms that are safe from currently known quantum attacks.

One of the interesting features of this project is the use of the Rust programming language to
implement the algorithms that are then converted to WebAssembly for higher performance, 
secure encryption/decryption operations in the browser.

Another interesting feature is the ability to choose between different algorithms.

Yet another interesting feature is the use of the Github Workflow Actions service to
test both the Rust code and the web interface using a headless chrome browser and
[pyleniumio](https://github.com/ElSnoMan/pyleniumio).

* The webapp is available [here](https://esentire.github.io/qspm/).
* The project is available [here](https://github.com/eSentire/qspm).

## RSA Demo
This roject generates a wheel that contains tools to implement the RSA algorithm to help people
understand how key generation, encryption and decryption work at a somewhat detailed level.

It provides tools that allow a user to generate public and private key files using keygen and
then uses those files to encrypt and decrypt files. It also provides tools to read and dump the public and private key files.

One interesting feature is that it will encrypt and decrypt text of sizes greater than a single block. 
Another is that it uses the same key structure as production tools (PKCS#1 and ssh-rsa).

* The project is available [here](https://github.com/jlinoff/rsa_demo).

## Z-Tables
Ever wonder how Standard Normal and Student-t Distribution z-tables are generated?

This program shows how to generate z-tables for Standard Normal Distributions and Student-t Distributions. 
It also shows how to generate the z-values for specific probabilities from those distributions without using any special libraries.

* The project is available [here](https://github.com/jlinoff/ztables).