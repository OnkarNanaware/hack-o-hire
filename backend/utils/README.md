# `/backend/utils`

Shared utility libraries used across all modules and pipelines.

## Structure

```
utils/
├── logger.py              # Structured JSON logging (using loguru)
├── file_handler.py        # Secure file upload/temp storage management
├── url_utils.py           # URL parsing, normalization, and validation
├── email_parser.py        # .eml file parsing and header extraction
├── audio_utils.py         # Audio file format validation and conversion
├── crypto.py              # Hash verification, signature checking
├── db.py                  # Database session factory (SQLAlchemy)
├── cache.py               # Redis-based result caching
└── config_loader.py       # YAML config loader for /configs/
```

## Notes

- All utilities are stateless and independently testable.
- `file_handler.py` enforces strict file-type validation and stores uploads in ephemeral temp directories automatically cleaned after processing.
- `logger.py` outputs structured JSON logs compatible with ELK/Loki stacks.
