# StorAI - HIPAA-Compliant Clinical Notes Summarizer

StorAI is a desktop application built with Tauri and React that helps therapists generate narrative summaries from clinical notes using local LLM processing.

## Setup and Installation

### Prerequisites

- Node.js (v18 or later)
- Rust (for Tauri development)
- LLM model file (optional, see the "LLM Model Setup" section below)

### Installation Steps

1. Clone the repository:
   ```
   git clone https://github.com/arnursabet/storai.git
   cd storai
   ```

2. Install dependencies:
   ```
   npm install
   ```

### Running the App

#### Desktop Mode (Tauri)

To run the app in development mode:
```
npm run tauri dev
```

To build for production:
```
npm run tauri build
```

#### Web Mode (Browser)

To run the app in web mode:
```
npm run dev:web
```

To build for web:
```
npm run build:web
```

### LLM Model Setup (Optional)

StorAI can utilize a local LLM model to generate summaries, but this setup is optional:

1. Download the Llama 2 7B model in GGUF format from [HuggingFace](https://huggingface.co/models)
2. Create a `models` directory in the app's data directory:
   - Windows: `%APPDATA%/com.storai.app/models/`
   - macOS: `~/Library/Application Support/com.storai.app/models/`
   - Linux: `~/.local/share/com.storai.app/models/`
3. Place the model file in this directory and rename it to `llama-2-7b-chat.gguf`

If you choose not to set up a local LLM, the application will still function with limited summarization capabilities.




