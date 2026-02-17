# Support Ticket System (AI-Powered)

An intelligent, full-stack support ticket management system that leverages Large Language Models (LLMs) to automate ticket categorization and priority assessment.

## 🚀 Setup & Installation

Follow these steps to get the entire system running locally using Docker:

### 1. Clone the repository
Ensure you include the `.git` directory in your local environment.

### 2. Configure Environment Variables
Create a `.env` file in the root directory and add your credentials:

```env
DB_NAME=support_db
DB_USER=postgres
DB_PASSWORD=postgres_pass
LLM_API_KEY=your_groq_api_key_here
````

> **Note:** The `LLM_API_KEY` is required for the auto-classification feature.

### 3. Run with Docker Compose

```bash
docker-compose up --build
```

### 4. Access the App

* **Frontend:** [http://localhost:3000](http://localhost:3000)
* **Backend API:** [http://localhost:8000/api/tickets/](http://localhost:8000/api/tickets/)


## 🧠 LLM Integration

**Choice of LLM:** Groq (Llama 3.1 8B Instant)

I chose **Groq** with the **Llama 3.1 8B Instant** model because:

* **Inference Speed:** Groq's LPU architecture provides near-instant responses, which is critical for the "on-blur" auto-suggestion UX in the frontend.
* **Accuracy:** Llama 3.1 reliably follows structured JSON instructions, ensuring the backend receives consistent `suggested_category` and `suggested_priority` values.

### How it Works

When a user finishes entering a description, the system triggers a request to the `/api/tickets/classify/` endpoint.
The LLM analyzes the text and suggests tags, which the user can then review or override before submission.

---

## 🛠️ Technical Design Decisions

### Backend (Django & DRF)

* **Database-Level Aggregation:**
  The stats endpoint (`/api/tickets/stats/`) uses Django's `aggregate` and `annotate` functions so PostgreSQL performs totals, averages, and breakdowns efficiently at scale.
* **Enforced Integrity:**
  All constraints (character limits and choice fields) are enforced at the database level to ensure consistency.

### Frontend (React & Tailwind CSS v4)

* **Real-time Feedback:**
  AI classification triggers on the input blur event for a non-intrusive experience.
* **Responsive Dashboard:**
  A dynamic stats dashboard auto-refreshes whenever new tickets are submitted.

### Infrastructure (Docker)

* **Containerization:**
  Dedicated Dockerfiles for frontend and backend managed via Docker Compose.
* **Auto-Migrations:**
  Backend entrypoint automatically runs database migrations on startup.

---

## 📈 API Endpoints Summary

| Method | Endpoint                 | Description                                           |
| ------ | ------------------------ | ----------------------------------------------------- |
| GET    | `/api/tickets/`          | List all tickets (newest first) with filtering/search |
| POST   | `/api/tickets/`          | Submit a new support ticket                           |
| POST   | `/api/tickets/classify/` | Get AI-suggested category/priority                    |
| GET    | `/api/tickets/stats/`    | Fetch aggregated performance metrics                  |

