/** @file priority_queue.c @brief Max-heap for highest-priority incidents. */
#include "priority_queue.h"

static void swap(Emergency *a, Emergency *b) { Emergency temp = *a; *a = *b; *b = temp; }
void emergency_heap_init(EmergencyHeap *heap) { if (heap) heap->size = 0; }
AresStatus emergency_heap_push(EmergencyHeap *heap, const Emergency *item) {
    if (!heap || !item) return ARES_ERR_NULL;
    if (heap->size >= MAX_EMERGENCIES) return ARES_ERR_FULL;
    int i = heap->size++; heap->items[i] = *item;
    while (i > 0) { int parent = (i - 1) / 2; if (heap->items[parent].priority_score >= heap->items[i].priority_score) break; swap(&heap->items[parent], &heap->items[i]); i = parent; }
    return ARES_OK;
}
AresStatus emergency_heap_pop(EmergencyHeap *heap, Emergency *out) {
    if (!heap || !out) return ARES_ERR_NULL;
    if (heap->size == 0) return ARES_ERR_UNDERFLOW;
    *out = heap->items[0]; heap->items[0] = heap->items[--heap->size];
    for (int i = 0;;) { int left = 2*i+1, right = left+1, largest = i;
        if (left < heap->size && heap->items[left].priority_score > heap->items[largest].priority_score) largest = left;
        if (right < heap->size && heap->items[right].priority_score > heap->items[largest].priority_score) largest = right;
        if (largest == i) break;
        swap(&heap->items[i], &heap->items[largest]);
        i = largest;
    }
    return ARES_OK;
}
const Emergency *emergency_heap_peek(const EmergencyHeap *heap) { return heap && heap->size ? &heap->items[0] : NULL; }
static bool add_pending(const Emergency *e, void *context) { EmergencyHeap *heap = context; if (e->status == STATUS_PENDING || e->status == STATUS_ACTIVE) emergency_heap_push(heap, e); return true; }
void emergency_heap_build_pending(EmergencyHeap *heap) { emergency_heap_init(heap); if (heap) emergency_foreach(add_pending, heap); }
