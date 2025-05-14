from celery import shared_task
from knowledge_base.services import DocumentProcessor

@shared_task
def process_document(document_id):
    """Process a document asynchronously."""
    processor = DocumentProcessor(document_id)
    processor.process()
    return f"Document {document_id} processed successfully" 