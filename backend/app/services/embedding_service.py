import logging
import hashlib
import numpy as np

logger = logging.getLogger("mannsetu.embedding")

model = None

def init_embedding_model():
    """
    Initializes and loads the SentenceTransformer model once on startup.
    """
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
        logger.warning(f"Could not load SentenceTransformer locally: {e}. Running in mock embeddings mode.")
        return None

def generate_mock_embedding(text: str, dimension: int = 384) -> list:
    hash_object = hashlib.md5(text.encode("utf-8"))
    seed = int(hash_object.hexdigest(), 16) % (2**32)
    np.random.seed(seed)
    vec = np.random.randn(dimension)
    norm = np.linalg.norm(vec)
    if norm > 0:
        vec = vec / norm
    return vec.tolist()

def get_embedding(text: str) -> list:
    if not text.strip():
        return [0.0] * 384

    if model is not None:
        try:
            vector = model.encode(text)
            return vector.tolist()
        except Exception as e:
            logger.error(f"SentenceTransformer encoding failed: {e}")
            
    return generate_mock_embedding(text)

def cosine_similarity(v1: list, v2: list) -> float:
    arr1 = np.array(v1)
    arr2 = np.array(v2)
    dot = np.dot(arr1, arr2)
    norm1 = np.linalg.norm(arr1)
    norm2 = np.linalg.norm(arr2)
    if norm1 > 0 and norm2 > 0:
        return float(dot / (norm1 * norm2))
    return 0.0
