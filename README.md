<a id="readme-top"></a>

<br />
<div align="center">
  <h3 align="center">Twitter Clone</h3>
  <p align="center">
    A full-stack social media app.
    <br />
    <br />
    <br />
    <a href="https://drive.google.com/file/d/1gOJF939M91Z2h_UVoLcdThnrPtasmLsu/view?usp=drive_link">View Demo</a>
  </p>
</div>

## About The Project

This Twitter Clone is built to demonstrate a modern full-stack architecture. It leverages a Java backend with Spring Boot and a highly responsive React frontend using Next.js. 

**Key Features:**
* **Authentication:** Login and registration.
* **Tweeting:** Create, delete and interact with tweets.
* **Image Support:** Image uploads powered by Cloudinary.
* **Client-side Caching:** Lag-free user experience.
* **Real-time Notifications:** Utilizing WebSocket for listening to updates.
* **Dark/Light Mode:** Theme toggling for better user experience.

**Architecture Overview:**
* Frontend (Next.js): Acts as the Presentation Layer. It uses TanStack Query for fetching and caching data from the API and WebSockets (STOMP/SockJS) for real-time notifications.
* Backend (Spring Boot): Acts as the RESTful API Layer. It follows a Layered Architecture (Controller -> Service -> Repository).
* Database (PostgreSQL): Stores relational data like Users, Tweets, and Relationships.
* External Services: Cloudinary handles the storage and optimization of binary image files.

**Some API endpoints**
* <img width="433" height="325" alt="image" src="https://github.com/user-attachments/assets/846b9572-c56a-45eb-a894-a7fa04e6b064" />
* <img width="328" height="113" alt="Screenshot 2026-01-07 191809" src="https://github.com/user-attachments/assets/941dcf6e-9d37-4b77-8a0c-5bac0e69e967" />


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
variables in the docker-compose.yml with your own database credentials in a .env file.

This project also uses Cloudinary for image storing. You need to make your own account and replace the credentials with your own
values.

To get a local copy up and running using docker, follow these steps. 

### Prerequisites

* Node.js & npm**
* Java 17 or higher
* Docker for PostgreSQL database

### Installation

1. Get your Cloudinary keys here [https://cloudinary.com/]. You can create a free account and then you need to find the cloud name, api key and secret.
2. Clone the repo
  ```sh
   git clone https://github.com/martinanajdovska/twt-clone.git
```
3. Run the Docker container
   * Create a .env file and set up your environment variables for the database following the .env.example template
   * Change the port number if needed in the docker-compose.yml and the application.properties in the backend
   * ```
     docker compose up
     ```
4. Backend
   * Inside the backend folder
   * Set up your environment variables for the database, Cloudinary keys and frontend communication url. You can see the variable names in the env.example file.
   * If you are using Intellij as IDE you can set the environment variables in the configuration then run the app through the IDE. If you are using something else, you need to set the variables through the terminal and then run the following command.
   ```
    ./mvnw spring-boot:run
   ```
6. Frontend
   * Inside the frontend folder
   * Set up the api url in a .env file, you can see the variable name used in the .env.example file
   * Install packages and run the app
     ```
      npm install
      npm run dev
     ```
   * You should be able to access the app on http://localhost:3000 
