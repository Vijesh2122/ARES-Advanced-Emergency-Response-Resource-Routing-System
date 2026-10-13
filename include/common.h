/**
 * @file common.h
 * @brief Shared macros, logging helpers, and project-wide configuration.
 *
 * Every ARES source file includes this header (directly or transitively
 * through types.h).  Keep it lean -- only truly universal declarations
 * belong here.
 */

#ifndef ARES_COMMON_H
#define ARES_COMMON_H

#include <stdio.h>
#include <stdlib.h>

/* --- Version ---------------------------------------------------------- */
#define ARES_VERSION        "2.0.0-phase2"
#define ARES_VERSION_MAJOR  2
#define ARES_VERSION_MINOR  0
#define ARES_VERSION_PATCH  0

/* --- Boolean (C11 _Bool / stdbool is fine, but we keep it explicit) -- */
#include <stdbool.h>

/* --- Utility macros --------------------------------------------------- */
#define ARES_UNUSED(x)  ((void)(x))
#define ARES_ARRAY_LEN(a) ((int)(sizeof(a) / sizeof((a)[0])))

/* Min / Max without type-unsafe macros */
static inline int ares_min(int a, int b) { return a < b ? a : b; }
static inline int ares_max(int a, int b) { return a > b ? a : b; }

/* --- Logging ---------------------------------------------------------- */
/*
 * Use these instead of bare printf() for anything that isn't
 * user-facing output (e.g., debug traces, warnings, errors).
 * In release builds define ARES_SILENT to suppress LOG_DEBUG.
 */
#ifdef ARES_SILENT
  #define LOG_DEBUG(fmt, ...) ((void)0)
#else
  #define LOG_DEBUG(fmt, ...)  \
      fprintf(stderr, "[DBG] %s:%d: " fmt "\n", __FILE__, __LINE__, ##__VA_ARGS__)
#endif

#define LOG_WARN(fmt, ...)  \
    fprintf(stderr, "[WRN] " fmt "\n", ##__VA_ARGS__)

#define LOG_ERR(fmt, ...)   \
    fprintf(stderr, "[ERR] %s:%d: " fmt "\n", __FILE__, __LINE__, ##__VA_ARGS__)

/* --- Safe allocation helpers ------------------------------------------ */
/**
 * Allocate n bytes; abort with a clear message if malloc fails.
 * ARES is a demonstration system -- aborting on OOM is acceptable.
 * Replace with a recovery path in production code.
 */
static inline void *ares_malloc(size_t n) {
    void *p = malloc(n);
    if (!p) {
        fprintf(stderr, "[FATAL] malloc(%zu) failed -- out of memory.\n", n);
        abort();
    }
    return p;
}

static inline void *ares_calloc(size_t count, size_t size) {
    void *p = calloc(count, size);
    if (!p) {
        fprintf(stderr, "[FATAL] calloc(%zu, %zu) failed -- out of memory.\n",
                count, size);
        abort();
    }
    return p;
}

static inline void *ares_realloc(void *ptr, size_t n) {
    void *p = realloc(ptr, n);
    if (!p) {
        fprintf(stderr, "[FATAL] realloc(%zu) failed -- out of memory.\n", n);
        abort();
    }
    return p;
}

/* --- Compile-time assert (C11) ---------------------------------------- */
#define ARES_STATIC_ASSERT(cond, msg) _Static_assert(cond, msg)

#endif /* ARES_COMMON_H */
