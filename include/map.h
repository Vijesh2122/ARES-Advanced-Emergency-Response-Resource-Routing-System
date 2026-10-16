/**
 * @file map.h
 * @brief Visual tactical city map, ANSI topology renderer, and live web HUD bridge.
 */
#ifndef ARES_MAP_H
#define ARES_MAP_H

#include "types.h"
#include "graph.h"

/* Render visual tactical ASCII/ANSI city radar map in the terminal */
void map_render_terminal(const AresRoute *highlight_route);

/* Export live state to JSON and JavaScript (for zero-config local browser file:// compatibility) */
AresStatus map_export_live_data(const char *json_path, const char *js_path);

/* Open the interactive visual tactical map in the default web browser */
void map_launch_browser_hud(void);

/* Interactive Map Submenu in the terminal */
void map_interactive_menu(void);

#endif /* ARES_MAP_H */
