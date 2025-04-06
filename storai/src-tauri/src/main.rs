// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use dirs;
// Import the llama-cpp-2 crate
// use llama_cpp_2::{
//     options::{ModelOptions, PredictOptions},
//     LLama,
// };
use std::path::Path;
use std::sync::Mutex;
use tauri::State;
use tauri_plugin_dialog::init as init_dialog;
use tauri_plugin_fs::init as init_fs;
use tauri_plugin_shell::init as init_shell;

// LLM context structure - simulation only
struct LlmContext {
    initialized: bool,
    model_path: String,
}

impl LlmContext {
    fn new() -> Self {
        Self {
            initialized: false,
            model_path: String::new(),
        }
    }
}

struct AppState {
    llm: Mutex<LlmContext>,
}

// Initialize the LLM model
// This function currently validates the provided model path but uses simulation mode
// When integrating a real LLM, this function would load the model into memory
#[tauri::command]
fn initialize_llm(state: State<AppState>, model_path: String) -> Result<(), String> {
    println!(
        "Attempting to initialize LLM with model path: {}",
        model_path
    );

    // Validate the model path
    let path = Path::new(&model_path);
    if !path.exists() {
        return Err(format!("Model file not found at: {}", model_path));
    }

    // Verify it's a file and has reasonable size
    match std::fs::metadata(&path) {
        Ok(metadata) => {
            if !metadata.is_file() {
                return Err(format!("Path exists but is not a file: {}", model_path));
            }

            // Check file size (empty files should be rejected)
            if metadata.len() == 0 {
                return Err(format!("Model file is empty: {}", model_path));
            }

            // Log a warning for small files (might not be real models)
            if metadata.len() < 1_000_000 {
                println!(
                    "WARNING: File is very small for an LLM model ({}bytes)",
                    metadata.len()
                );
            }
        }
        Err(e) => {
            return Err(format!(
                "Error accessing file metadata: {} - Error: {}",
                model_path, e
            ));
        }
    }

    // Actual LLM loading would happen here, but for now we just use simulation
    // --------------------------------------------------------------------
    // INTEGRATION POINT: Real LLM loading would look something like this:
    //
    // For llama-cpp-rs:
    // use llama_cpp_rs::{LlamaParams, Llama};
    // let params = LlamaParams::default()
    //     .with_n_ctx(2048)         // Context window size
    //     .with_seed(42)            // For reproducibility
    //     .with_f16_kv(true);       // Use f16 for key-value cache
    //
    // let llama = match Llama::new(&model_path, &params) {
    //     Ok(model) => model,
    //     Err(e) => return Err(format!("Failed to load model: {}", e)),
    // };
    //
    // For llama-cpp-2:
    // use llama_cpp_2::{options::ModelOptions, LLama};
    // let model_options = ModelOptions::default()
    //     .with_context_size(2048)  // Context size
    //     .with_gpu_layers(0);      // CPU only for now
    //
    // let model = match LLama::new(&model_path, &model_options) {
    //     Ok(model) => model,
    //     Err(e) => return Err(format!("Failed to load model: {}", e)),
    // };
    // --------------------------------------------------------------------

    println!("SIMULATE: LLM model validation successful (simulation mode)");

    // Update the app state with the new model path
    match state.llm.lock() {
        Ok(mut llm) => {
            llm.initialized = true;
            llm.model_path = model_path.clone();
            println!("LLM context initialized successfully in simulation mode");
        }
        Err(e) => {
            return Err(format!("Failed to acquire lock on LLM context: {}", e));
        }
    }

    println!(
        "LLM model initialized successfully with path: {}",
        model_path
    );
    Ok(())
}

// Run LLM inference
// This function currently returns simulated responses based on the prompt content
// When integrating a real LLM, this would pass the prompt to the model and return real responses
#[tauri::command]
fn run_llm_inference(state: State<AppState>, prompt: String) -> Result<String, String> {
    // Check if initialized
    let llm = match state.llm.lock() {
        Ok(guard) => guard,
        Err(e) => {
            return Err(format!("Failed to acquire lock on LLM state: {}", e));
        }
    };

    if !llm.initialized {
        return Err("LLM model not initialized. Call initialize_llm first.".to_string());
    }

    println!(
        "Running inference with prompt: {} (length: {})",
        if prompt.len() > 100 {
            format!("{}...", &prompt[..100])
        } else {
            prompt.clone()
        },
        prompt.len()
    );

    // Actual LLM inference would happen here, but for now we use simulation
    // --------------------------------------------------------------------
    // INTEGRATION POINT: Real LLM inference would look something like this:
    //
    // For llama-cpp-rs:
    // use llama_cpp_rs::InferenceParams;
    // let params = InferenceParams::default()
    //     .with_temperature(0.7)
    //     .with_top_p(0.9)
    //     .with_max_tokens(1024);
    //
    // match llama.inference(&prompt, params) {
    //     Ok(response) => Ok(response),
    //     Err(e) => Err(format!("Failed to generate text: {}", e)),
    // }
    //
    // For llama-cpp-2:
    // use llama_cpp_2::options::PredictOptions;
    // let predict_options = PredictOptions::default()
    //     .with_temperature(0.7)
    //     .with_top_p(0.9)
    //     .with_max_tokens(1024);
    //
    // match model.predict(&prompt, &predict_options) {
    //     Ok(response) => Ok(response),
    //     Err(e) => Err(format!("Failed to generate text: {}", e)),
    // }
    // --------------------------------------------------------------------

    println!("SIMULATE: Using simulated LLM response (simulation mode)");
    let response = simulate_llm_response(&prompt);

    println!(
        "Simulation generated response of length: {}",
        response.len()
    );
    Ok(response)
}

// Simulate LLM response based on prompt content
// This function returns pre-written responses based on the prompt content
// When integrating a real LLM, this function would be removed
fn simulate_llm_response(prompt: &str) -> String {
    if prompt.contains("SOAP") {
        return "Subjective: Patient reports increased anxiety over the past two weeks with episodes of shortness of breath, racing heart, and difficulty concentrating. Patient is sleeping 5-6 hours per night, down from usual 7-8 hours. Anxiety is related to upcoming job interview and financial concerns. No changes in medication or physical health reported.\n\nObjective: Patient appears mildly agitated but well-groomed. Speech is rapid but coherent. Patient demonstrates good insight into anxiety triggers. Breathing is slightly elevated. No signs of acute distress.\n\nAssessment: Patient is experiencing moderate generalized anxiety related to specific upcoming stressors. Good candidate for cognitive-behavioral techniques and breathing exercises. No indication of panic disorder or more severe anxiety condition at this time.\n\nPlan: Will continue weekly sessions. Introduced breathing techniques and cognitive reframing during session. Patient will practice mindfulness techniques daily. Will introduce additional coping strategies at next appointment.".to_string();
    } else if prompt.contains("PIRP") {
        return "Problem: Patient presents with increased anxiety manifesting as shortness of breath, racing heart, and difficulty concentrating. Sleep has decreased to 5-6 hours nightly. Specific stressors include upcoming job interview and financial concerns.\n\nIntervention: Discussed cognitive-behavioral approach to anxiety management. Introduced diaphragmatic breathing techniques and demonstrated grounding exercises during session. Explored cognitive distortions related to job interview expectations.\n\nResponse: Patient engaged actively with breathing exercises, showing observable reduction in physical tension by end of demonstration. Verbalized understanding of cognitive reframing concepts and identified two specific thought patterns to work on.\n\nPlan: Weekly sessions to continue. Patient will practice mindfulness techniques daily and log anxiety episodes with associated thoughts. Next session will focus on expanding coping skill repertoire and reviewing results of homework.".to_string();
    } else {
        return "The patient reported symptoms of anxiety including shortness of breath and racing heart. They identified stressors related to job searching and finances. We discussed several coping strategies including breathing techniques and cognitive reframing. The patient will practice these skills before our next appointment.".to_string();
    }
}

#[tauri::command]
fn get_download_dir() -> String {
    match dirs::download_dir() {
        Some(path) => path.to_string_lossy().to_string(),
        None => String::new(),
    }
}

// Comment out the get_uploaded_files command since we're using a mock implementation
// #[tauri::command]
// async fn get_uploaded_files() -> Result<Vec<UploadedFile>, String> {
//     let app_dir = dirs::data_dir()
//         .ok_or_else(|| "Failed to get data directory".to_string())?
//         .join("com.storai.dev"); // Use your app's identifier
//
//     let uploads_dir = app_dir.join("uploads");
//
//     // Check if the directory exists
//     if !uploads_dir.exists() {
//         return Ok(Vec::new());
//     }
//
//     // Read the directory entries
//     let entries = std::fs::read_dir(&uploads_dir)
//         .map_err(|e| format!("Failed to read uploads directory: {}", e))?;
//
//     let mut files = Vec::new();
//
//     // Process each entry
//     for entry in entries {
//         let entry = entry.map_err(|e| format!("Failed to read directory entry: {}", e))?;
//         let path = entry.path();
//
//         // Skip directories
//         if path.is_dir() {
//             continue;
//         }
//
//         let metadata = std::fs::metadata(&path)
//             .map_err(|e| format!("Failed to get file metadata: {}", e))?;
//
//         // Get the filename
//         let filename = path.file_name()
//             .and_then(|name| name.to_str())
//             .ok_or_else(|| "Failed to get filename".to_string())?
//             .to_string();
//
//         // Parse the ID and original filename
//         let parts: Vec<&str> = filename.splitn(2, '_').collect();
//         let (id, name) = if parts.len() == 2 {
//             (parts[0].to_string(), parts[1].to_string())
//         } else {
//             (String::new(), filename.clone())
//         };
//
//         // Add to the list
//         files.push(UploadedFile {
//             id,
//             name,
//             path: path.to_string_lossy().to_string(),
//             size: metadata.len(),
//             created_at: metadata.created()
//                 .ok()
//                 .and_then(|time| time.duration_since(std::time::UNIX_EPOCH).ok())
//                 .map(|duration| duration.as_secs())
//                 .unwrap_or(0),
//         });
//     }
//
//     Ok(files)
// }
//
// #[derive(serde::Serialize)]
// struct UploadedFile {
//     id: String,
//     name: String,
//     path: String,
//     size: u64,
//     created_at: u64,
// }

#[derive(serde::Serialize, serde::Deserialize, Debug)]
struct FileEntry {
    name: String,
    path: String,
    is_dir: bool,
}

#[tauri::command]
fn read_dir(dir: String) -> Result<Vec<FileEntry>, String> {
    let path = Path::new(&dir);
    if !path.exists() {
        return Err(format!("Directory does not exist: {}", dir));
    }
    if !path.is_dir() {
        return Err(format!("Path is not a directory: {}", dir));
    }

    let entries = match std::fs::read_dir(path) {
        Ok(entries) => entries,
        Err(e) => return Err(format!("Failed to read directory: {}", e)),
    };

    let mut result = Vec::new();
    for entry in entries {
        match entry {
            Ok(entry) => {
                let path = entry.path();
                let name = match path.file_name() {
                    Some(name) => name.to_string_lossy().to_string(),
                    None => continue,
                };
                let path_str = path.to_string_lossy().to_string();
                let is_dir = path.is_dir();
                result.push(FileEntry {
                    name,
                    path: path_str,
                    is_dir,
                });
            }
            Err(e) => {
                println!("Error reading directory entry: {}", e);
            }
        }
    }

    Ok(result)
}

#[tauri::command]
fn create_dir_all(dir: String) -> Result<(), String> {
    match std::fs::create_dir_all(dir) {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Failed to create directory: {}", e)),
    }
}

fn main() {
    tauri::Builder::default()
        .manage(AppState {
            llm: Mutex::new(LlmContext::new()),
        })
        .plugin(init_fs())
        .plugin(init_dialog())
        .plugin(init_shell())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            initialize_llm,
            run_llm_inference,
            get_download_dir,
            read_dir,
            create_dir_all,
            // Remove get_uploaded_files from the list of handlers
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
