# Ping
<p align="center">
<img src="./src/assets/logo.png" width="200">
</p>

<h2 align="center">Proxy testing made easy.</h2>

![](https://img.shields.io/travis/jakerieger/Ping?style=for-the-badge)
![GitHub issues](https://img.shields.io/github/issues/jakerieger/Ping?style=for-the-badge)
![](https://img.shields.io/github/license/jakerieger/Ping?style=for-the-badge)
![](https://img.shields.io/github/stars/jakerieger/Ping?style=for-the-badge)

![](src/assets/ping.jpg)

Ping is a simple desktop application for testing HTTP/S and user authenticated proxies.

## Why use Ping?
Unlike other proxy testing programs like FOGLDN ProxyTester, Ping runs tests asynchronously allowing you to run thousands of tests in a matter of seconds.

## Download
You can download the latest windows binaries on our [releases](https://github.com/jakerieger/Ping/releases) page or build the source code yourself.

## Build
You'll need NodeJS installed on your computer and accessible in your command line. _(Note: you can run Ping on Windows, macOS, or Linux if you're building from the source.)_

Open a command line in the source root directory and run the command `npm install` to install all the required dependencies. If those install successfully, you can then run `npm run electron:serve` and the program window should open.