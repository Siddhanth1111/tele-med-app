# 🏥 AI-Powered Telemedicine Platform

![Project Status](https://img.shields.io/badge/Status-Live-success)
![Docker](https://img.shields.io/badge/Docker-Enabled-blue)
![AWS](https://img.shields.io/badge/Deployed%20on-AWS-orange)

> A robust full-stack healthcare platform featuring real-time video consultations, AI-driven symptom analysis, and secure prescription management.

🔗 **Live Demo:** [http://13.48.1.146:5173/](https://telemed.sid-chauhan.dev/)

---

## 🚀 Key Features

* **🎥 Real-Time Video Consultations:** Stable 1-on-1 video calls using **WebRTC** and **Socket.io** with custom connection recovery logic.
* **🤖 AI Symptom Checker:** Integrated **Python microservice** powered by **Google Gemini AI** to provide preliminary triage and symptom analysis.
* **💊 Digital Prescriptions:** Doctors can generate and send digital prescriptions instantly (stored securely via **PostgreSQL** & **Prisma**).
* **☁️ Microservices Architecture:** Fully containerized backend (Node.js API + Python AI Service) orchestrated via **Docker Compose**.
* **🔐 Role-Based Access:** Distinct portals for Patients and Doctors with secure authentication.

---

## 🛠️ Tech Stack

### **Frontend**
* **React.js (Vite)** - Fast, modern UI.
* **TypeScript** - Type safety and scalability.
* **Tailwind CSS** - Responsive styling.

### **Backend**
* **Node.js & Express** - Main API Gateway and business logic.
Dedicated AI microservice.
* **Socket.io** - Real-time signaling for calls.

### **Database & DevOps**
* **PostgreSQL** - Relational database.
* **Prisma ORM** - Database schema management.
* **Docker & Docker Compose** - Containerization.
* **AWS EC2** - Cloud deployment (Linux/Ubuntu).

---

## 🏗️ Architecture

The application follows a **Microservices** pattern:

1.  **Client Container:** React frontend served via Nginx/Vite.
2.  **Server Container:** Node.js Express API for users, appointments, and signaling.
3.  **AI Service Container:** Python Flask app handling Gemini AI requests.
4.  **Database:** PostgreSQL container with persistent volumes.

---

