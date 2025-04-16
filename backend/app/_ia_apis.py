import requests
import json
import os
import logging
import traceback
logger = logging.getLogger(__name__)

RAG_API_BASE_URL = os.getenv("RAG_API_BASE_URL", "http://127.0.0.1")
CHATBOT_API_BASE_URL = os.getenv("CHATBOT_API_BASE_URL", "http://127.0.0.1")
API_KEY = os.getenv("MISTRAL_API_KEY", "--NO KEY--")

def log_step(step_number, step_name):
    """Print a formatted step header"""
    logger.info("\n" + "="*80)
    logger.info(f"STEP {step_number}: {step_name}")
    logger.info("="*80)

def log_json(data):
    """Print formatted JSON data"""
    logger.info(json.dumps(data, indent=2))

def get_embeddings(query, 
                   collection_name, 
                   url=f"{RAG_API_BASE_URL}/inferencing/get_embeddings", 
                   api_key=API_KEY) -> any | None:
    """
    Get embeddings for a query using the specified collection.

    Args:
        query (str): The query text to get embeddings for
        collection_name (str): The name of the collection to use

    Returns:
        The embeddings response
    """
    log_step(2, "Getting Embeddings for Query")
    try:
        # Ensure collection is properly formatted
        if isinstance(collection_name, list):
            collection_name = collection_name[0] if collection_name else ""

        # Clean up the collection name
        collection_name = str(collection_name).strip().strip('"\'[]')

        # Set up the parameters
        params = {
            "query": query,
            "collection_name": collection_name,
            "api_key": api_key
        }

        logger.info(f"Calling: {url}")
        logger.info("Parameters:")
        log_json({k: v if k != "api_key" else "****" for k, v in params.items()})

        # Make the request
        response = requests.post(url, params=params)

        logger.info(f"Status Code: {response.status_code}")

        if response.status_code != 200:
            logger.info(f"Error: {response.status_code}")
            logger.info(f"Response: {response.text}")
            return None

        # Try to parse as JSON
        try:
            result = response.json()
            logger.info("\nEmbeddings Response:")

            # Check if the result is a string containing a large embedding vector
            if isinstance(result, str) and len(result) > 1000:
                # If it's a very long string (likely an embedding vector), just show a preview
                logger.info(f"Received embedding vector (showing first 100 chars): {result[:100]}...")
                logger.info(f"Full vector length: {len(result)} characters")
            else:
                log_json(result)

            return result
        except json.JSONDecodeError:
            # If it's not JSON, just return the text
            logger.info("\nResponse (text):")
            logger.info(response.text[:500] + "..." if len(response.text) > 500 else response.text)
            return response.text

    except Exception as e:
        logger.error(f"Error getting embeddings: {str(e)}")
        logger.error(traceback.format_exc())
        return None



def get_translated_parameters(lang: str) -> dict:
    if 'fr' == lang:
        return {
            'system_prompt': "Vous êtes un assistant expert qui utilise les intégrations sémantiques pour fournir des informations pertinentes."
                              + "Utilisez le contexte fourni pour répondre à la requête de l'utilisateur."
                              + "Fournissez une réponse claire et concise basée sur le sens capturé par les intégrations.",
            'Additional context': "Contexte additionnel",
            'Query': 'Requête',
            'Embedding context': "Contexte intégré"
        }
    else:
        return {
            'system_prompt': "You are an expert assistant that uses semantic embeddings to provide relevant information."
                              + "Use the provided embeddings as context to answer the user's query."
                              + "Provide a clear and concise response based on the semantic meaning captured by the embeddings.",
            'Additional context': "Additional context",
            'Query': 'Query',
            'Embedding context': 'Embedding context'
        }

#TODO: english/french
def query_llm_with_embeddings(query, 
                              embeddings, 
                              context=None, 
                              mistral_api_url="https://api.mistral.ai/v1/chat/completions",
                              api_key=API_KEY,
                              tl = get_translated_parameters('en')) -> str | None:
    """
    Send a query to the Mistral LLM along with embeddings for context.

    Args:
        query (str): The user's query
        embeddings: The embeddings from the get_embeddings function
        context (dict, optional): Additional context for the query

    Returns:
        The LLM response
    """
    log_step(2, "Querying LLM with Embeddings")
    try:

        # Format embeddings for inclusion in the prompt
        embeddings_text = str(embeddings)
        if len(embeddings_text) > 1000:
            embeddings_text = f"[Embedding vector with {len(embeddings_text)} characters]"

        # Create user prompt with embeddings
        user_prompt = f"""
        {tl['Query']}: {query}

        {tl['Embedding context']}: {embeddings_text}
        """

        if context:
            user_prompt += f"\n{tl['Additional context']}: {json.dumps(context)}"

        logger.info("User Prompt:")
        logger.info(user_prompt[:200] + "..." if len(user_prompt) > 200 else user_prompt)

        # Prepare Mistral API request
        mistral_headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        }

        mistral_data = {
            "model": "mistral-large-latest",
            "max_tokens": 800,
            "messages": [
                {"role": "system", "content": tl['system_prompt']},
                {"role": "user", "content": user_prompt}
            ]
        }

        logger.info("\nSending request to Mistral API...")

        # Make the request to Mistral API
        mistral_response = requests.post(
            mistral_api_url,
            headers=mistral_headers,
            json=mistral_data
        )

        if mistral_response.status_code != 200:
            logger.info(f"Mistral API call failed with status code: {mistral_response.status_code}")
            logger.info(f"Response: {mistral_response.text}")
            return None

        mistral_result = mistral_response.json()

        # Extract the content from the Mistral response
        llm_text = mistral_result.get('choices', [{}])[0].get('message', {}).get('content', '')

        logger.info("\nMistral Response:")
        logger.info(llm_text[:500] + "..." if len(llm_text) > 500 else llm_text)

        return llm_text

    except Exception as e:
        logger.error(f"Error querying LLM: {str(e)}")
        logger.error(traceback.format_exc())
        return None


def query_llm_with_knowledge(query: str, collection_name: str) -> str | None:
    "return augmented answer from query + collection_name"
    embeddings = get_embeddings(query, collection_name) #TODO: check correct parameters
    if embeddings is None:
        return None
    return query_llm_with_embeddings(query, embeddings) #TODO: check correct parameters
