<a id="readme-top"></a>

<br />
<div align="center">
  <h3 align="center">Twitter Clone</h3>
  <p align="center">
    A full-stack social media app.
    <br />
    <br />
    <br />
    <a href="https://github.com/martinanajdovska/twt-clone">View Demo</a>
  </p>
</div>

## About The Project

This Twitter Clone is built to demonstrate a modern full-stack architecture. It leverages a Java backend with Spring Boot and a highly responsive React frontend using Next.js. 

**Key Features:**
* **Authentication:** Login and registration.
* **Tweeting:** Create, delete and interact with tweets.
* **Image Support:** Image uploads powered by Cloudinary.
* **Client-side Caching:** Using TanStack Query for a lag-free user experience.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

* [![Next](https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
* [![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)](https://spring.io/projects/spring-boot)
* [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
* [![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)](https://cloudinary.com/)
* [![TanStack Query](https://img.shields.io/badge/TanStack_Query-FF4154?style=for-the-badge&logo=react-query&logoColor=white)](https://tanstack.com/query/latest)
* [![shadcn/ui](https://img.shields.io/badge/shadcn/ui-000000?style=for-the-badge&logo=shadcnui&logoColor=white)](https://ui.shadcn.com/)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Getting Started

The provided source code uses Docker for running the database. You need to replace all of the environment
variables in the docker-compose.yml with your own variables, or if you prefer to run the database on your machine you can write the same environment variables
in the application.properties file in backend/src/main/resources/application.properties

This project also uses Cloudinary for image storing. You need to make your own account and replace the api keys in CloudinaryConfiguration file with your own
values. You can do so by creating environment variables inside the configuration or a .env file depending on the IDE you are using.

For the frontend to communicate with the backend, you need to create a .env file inside the frontend folder and set up the public url.

To get a local copy up and running using docker, follow these steps. 

### Prerequisites

* Node.js & npm**
* Java 17 or higher
* Docker for PostgreSQL database (optional)

* Inside the frontend folder:
* **TanStack Query**
  ```sh
  npm i @tanstack/react-query
* **Shadcn**
  ```sh
  npx shadcn@latest init

### Installation

1. Get your Cloudinary keys here [https://cloudinary.com/]
2. Clone the repo
  ```sh
   git clone https://github.com/martinanajdovska/twt-clone.git
```
3. Backend
   * Set up your environment variables for the database, Cloudinary keys and frontend communication url
   * Inside the backend folder
   ```
    ./mvnw spring-boot:run
   ```
4. Frontend
   * Set up the api url in a .env file
   * Inside the frontend folder
   * Install packages and run the app
     ```
      npm install
      npm run dev
     ```
   * You should be able to access the app on http://localhost:3000
