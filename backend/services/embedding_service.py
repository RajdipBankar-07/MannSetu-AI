import os
import logging
import hashlib
import numpy as np
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("mannsetu.embedding")

model = None

def init_embedding_model():
    global model
    if model is not None:
        return model
    try:
        from sentence_transformers import SentenceTransformer
        logger.info("Initializing SentenceTransformer model (all-MiniLM-L6-v2)...")
        model = SentenceTransformer("all-MiniLM-L6-v2")
        logger.info("SentenceTransformer model loaded successfully.")
        return model
    except Exception as e:
        logger.warning(f"Could not load SentenceTransformer locally: {e}. Will use mock embeddings fallback.")
        return None

def generate_mock_embedding(text: str, dimension: int = 384) -> list:
    """
    Generates a deterministic vector based on text content hashing.
    """
    # Deterministic seed using hash of text
    hash_object = hashlib.md5(text.encode("utf-8"))
    seed = int(hash_object.hexdigest(), 16) % (2**32)
    np.random.seed(seed)
    # Generate random vector and normalize it
    vec = np.random.randn(dimension)
    norm = np.linalg.norm(vec)
    if norm > 0:
        vec = vec / norm
    return vec.tolist()

def get_embedding(text: str) -> list:
    """
    Returns a 384-dimensional embedding list of floats.
    """
    if not text.strip():
        return [0.0] * 384

    embedder = init_embedding_model()
    if embedder:
        try:
            vector = embedder.encode(text)
            return vector.tolist()
        except Exception as e:
            logger.error(f"SentenceTransformer encoding failed: {e}")
            
    # Fallback to deterministic mock embedding
    return generate_mock_embedding(text)

def cosine_similarity(v1: list, v2: list) -> float:
    """
    Compute cosine similarity between two vectors.
    """
    arr1 = np.array(v1)
    arr2 = np.array(v2)
    dot = np.dot(arr1, arr2)
    norm1 = np.linalg.norm(arr1)
    norm2 = np.linalg.norm(arr2)
    if norm1 > 0 and norm2 > 0:
        return float(dot / (norm1 * norm2))
    return 0.0
