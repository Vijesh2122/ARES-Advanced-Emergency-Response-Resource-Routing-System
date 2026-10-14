/** @file priority_queue.h @brief Max-heap view of emergency priorities. */
#ifndef ARES_PRIORITY_QUEUE_H
#define ARES_PRIORITY_QUEUE_H

#include "emergency.h"

typedef struct {
    Emergency items[MAX_EMERGENCIES];
    int size;
} EmergencyHeap;

void emergency_heap_init(EmergencyHeap *heap);
AresStatus emergency_heap_push(EmergencyHeap *heap, const Emergency *item);
AresStatus emergency_heap_pop(EmergencyHeap *heap, Emergency *out);
const Emergency *emergency_heap_peek(const EmergencyHeap *heap);
void emergency_heap_build_pending(EmergencyHeap *heap);

#endif /* ARES_PRIORITY_QUEUE_H */
