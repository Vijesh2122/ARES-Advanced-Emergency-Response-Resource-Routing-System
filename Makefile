# ============================================================
#  ARES — Makefile  (Phase 2+)
#  Compiler: GCC (MinGW-w64 / MSYS2 / Linux)
#
#  Targets:
#    make          — debug build   → build/ares.exe
#    make release  — O2 build      → build/ares.exe
#    make tests    — all unit tests (build + run each)
#    make test_emg — emergency test only
#    make test_res — resource test only
#    make clean    — remove build/
#    make help     — show this list
# ============================================================

CC       := gcc
STD      := -std=c11
WARN     := -Wall -Wextra -Wpedantic -Wno-unused-parameter
IFLAGS   := -Iinclude
DBGFLAGS := -g -DDEBUG
RELFLAGS := -O2 -DNDEBUG
LIBS     := -lm

BLDDIR   := build

# All source files (glob subdirectories)
APP_SRCS := src/main.c \
            src/emergency/emergency.c \
            src/resource/resource.c \
            src/routing/graph.c \
            src/storage/persistence.c \
            src/structures/priority_queue.c \
            src/ui/ui.c \
            src/ui/utils.c

# Library sources (everything except main.c) for test linking
LIB_SRCS := src/emergency/emergency.c \
            src/resource/resource.c \
            src/routing/graph.c \
            src/storage/persistence.c \
            src/structures/priority_queue.c \
            src/ui/utils.c

TARGET   := $(BLDDIR)/ares.exe

# ── Default: debug build ─────────────────────────────────────────────────
.PHONY: all
all: $(BLDDIR) $(TARGET)

$(BLDDIR):
	mkdir -p $(BLDDIR)

$(TARGET): $(APP_SRCS) | $(BLDDIR)
	$(CC) $(STD) $(WARN) $(IFLAGS) $(DBGFLAGS) $(LIBS) $^ -o $@
	@echo "  [OK] Build: $@"

# ── Release ──────────────────────────────────────────────────────────────
.PHONY: release
release: | $(BLDDIR)
	$(CC) $(STD) $(WARN) $(IFLAGS) $(RELFLAGS) $(LIBS) $(APP_SRCS) -o $(TARGET)
	@echo "  [OK] Release: $(TARGET)"

# ── Tests ────────────────────────────────────────────────────────────────
TEST_EMG := $(BLDDIR)/test_emergency.exe
TEST_RES := $(BLDDIR)/test_resource.exe
TEST_ADV := $(BLDDIR)/test_advanced.exe

.PHONY: test_emg
test_emg: $(TEST_EMG)
	@echo ""; @echo "── Emergency Tests ──"
	./$(TEST_EMG)

$(TEST_EMG): tests/test_emergency.c src/emergency/emergency.c src/ui/utils.c | $(BLDDIR)
	$(CC) $(STD) $(WARN) $(IFLAGS) $(DBGFLAGS) $(LIBS) $^ -o $@

.PHONY: test_res
test_res: $(TEST_RES)
	@echo ""; @echo "── Resource Tests ──"
	./$(TEST_RES)

$(TEST_RES): tests/test_resource.c src/resource/resource.c src/ui/utils.c | $(BLDDIR)
	$(CC) $(STD) $(WARN) $(IFLAGS) $(DBGFLAGS) $(LIBS) $^ -o $@

.PHONY: test_adv
test_adv: $(TEST_ADV)
	@echo ""; @echo "── Advanced Algorithm Tests ──"
	./$(TEST_ADV)

$(TEST_ADV): tests/test_advanced.c $(LIB_SRCS) | $(BLDDIR)
	$(CC) $(STD) $(WARN) $(IFLAGS) $(DBGFLAGS) $(LIBS) $^ -o $@

.PHONY: tests
tests: test_emg test_res test_adv

.PHONY: test
test: tests
	@echo ""; @echo "All test suites complete."

# ── Clean ─────────────────────────────────────────────────────────────────
.PHONY: clean
clean:
	rm -rf $(BLDDIR)
	@echo "  Cleaned."

# ── Help ──────────────────────────────────────────────────────────────────
.PHONY: help
help:
	@echo "ARES Build Targets:"
	@echo "  make          Debug build -> build/ares.exe"
	@echo "  make release  Release build (O2)"
	@echo "  make tests    Build and run ALL unit tests"
	@echo "  make test_emg Emergency unit tests only"
	@echo "  make test_res Resource unit tests only"
	@echo "  make clean    Remove build directory"
