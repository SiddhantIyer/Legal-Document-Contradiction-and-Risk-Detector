import json
import os
import faiss
import numpy as np
import logging
from sentence_transformers import SentenceTransformer

logger = logging.getLogger(__name__)

class LegalRAGRetriever:
    """
    Retrieval-Augmented Generation (RAG) system for Legal Knowledge.
    Uses FAISS and Sentence-BERT to retrieve relevant legal statutes.
    """
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(LegalRAGRetriever, cls).__new__(cls)
            cls._instance.initialized = False
        return cls._instance

    def initialize(self):
        if self.initialized:
            return
            
        logger.info("Initializing Legal RAG Retriever...")
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        self.kb_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "legal_kb.json")
        self.knowledge_base = []
        
        try:
            with open(self.kb_path, 'r', encoding='utf-8') as f:
                self.knowledge_base = json.load(f)
        except Exception as e:
            logger.error(f"Failed to load legal_kb.json: {e}")
            self.knowledge_base = []
            
        if not self.knowledge_base:
            self.index = None
            self.initialized = True
            return
            
        # Create embeddings for all legal texts
        texts = [f"{item['title']} - {item['text']}" for item in self.knowledge_base]
        embeddings = self.model.encode(texts, convert_to_numpy=True)
        
        # Normalize for cosine similarity
        faiss.normalize_L2(embeddings)
        
        # Build FAISS index
        dimension = embeddings.shape[1]
        self.index = faiss.IndexFlatIP(dimension) # Inner product = Cosine similarity for normalized vectors
        self.index.add(embeddings)
        
        self.initialized = True
        logger.info(f"Loaded {len(self.knowledge_base)} laws into FAISS RAG index.")

    def search(self, query: str, top_k: int = 2) -> list[dict]:
        """
        Search the knowledge base for the most relevant laws.
        """
        if not self.initialized:
            self.initialize()
            
        if not self.index or not self.knowledge_base:
            return []
            
        # Encode query
        query_emb = self.model.encode([query], convert_to_numpy=True)
        faiss.normalize_L2(query_emb)
        
        # Search
        distances, indices = self.index.search(query_emb, top_k)
        
        results = []
        for i, idx in enumerate(indices[0]):
            if 0 <= idx < len(self.knowledge_base) and distances[0][i] > 0.3: # Threshold
                results.append(self.knowledge_base[idx])
                
        return results

# Global singleton
rag_retriever = LegalRAGRetriever()
