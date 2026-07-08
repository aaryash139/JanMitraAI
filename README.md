# JanMitra AI (Constituency Engine)

JanMitra AI is an intelligent, AI-driven constituency management platform designed to bridge the gap between citizens and their elected representatives (MPs/MLAs). It provides a seamless platform for grievance redressal, real-time insights, and data-driven decision making.

## 🌟 Key Features

### For Citizens
* **Citizen Portal (Jan Sunwai):** An intuitive interface for citizens to voice their concerns, lodge complaints, and track their resolution status.
* **Multilingual Support:** Reach a broader demographic with built-in language translations.
* **Speech-to-Text Support:** Accessibility-first design allowing citizens to record complaints via voice.

### For Administrators / MPs
* **MP Dashboard:** A comprehensive analytical dashboard offering a bird's-eye view of constituency health, mapped across different wards.
* **AI-Powered Insights:** Utilizes Gemini AI to automatically classify complaints, calculate impact scores, and provide actionable summaries.
* **Automated Routing & Clustering:** Intelligently groups similar complaints and routes them to the correct administrative department.
* **Data.gov.in Integration:** Fetches external public datasets to correlate citizen complaints with existing government schemes and data.

## 🛠 Tech Stack

**Frontend:**
* React 18
* Vite
* React Router DOM
* Tailwind CSS / Custom CSS
* Recharts (for Data Visualization)
* React-Leaflet (for Ward Mapping)

**Backend:**
* Java 21
* Spring Boot 3.x
* Spring Data JPA
* Spring Security & JWT Authentication
* PostgreSQL Database

**AI & External Integrations:**
* Google Gemini AI API (Classification, Impact Scoring, Semantic Analysis)
* Speech-to-Text API

## 🚀 Live Demo
* **Frontend (User Interface):** Deploy on Vercel (`https://your-vercel-link.vercel.app`)
* **Backend (API):** Deploy on Render
* **Database:** Neon.tech (Serverless PostgreSQL)

## 💻 Local Development Setup

### Prerequisites
* Java 21 JDK
* Node.js (v18+)
* PostgreSQL installed locally (or a cloud instance)

### 1. Database Setup
Ensure PostgreSQL is running locally on port `5432`. Create a database named `postgres` with the username `postgres` and password `1395` (or update the `application.properties` with your own credentials).

### 2. Backend Setup
Navigate to the backend directory and run the Spring Boot application using Gradle:
```bash
cd backend
./gradlew bootRun
```
The backend will start on `http://localhost:8080`.

### 3. Frontend Setup
Navigate to the frontend directory, install dependencies, and start the Vite dev server:
```bash
cd frontend
npm install
npm run dev
```
The frontend will start on `http://localhost:5173`.

## 📦 Deployment (CI/CD)
The project is configured for seamless deployment:
1. **Dockerfile** is included in the `backend` directory for deploying the Spring Boot application to container services like Render or Koyeb.
2. The **React Frontend** reads the backend API URL dynamically using the `VITE_API_URL` environment variable, making it ready for Vercel/Netlify deployments.

## 🛡 License
This project is proprietary and developed for prototyping and demonstration purposes.
