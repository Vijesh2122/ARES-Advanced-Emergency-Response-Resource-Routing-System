/**
 * @file utils.h
 * @brief General-purpose utility functions used across ARES modules.
 */

#ifndef ARES_UTILS_H
#define ARES_UTILS_H

#include "types.h"
#include <stddef.h>
#include <time.h>

/* --- String helpers --------------------------------------------------- */
void safe_strncpy(char *dest, const char *src, size_t n);
void str_trim(char *s);
void str_toupper(char *s);
void str_tolower(char *s);

/* --- ID generation ---------------------------------------------------- */
/** Generate unique emergency ID: "INCYYYYMMDDnnnn" */
void generate_emergency_id(char *buf, int seq);
/** Generate unique resource ID: "RES-TYPE-nnnn" */
void generate_resource_id(char *buf, ResourceType type, int seq);

/* --- Timestamp helpers ------------------------------------------------ */
/** Format time_t as "YYYY-MM-DD HH:MM:SS" into buf (>=20 bytes). */
void format_timestamp(char *buf, time_t t);

/* --- Numeric utilities ------------------------------------------------ */
int    clamp_int(int v, int lo, int hi);
double clamp_double(double v, double lo, double hi);

#endif /* ARES_UTILS_H */
