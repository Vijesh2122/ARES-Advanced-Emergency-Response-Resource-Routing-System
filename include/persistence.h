/** @file persistence.h @brief Binary snapshot persistence for ARES state. */
#ifndef ARES_PERSISTENCE_H
#define ARES_PERSISTENCE_H

#include "types.h"

AresStatus persistence_save(const char *path);
AresStatus persistence_load(const char *path, bool *loaded);

#endif /* ARES_PERSISTENCE_H */
