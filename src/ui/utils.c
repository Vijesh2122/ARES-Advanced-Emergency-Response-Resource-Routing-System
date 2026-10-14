/**
 * @file utils.c
 * @brief General-purpose ARES utility implementations.
 */

#include "utils.h"
#include "common.h"

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include <time.h>

/* --- String helpers --------------------------------------------------- */

void safe_strncpy(char *dest, const char *src, size_t n) {
    if (!dest || !src || n == 0) return;
    strncpy(dest, src, n - 1);
    dest[n - 1] = '\0';
}

void str_trim(char *s) {
    if (!s) return;
    int len = (int)strlen(s);
    while (len > 0 && isspace((unsigned char)s[len - 1])) s[--len] = '\0';
    char *start = s;
    while (*start && isspace((unsigned char)*start)) start++;
    if (start != s) memmove(s, start, strlen(start) + 1);
}

void str_toupper(char *s) {
    if (!s) return;
    for (; *s; s++) *s = (char)toupper((unsigned char)*s);
}

void str_tolower(char *s) {
    if (!s) return;
    for (; *s; s++) *s = (char)tolower((unsigned char)*s);
}

/* --- ID generation ---------------------------------------------------- */

void generate_emergency_id(char *buf, int seq) {
    if (!buf) return;
    time_t now = time(NULL);
    struct tm *t = localtime(&now);
    /* "INCYYYYMMDDnnnn" -- fits in MAX_ID_LEN=24 */
    if (!t) { safe_strncpy(buf, "INC000000000000", MAX_ID_LEN); return; }
    unsigned int year = (unsigned int)(t->tm_year + 1900) % 10000U;
    unsigned int serial = (unsigned int)seq % 10000U;
    snprintf(buf, MAX_ID_LEN, "INC%04u%02u%02u%04u", year,
             (unsigned int)(t->tm_mon + 1), (unsigned int)t->tm_mday, serial);
}

void generate_resource_id(char *buf, ResourceType type, int seq) {
    if (!buf) return;
    const char *prefix[] = {
        "AMB","FTK","POL","RSC","HLI","HZM","SHL","WHS","OTH"
    };
    int idx = (type >= 0 && type < RES_TYPE_COUNT) ? (int)type : 8;
    snprintf(buf, MAX_ID_LEN, "%s-%04d", prefix[idx], seq % 10000);
}

/* --- Timestamp -------------------------------------------------------- */

void format_timestamp(char *buf, time_t t) {
    if (!buf) return;
    struct tm *tm_info = localtime(&t);
    strftime(buf, 20, "%Y-%m-%d %H:%M:%S", tm_info);
}

/* --- Numeric ---------------------------------------------------------- */

int clamp_int(int v, int lo, int hi) {
    if (v < lo) return lo;
    if (v > hi) return hi;
    return v;
}

double clamp_double(double v, double lo, double hi) {
    if (v < lo) return lo;
    if (v > hi) return hi;
    return v;
}
