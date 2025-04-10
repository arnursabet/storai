# StorAI - HIPAA-Compliant Clinical Notes Summarizer

StorAI is a desktop/web application built with Tauri and React that helps therapists generate narrative summaries from clinical notes using local/external LLM processing.

## Setup and Installation

### Prerequisites

- Node.js (v18 or later)
- Rust (for Tauri development)
- External LLM API

### Installation Steps

1. Clone the repository:
   ```
   git clone https://github.com/arnursabet/storai.git
   cd storai/storai
   ```

2. Install dependencies:
   ```
   npm install
   ```

### Running the App

#### Environment variables

```
cd storai/storai

touch .env
```
Add the following to `.env` file:
```
VITE_OPENAI_API_KEY=`your_key`
```
<!-- #### Desktop Mode (Tauri)

To run the app in development mode:
```
npm run tauri dev
```

To build for production:
```
npm run tauri build
``` -->

#### Web Mode (Browser)

To run the app in web mode:
```
npm run dev:web
```


