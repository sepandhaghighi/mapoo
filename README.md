<div align="center">
    <img src="https://github.com/sepandhaghighi/mapoo/raw/logo/assets/logo.png" alt="Mapoo Logo" width="210">
    <h1>Mapoo: Convert Location Links Between Map Services</h1>
    <br/>
    <a href="https://mapoo.ir"><img src="https://img.shields.io/badge/demo-mapoo.ir-green.svg"></a>
    <a href="https://github.com/sepandhaghighi/mapoo"><img alt="GitHub repo size" src="https://img.shields.io/github/repo-size/sepandhaghighi/mapoo"></a>
    <a href="https://github.com/sepandhaghighi/mapoo"><img src="https://img.shields.io/github/stars/sepandhaghighi/mapoo.svg?style=social&label=Stars"></a>
</div>

## Overview

Mapoo is a lightweight web application for converting location links between different map services.

It extracts latitude and longitude coordinates from supported location links and generates equivalent links that can be opened in other supported map services.

Mapoo is designed to make sharing and opening the same location across different map platforms simple, fast, and convenient.

<table>
	<tr> 
		<td align="center">Code Quality</td>
		<td align="center"><a href="https://www.codefactor.io/repository/github/sepandhaghighi/mapoo"><img src="https://www.codefactor.io/repository/github/sepandhaghighi/mapoo/badge" alt="CodeFactor"></a></td>
		<td align="center"><a href="https://app.codacy.com/gh/sepandhaghighi/mapoo/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade"><img src="https://app.codacy.com/project/badge/Grade/86ce59acb6bd40cc97646add783cf7c0"></a></td>
	</tr>
</table>


## Features

* Convert location links between supported map services
* Extract latitude and longitude coordinates from location URLs
* Generate equivalent links for multiple map platforms
* Support direct latitude and longitude input
* Decode URL-encoded location links
* Save recently converted locations locally
* Reuse locations from conversion history
* Delete individual history entries
* Clear the entire conversion history
* Responsive design for desktop and mobile devices
* No backend or server-side processing required
* Store conversion history locally using browser `localStorage`


## Supported Services

Mapoo currently supports the following map services:

* Google Maps
* Waze
* Neshan
* Balad


## Usage

1. Open Mapoo.
2. Paste a location link into the input field.
3. Click **Convert Link**.
4. Mapoo extracts the latitude and longitude coordinates.
5. Open the generated links using any of the supported map services.

Converted locations are automatically saved in your browser's local history. You can reuse or delete saved locations at any time.



## Local Development

To test Mapoo locally, you can use [Ghps](https://github.com/sepandhaghighi/ghps) a minimal GitHub Pages simulator written in pure Python.

Run:

```console
ghps --port=5010 --auto-open
```

Then open your browser and visit:

```console
http://localhost:5010
```

## Issues & Bug Reports

Just fill an issue and describe it. We'll check it ASAP! or send an email to [info@mapoo.ir](mailto:info@mapoo.ir "info@mapoo.ir"). 

- Please complete the issue template