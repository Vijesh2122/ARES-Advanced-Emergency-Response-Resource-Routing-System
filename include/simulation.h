/**
 * @file simulation.h
 * @brief Crisis simulation engine, real-time clock, scenario generator, and mission tick.
 */
#ifndef ARES_SIMULATION_H
#define ARES_SIMULATION_H

#include "types.h"

void simulation_init(void);
void simulation_load_crisis_scenario(void);
int  simulation_tick(int minutes);
int  simulation_get_clock_minutes(void);
void simulation_menu_loop(void);

#endif /* ARES_SIMULATION_H */
