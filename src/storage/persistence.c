/** @file persistence.c @brief Versioned binary snapshots for local demo data. */
#include "persistence.h"
#include "emergency.h"
#include "resource.h"

#include <stdio.h>
#include <string.h>

#define SNAPSHOT_MAGIC "ARES2"
typedef struct { char magic[8]; unsigned int emergencies; unsigned int resources; } SnapshotHeader;

typedef struct { FILE *file; bool failed; } Writer;
static bool write_emergency(const Emergency *e, void *context) {
    Writer *writer = context;
    if (fwrite(e, sizeof(*e), 1, writer->file) != 1) writer->failed = true;
    return !writer->failed;
}
static bool write_resource(const Resource *r, void *context) {
    Writer *writer = context;
    if (fwrite(r, sizeof(*r), 1, writer->file) != 1) writer->failed = true;
    return !writer->failed;
}

AresStatus persistence_save(const char *path) {
    if (!path) return ARES_ERR_NULL;
    FILE *file = fopen(path, "wb");
    if (!file) return ARES_ERR_IO;
    SnapshotHeader header = {{0}, (unsigned int)emergency_db_count(), (unsigned int)resource_db_count()};
    memcpy(header.magic, SNAPSHOT_MAGIC, sizeof(SNAPSHOT_MAGIC));
    Writer writer = { file, fwrite(&header, sizeof(header), 1, file) != 1 };
    if (!writer.failed) emergency_foreach(write_emergency, &writer);
    if (!writer.failed) resource_foreach(write_resource, &writer);
    bool close_failed = fclose(file) != 0;
    return writer.failed || close_failed ? ARES_ERR_IO : ARES_OK;
}

AresStatus persistence_load(const char *path, bool *loaded) {
    if (!path || !loaded) return ARES_ERR_NULL;
    *loaded = false;
    FILE *file = fopen(path, "rb");
    if (!file) return ARES_OK; /* First launch: no snapshot yet. */
    SnapshotHeader header;
    if (fread(&header, sizeof(header), 1, file) != 1 ||
        strcmp(header.magic, SNAPSHOT_MAGIC) != 0 ||
        header.emergencies > MAX_EMERGENCIES || header.resources > MAX_RESOURCES) {
        fclose(file); return ARES_ERR_IO;
    }
    Emergency emergency;
    Resource resource;
    for (unsigned int i = 0; i < header.emergencies; ++i) {
        if (fread(&emergency, sizeof(emergency), 1, file) != 1 || emergency_add(&emergency) != ARES_OK) {
            fclose(file); emergency_db_init(); resource_db_init(); return ARES_ERR_IO;
        }
    }
    for (unsigned int i = 0; i < header.resources; ++i) {
        if (fread(&resource, sizeof(resource), 1, file) != 1 || resource_add(&resource) != ARES_OK) {
            fclose(file); emergency_db_init(); resource_db_init(); return ARES_ERR_IO;
        }
    }
    if (fclose(file) != 0) return ARES_ERR_IO;
    *loaded = true;
    return ARES_OK;
}
