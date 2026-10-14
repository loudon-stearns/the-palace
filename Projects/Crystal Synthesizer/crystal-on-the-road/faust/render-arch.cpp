// render-arch.cpp — minimal Faust architecture: hold one note and write float32 to stdout.
// usage: ./crystal-render <crystal> <freq> <seconds> [param=value ...] > out.f32
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <string>
#include <vector>
#include "faust/gui/MapUI.h"
#include "faust/gui/meta.h"
#include "faust/dsp/dsp.h"

<<includeIntrinsic>>
<<includeclass>>

int main(int argc, char** argv) {
    const int SR = 44100;
    mydsp d; MapUI ui; d.init(SR); d.buildUserInterface(&ui);
    ui.setParamValue("crystal", atof(argv[1]));
    ui.setParamValue("freq", atof(argv[2]));
    long N = (long)(atof(argv[3]) * SR);
    for (int i = 4; i < argc; i++) {
        std::string a(argv[i]); size_t e = a.find('=');
        ui.setParamValue(a.substr(0, e), atof(a.substr(e + 1).c_str()));
    }
    ui.setParamValue("gain", 1.0);
    ui.setParamValue("gate", 1.0);
    std::vector<FAUSTFLOAT> L(N), R(N);
    FAUSTFLOAT* outs[2] = { L.data(), R.data() };
    d.compute((int)N, nullptr, outs);
    std::vector<float> f(L.begin(), L.end());
    fwrite(f.data(), sizeof(float), N, stdout);
    return 0;
}
