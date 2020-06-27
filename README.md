# NetClave Web Wallet

**Turn your local network into a hardened enclave fortress**

## Intro

The Web Wallet is responsible for signing the HTTP request going out from the user’s browser. It is implemented as a Chrome extension, and its main goal is to get the token generated from the Generator, sign it with the wallet’s private key, and put it as a cookie HTTP header for all suddomains or domains which are listed as a permitted service in the paired Identity Provider for this wallet. Actually, our wallet is much like a bucket of paired identity providers, with their control access data synced back to the Wallet.

## Why is this so awesome? 🤩

You want to learn more about how you can use NetClave to protect your local network? [**Learn about all our Products**](https://www.blackvisor.io/products/).
Or checkout our whitepaper! [**NetClave whitepaper**](https://www.blackvisor.io/whitepapers/)

## Get your NetClave 🚚

- 🖥 [**Install** a server by yourself](https://www.blackvisor.io/netclave-install/#instructions-server) on your own hardware

Enterprise? Public Sector or Education user? You may want to have a look into [**NetClave Services**](https://www.blackvisor.io/services/) provided by Blackvisor LTD.

## Get in touch 💬

* [📋 Send Us Email](info@blackvisor.io)
* [🐣 Twitter](https://twitter.com/blackvisor1)
* [🐘 Linkedin](https://linkedin.com/company/blackvisor)

You can also [get support for NetClave](https://www.blackvisor.io/contact-us/)!


## Join the team 👪

There are many ways to contribute, of which development is only one! Find out [how to get involved](https://www.blackvisor.io/contributors), including as translator, designer, tester, helping others and much more! 😍


### Prerequirements 👩‍💻

1. Golang
2. Git
3. Make


### Building code 🏗

Just run the following command:

``` bash
make
```
The generated binaries can be found in ./bin directory

## Contribution guidelines 📜

All contributions to this repository are considered to be licensed under the Apache 2 or any later version.

NetClave doesn't require a CLA (Contributor License Agreement).
The copyright belongs to all the individual contributors. Therefore we recommend
that every contributor adds following line to the header of a file, if they
changed it substantially:

```
@copyright Copyright (c) <year>, <your name> (<your email address>)
```

More information how to contribute: [https://www.blackvisor.io/contributors/](https://www.blackvisor.io/contributors/)