cmake_minimum_required(VERSION 3.16)
project(ARES VERSION 2.0.0 LANGUAGES C)

set(CMAKE_C_STANDARD 11)
set(CMAKE_C_STANDARD_REQUIRED ON)
set(CMAKE_C_EXTENSIONS OFF)

# ── Warnings ──────────────────────────────────────────────────────────────
if(MSVC)
    add_compile_options(/W4)
else()
    add_compile_options(-Wall -Wextra -Wpedantic -Wno-unused-parameter)
endif()

# ── Include directories ───────────────────────────────────────────────────
include_directories(include)

# ── Library target (all modules except main.c) ────────────────────────────
add_library(ares_core STATIC
    src/emergency/emergency.c
    src/resource/resource.c
    src/ui/ui.c
    src/ui/utils.c
)
target_link_libraries(ares_core m)   # -lm for math functions

# ── Main application ──────────────────────────────────────────────────────
add_executable(ares src/main.c)
target_link_libraries(ares ares_core)

# ── Tests ─────────────────────────────────────────────────────────────────
enable_testing()

add_executable(test_emergency tests/test_emergency.c)
target_link_libraries(test_emergency ares_core)
add_test(NAME EmergencyTests COMMAND test_emergency)

add_executable(test_resource tests/test_resource.c)
target_link_libraries(test_resource ares_core)
add_test(NAME ResourceTests COMMAND test_resource)

# ── Install ───────────────────────────────────────────────────────────────
install(TARGETS ares DESTINATION bin)

# ── Build instructions (shown with cmake --build . --target help) ─────────
# mkdir build && cd build
# cmake ..
# cmake --build .
# ctest --output-on-failure
