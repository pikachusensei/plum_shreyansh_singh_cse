# AI-Powered Appointment Scheduler

This is a backend service built for Plum's hiring assignment (Problem Statement 5). It parses natural language appointment requests from both text and images (including handwriting) and converts them into structured JSON data.

## Architecture

The service is built with **Node.js** and the **Express.js** framework. It uses a robust pipeline to process requests:

1.  **API Server:** An **Express.js** server receives requests and handles file uploads using **Multer**.
2.  **OCR Engine:** For image inputs, the service uses **Google Cloud Vision AI**. This powerful, cloud-based engine was chosen for its high accuracy in reading both printed and handwritten text, fully satisfying the "noisy image inputs" requirement.
3.  **Parsing & Normalization:** For the core NLP task of understanding dates and times, the service uses **chrono-node**. This specialized library was chosen for its speed and precision in parsing temporal expressions.
4.  **Dynamic Entity Extraction:** A custom `DepartmentMapper` class dynamically identifies and standardizes department names from the text, learning new departments as they appear.
5.  **Timezone Handling:** The API dynamically formats the output time based on a `user_timezone` field provided in the request, with a sensible default.
6.  **Guardrails:** The pipeline includes guardrails to return a `needs_clarification` status if a valid date or department cannot be determined from the input.

## Setup Instructions

1.  Clone the repository:
    `git clone https://github.com/pikachusensei/plum_shreyansh_singh_cse.git`
2.  Navigate to the project directory:
    `cd plum`
3.  Install dependencies:
    `npm install`
4.  Create a Google Cloud Service Account key file and place it in the root of the project with the name `gcloud-credentials.json`.
5.  Start the server:
    `npm start`

The server will be running at `http://localhost:3000`.

## API Usage Examples

The service exposes a single endpoint: `POST /api/schedule`

### 1. Schedule via Text

**Request:**
```bash
curl -X POST -H "Content-Type: application/json" \
-d '{"text": "Book a dentist for next friday at 3pm", "user_timezone": "America/New_York"}' \
https://unblossomed-subapparent-aiden.ngrok-free.dev/api/schedule
```
**Response:**
```json
{
  "appointment": {
    "department": "Dentistry",
    "date": "2025-10-17",
    "time": "15:00",
    "tz": "America/New_York"
  },
  "status": "ok"
}
```

### 2. Schedule via Handwritten Image

Create an image file (`note.png`) with handwritten text like "Schedule heart appointment on Friday 3pm".

**Request:**
```bash
curl -X POST -F "image=@note.jpg" https://unblossomed-subapparent-aiden.ngrok-free.dev/api/schedule
```
**Response:**
```json
{
  "appointment": {
    "department": "Cardiology",
    "date": "2025-10-17",
    "time": "15:00",
    "tz": "Asia/Kolkata"
  },
  "status": "ok"
}
```
