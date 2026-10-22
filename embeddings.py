"""Embedding backends used by ARES.

The default backend intentionally has no native or model-download dependency, so
it runs on CPython 3.14 on Windows.  It is a signed hashing word/character
embedding: lightweight, deterministic and useful for local document retrieval.
Set ARES_EMBEDDING_BACKEND=openai to retain the optional remote provider.
"""
from __future__ import annotations

import hashlib
import math
import os
import re
from typing import Callable

TOKEN_RE = re.compile(r"[a-z0-9]{2,}")


class LocalHashEmbedder:
    """A cached-free, normalized local embedding suitable for modest PDF indexes."""

    model_name = "ares-local-hash-v1"
    dimension = 768
    backend = "local"

    def __call__(self, texts: list[str]) -> list[list[float]]:
        return [self._embed(text) for text in texts]

    def _embed(self, text: str) -> list[float]:
        vector = [0.0] * self.dimension
        tokens = TOKEN_RE.findall(text.lower())
        # Words carry meaning; character trigrams give modest resilience to forms.
        features = tokens + [token[index:index + 3] for token in tokens for index in range(max(0, len(token) - 2))]
        for feature in features:
            digest = hashlib.blake2b(feature.encode("utf-8"), digest_size=8).digest()
            number = int.from_bytes(digest, "big")
            index = number % self.dimension
            vector[index] += -1.0 if number & (1 << 63) else 1.0
        length = math.sqrt(sum(value * value for value in vector))
        return [value / length for value in vector] if length else vector


def embedding_profile(embed: Callable[[list[str]], list[list[float]]], sample: list[float] | None = None) -> tuple[str, int]:
    """Return a stable model identifier and vector dimension for index checks."""
    model = str(getattr(embed, "model_name", "custom-embedding"))[:200]
    dimension = getattr(embed, "dimension", None)
    if not isinstance(dimension, int) or dimension < 1:
        dimension = len(sample or [])
    if dimension < 1:
        raise ValueError("Embedding provider returned an empty vector.")
    return model, dimension


def configured_embedder(openai_embed: Callable[[list[str]], list[list[float]]]) -> Callable[[list[str]], list[list[float]]]:
    backend = os.getenv("ARES_EMBEDDING_BACKEND", "local").strip().lower()
    if backend == "local":
        return LocalHashEmbedder()
    if backend == "openai":
        openai_embed.model_name = os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small")
        openai_embed.backend = "openai"
        return openai_embed
    raise ValueError("Unsupported ARES_EMBEDDING_BACKEND. Use 'local' or 'openai'.")
