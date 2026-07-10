# Meower

A simple full-stack social application inspired by the excellent **Meower** project created by **Coding Garden**.

This repository is my own implementation built while following and learning from the original project. It serves as a learning exercise and a foundation for experimenting with modern JavaScript, Node.js, and web development concepts.

> **Credit:** The original project and tutorial were created by Coding Garden:
> https://github.com/CodingGarden/meower

## Features

* Create meows (posts)
* View the global feed
* User authentication
* REST API
* Modern JavaScript (ES Modules)
* Responsive frontend

## Tech Stack

### Backend

* Node.js
* Express
* MongoDB
* Bad Words

### Frontend

* HTML
* CSS
* Vanilla JavaScript

## Getting Started

### Clone the repository

```bash
git clone https://github.com/dangermember/meower.git
cd meower
```

### Install dependencies

```bash
cd server
npm install
```

### Configure environment variables

Edit the `.env` file inside the server directory to match your config.

Example:

```env
MONGO_URI=<your-mongodb-connection-string>
CLIENT_URL=<your-client-live-server-url>
PORT=5000
VERSION=1.0.0
```

### Start the backend

```bash
npm start
```
or

```bash
npm run dev
```
### Run the frontend

Serve the client using your preferred static server (or Live Server if using VS Code).

## Learning Goals

This project was built to gain hands-on experience with:

* REST API development
* MongoDB
* Express.js
* Modern JavaScript
* Client-server communication

## Acknowledgements

A huge thank you to **Coding Garden** for creating the original Meower project and educational content that inspired this implementation.

Original repository:
https://github.com/CodingGarden/meower

## License

This repository is intended for educational purposes. Please refer to the original project's license for any code that originated from it.
