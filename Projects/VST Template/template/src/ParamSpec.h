// ParamSpec.h — template machinery: one row of an algorithm's parameter table.
// Don't edit per plugin. Algorithm.h fills a table of these; the wrapper turns
// it into host parameters, the harness prints it for verify.py, and the
// smoothing follows each row's taper.
#pragma once

namespace tpl
{
    enum class Taper
    {
        Linear,   // knob moves evenly in natural units; smoothed linearly
        Log,      // knob moves evenly in log(value); smoothed in the log domain (min must be > 0)
        Choice,   // a menu; the algorithm sees the index 0, 1, 2 ...; never smoothed
        Toggle    // on/off; the algorithm sees 0 or 1; never smoothed
    };

    struct ParamSpec
    {
        const char* id;            // stable host id: never rename once a plugin is in use
        const char* name;          // what the host shows
        const char* unit;          // "Hz", "dB", "" ...
        double      min, max, def; // natural units; Choice: 0, count-1, default index; Toggle: 0, 1, 0 or 1
        Taper       taper       = Taper::Linear;
        double      smoothMs    = 20.0;   // one-pole time constant; 0 = jump
        const char* choices     = "";     // Choice only: "40|64|96"
        bool        automatable = true;
    };
}
