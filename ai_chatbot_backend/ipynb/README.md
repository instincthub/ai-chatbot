# RAG (Retrieval-Augmented Generation) Implementation

This directory contains a Jupyter notebook implementation of a RAG system for question-answering over PDF documents using OpenAI, LangChain, and Pinecone.

## Overview

The RAG implementation in `rag.ipynb` demonstrates how to:
- Load and process PDF documents
- Split documents into manageable chunks
- Generate embeddings for document chunks
- Store embeddings in a vector database (Pinecone)
- Retrieve relevant chunks based on user queries
- Generate contextual answers using an LLM

The example implementation analyzes government budget documents and can answer specific questions about budget allocations, such as agriculture credit targets.

## Technical Architecture

### Components

1. **Document Loader**: PyPDFDirectoryLoader for PDF processing
2. **Text Splitter**: RecursiveCharacterTextSplitter (chunk_size=800, overlap=50)
3. **Embeddings**: OpenAI embeddings (with HuggingFace as alternative)
4. **Vector Store**: Pinecone for similarity search
5. **LLM**: OpenAI text-davinci-003 for answer generation
6. **Orchestration**: LangChain for pipeline management

### Data Flow

```
PDF Documents → Text Extraction → Chunking → Embedding Generation → Vector Storage
                                                                           ↓
User Query → Query Embedding → Similarity Search → Relevant Chunks → LLM → Answer
```

## Setup Instructions

### 1. Environment Variables

Create a `.env` file with the following variables:

```env
OPENAI_API_KEY=your_openai_api_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_ENVIRONMENT=your_pinecone_environment
PINECONE_INDEX_NAME=your_index_name
```

### 2. Dependencies

Install required packages:

```bash
pip install openai langchain pinecone-client pypdf python-dotenv
```

### 3. Directory Structure

```
ipynb/
├── rag.ipynb          # Main RAG implementation
├── documents/         # Place PDF files here
│   └── budget_speech.pdf
└── README.md          # This file
```

## Code Walkthrough

### Document Loading

```python
def read_doc(directory):
    file_loader = PyPDFDirectoryLoader(directory)
    documents = file_loader.load()
    return documents
```
Loads all PDF files from the specified directory.

### Text Chunking

```python
def chunk_data(docs, chunk_size=800, chunk_overlap=50):
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap
    )
    doc = text_splitter.split_documents(docs)
    return doc
```
Splits documents into smaller chunks for efficient processing and retrieval.

### Vector Search

```python
def retrieve_query(query, k=2):
    matching_results = index.similarity_search(query, k=k)
    return matching_results
```
Retrieves the k most relevant document chunks based on cosine similarity.

### Question Answering

```python
def retrieve_answers(query):
    doc_search = retrieve_query(query)
    response = chain.run(input_documents=doc_search, question=query)
    return response
```
Combines retrieval and generation to answer questions based on document context.

## Usage Examples

### Basic Usage

```python
# Load and process documents
doc = read_doc('documents/')
documents = chunk_data(docs=doc)

# Create embeddings and index
embeddings = OpenAIEmbeddings(api_key=OPENAI_API_KEY)
index = Pinecone.from_documents(doc, embeddings, index_name=index_name)

# Ask questions
query = "How much the agriculture target will be increased by how many crore?"
answer = retrieve_answers(query)
print(answer)
```

### Example Output

Query: "How much the agriculture target will be increased by how many crore?"

Answer: The agriculture credit target will be increased to ₹20 lakh crore with focus on animal husbandry, dairy and fisheries.

## Integration with Django Backend

This RAG implementation can be integrated with the existing Django chatbot backend:

1. **Knowledge Base Service**: The `knowledge_base/services.py` contains placeholder methods that can be replaced with this implementation
2. **Document Model**: The `documents/models.py` Document model can store processed chunks
3. **Embedding Model**: The Embedding model can store vector representations
4. **Chat Integration**: The chat views can use RAG for context-aware responses

### Potential Integration Points

- `DocumentProcessor._extract_text()`: Use PyPDFDirectoryLoader
- `DocumentProcessor._chunk_text()`: Use RecursiveCharacterTextSplitter
- `DocumentProcessor._generate_embeddings()`: Use OpenAI embeddings
- `RAGQueryEngine.query()`: Implement vector similarity search
- `VectorStore`: Choose between Pinecone (cloud) or pgvector (self-hosted)

## Troubleshooting

### Common Issues

1. **RateLimitError**: Check OpenAI usage at https://platform.openai.com/account/usage
2. **API Key Issues**: Ensure environment variables are properly loaded
3. **Memory Issues**: Reduce chunk_size or process documents in batches

### Alternative Options

- **Free Embeddings**: Use HuggingFace models instead of OpenAI
  ```python
  from langchain.embeddings import HuggingFaceEmbeddings
  embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
  ```

- **Local Vector Store**: Use Chroma or FAISS instead of Pinecone for local development

## Future Improvements

1. **Multi-format Support**: Add support for DOCX, TXT, and other formats
2. **Metadata Filtering**: Filter results by document type, date, or tags
3. **Hybrid Search**: Combine vector search with keyword search
4. **Streaming Responses**: Implement streaming for real-time answers
5. **Caching**: Cache embeddings to reduce API calls
6. **Production Deployment**: Add error handling, logging, and monitoring