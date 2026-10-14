/**
 * @file ui.h
 * @brief Terminal-UI utilities for ARES -- menus, prompts, display helpers.
 *
 * Phase 2 adds Resource Management menus and improved emergency wizard
 * with node_id and affected_count fields.
 */

#ifndef ARES_UI_H
#define ARES_UI_H

#include "types.h"
#include "emergency.h"
#include "resource.h"

/* --- ANSI colour codes ------------------------------------------------ */
#define COL_RESET   "\033[0m"
#define COL_BOLD    "\033[1m"
#define COL_RED     "\033[1;31m"
#define COL_YELLOW  "\033[1;33m"
#define COL_GREEN   "\033[1;32m"
#define COL_CYAN    "\033[1;36m"
#define COL_MAGENTA "\033[1;35m"
#define COL_BLUE    "\033[1;34m"
#define COL_WHITE   "\033[1;37m"
#define COL_GRAY    "\033[0;37m"

/* --- Screen helpers --------------------------------------------------- */
void ui_clear_screen(void);
void ui_print_banner(void);
void ui_print_separator(void);
void ui_print_header(const char *title);

/* --- Input helpers ---------------------------------------------------- */
int  ui_read_string(const char *prompt, char *buf, int len);
int  ui_read_int(const char *prompt, int lo, int hi);
double ui_read_double(const char *prompt, double lo, double hi);

/* --- Main and sub-menus ----------------------------------------------- */
void ui_show_main_menu(void);
void ui_show_emergency_menu(void);
void ui_show_resource_menu(void);
void ui_show_routing_menu(void);

/* --- Wizard helpers --------------------------------------------------- */
/** Interactively populate an Emergency struct from user input. */
void ui_fill_new_emergency(Emergency *e);

/** Interactively populate a Resource struct from user input. */
void ui_fill_new_resource(Resource *r);

/* --- Colour helpers --------------------------------------------------- */
const char *ui_severity_colour(Severity s);
const char *ui_status_colour(RecordStatus s);
const char *ui_res_status_colour(ResourceStatus s);

#endif /* ARES_UI_H */
