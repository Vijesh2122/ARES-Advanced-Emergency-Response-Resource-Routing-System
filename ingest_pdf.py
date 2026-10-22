"""Index a trusted, supplied PDF into ARES's shared persistent knowledge base."""
import argparse
import os

from rag import RagError, RagStore, SHARED_OWNER
from server import EMBEDDER


def main() -> int:
    parser = argparse.ArgumentParser(description="Index a PDF for all local ARES browser sessions.")
    parser.add_argument("pdf", help="Path to the supplied, digital-text PDF")
    parser.add_argument("--replace", action="store_true", help="Reserved for a future explicit replacement workflow")
    args = parser.parse_args()
    path = os.path.abspath(args.pdf)
    if not os.path.isfile(path):
        parser.error(f"PDF not found: {path}")
    if args.replace:
        print("--replace is unnecessary: the same file hash is not indexed twice.")
    with open(path, "rb") as source:
        document = RagStore(os.path.join(os.path.dirname(__file__), "data", "ares_rag.sqlite")).ingest(
            os.path.basename(path), source.read(), SHARED_OWNER, EMBEDDER, source_type="managed"
        )
    print(f"{document['status']}: {document['filename']} ({document['pages']} pages, {document['chunkCount']} chunks)")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except RagError as error:
        print(f"Indexing failed: {error}")
        raise SystemExit(2)
