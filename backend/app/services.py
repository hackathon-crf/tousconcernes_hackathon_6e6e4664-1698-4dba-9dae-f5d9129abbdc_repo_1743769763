from backend.app.back_utils import test
import requests
import os
import json
from dotenv import load_dotenv

load_dotenv()  # Load environment variables if using a .env file

# Replace default if needed
RAG_API_BASE_URL = os.getenv("RAG_API_BASE_URL", "YOUR_RAG_API_BASE_URL")
# Replace default if needed
API_KEY = os.getenv("MISTRAL_API_KEY", "YOUR_API_KEY")

# --- Helper Function to Handle RAG API Calls ---


def _call_rag_api(method: str, endpoint: str, params: dict = None, data: dict = None, files: dict = None) -> dict:
    """Generic function to call the RAG API and handle errors."""
    url = f"{RAG_API_BASE_URL}{endpoint}"
    headers = {"Accept": "application/json"}  # Common header

    try:
        if method.upper() == 'GET':
            response = requests.get(url, params=params, headers=headers)
        elif method.upper() == 'POST':
            # POST can have params, data (form), or files (multipart)
            response = requests.post(
                url, params=params, data=data, files=files, headers=headers)
        elif method.upper() == 'DELETE':
            response = requests.delete(url, params=params, headers=headers)
        else:
            raise ValueError(f"Unsupported HTTP method: {method}")

        response.raise_for_status()  # Raise HTTPError for bad responses (4xx or 5xx)
        return response.json()  # Return JSON response body

    except requests.exceptions.HTTPError as http_err:
        print(f"HTTP error occurred calling {url}: {http_err}")
        print(
            f"Response code: {http_err.response.status_code}, Content: {http_err.response.text}")
        raise  # Re-raise the exception to be handled by the caller
    except requests.exceptions.RequestException as req_err:
        print(f"Request error occurred calling {url}: {req_err}")
        raise
    except Exception as e:
        print(f"An unexpected error occurred calling {url}: {e}")
        raise

# --- Step 1 Example: Create a Collection ---


def create_rag_collection(collection_name: str):
    """Creates a new RAG collection."""
    print(f"Attempting to create collection: {collection_name}")
    return _call_rag_api(
        method='POST',
        endpoint='/api/app/collection/new',
        params={'name': collection_name}
    )

# --- Step 2 Example: Add a Document ---


def add_document_to_collection(collection_name: str, document_path: str, embedding_model: str = "mistral-embed"):
    """Adds a document file to a specified RAG collection."""
    print(
        f"Attempting to add document {document_path} to collection {collection_name}")
    try:
        with open(document_path, 'rb') as f:
            files = {'document': (os.path.basename(document_path), f)}
            data = {
                'collection_name': collection_name,
                'model': embedding_model,  # Ensure this model is supported/expected
                'api_key': API_KEY
                # Optional: Add 'chunk_size', 'chunk_overlap' here if needed
            }
            return _call_rag_api(
                method='POST',
                endpoint='/api/app/collection/add-document',
                files=files,
                data=data  # Use 'data' for form fields alongside 'files'
            )
    except FileNotFoundError:
        print(f"Error: Document file not found at '{document_path}'")
        raise
    except Exception as e:
        print(f"Error during document preparation or API call: {e}")
        raise

# --- Step 3 Example: Query the RAG System ---


def get_rag_answer(
    query: str,
    collection_name: str,
    llm_model_name: str = "mistral-small-latest",  # Or other suitable model
    prompt_template: str = "Use the following context to answer the question concisely.\nContext:\n{context}\n\nQuestion: {query}\n\nAnswer:",
    history: list = None  # Expecting a list of chat messages, will be JSON serialized
):
    """Gets an answer from the RAG system using specified documents."""
    print(f"Querying collection '{collection_name}' with query: '{query}'")

    # Ensure history is a JSON string as expected by the API
    history_data_str = json.dumps(history if history is not None else [])

    params = {
        "query": query,
        "model_family": "mistral",  # Adjust if using other LLM families
        "model_name": llm_model_name,
        "api_key": API_KEY,
        # This tells the RAG API how to structure the final LLM call
        "prompt": prompt_template,
        "collection_name": collection_name,
        "history_data": history_data_str
    }

    # This single API call handles retrieval, prompt augmentation, AND the final LLM call
    result = _call_rag_api(
        method='POST',
        endpoint='/api/app/inferencing/retrieve_answer_using_collections',
        params=params
    )
    # The result should contain the LLM's final answer, potentially along with source info
    # You might need to inspect the exact structure of 'result' (e.g., result['answer'])
    return result

# --- Example Usage (within a FastAPI route/service function) ---
# async def handle_user_query(user_input: str, team_collection: str):
#     try:
#         # 1. (Optional) Ensure collection exists or create it maybe? (Handled separately usually)
#         # 2. (Optional) Ensure documents are added? (Handled separately usually)
#
#         # 3. Get the answer using RAG
#         rag_response = get_rag_answer(
#             query=user_input,
#             collection_name=team_collection,
#             # Optionally pass history if maintaining chat context
#         )
#         print("RAG Response:", rag_response)
#         # Extract the actual answer text from the response structure
#         answer = rag_response.get("answer", "Sorry, I could not retrieve an answer.") # Adjust key based on actual response
#         return {"final_answer": answer}
#
#     except Exception as e:
#         print(f"Error handling user query with RAG: {e}")
#         # Consider raising HTTPException here for FastAPI
#         return {"error": "Failed to get RAG answer"}


def test_service():
    data = get_rag_answer(
        query="Que faire en cas de brulure ?", collection_name="Test")
    return data
