// Offline render architecture: writes interleaved float32 frames to stdout.
// usage: ./render seconds sr [name=value ...]
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <cmath>
#include <algorithm>
#include <string>
#include <vector>
#include "faust/dsp/dsp.h"
#include "faust/gui/MapUI.h"
#include "faust/gui/meta.h"

<<includeIntrinsic>>
<<includeclass>>

int main(int argc, char** argv) {
    double secs = atof(argv[1]); int sr = atoi(argv[2]);
    mydsp d; d.init(sr);
    MapUI ui; d.buildUserInterface(&ui);
    for (int a = 3; a < argc; a++) {
        std::string s(argv[a]); size_t e = s.find('=');
        ui.setParamValue(s.substr(0, e), atof(s.substr(e + 1).c_str()));
    }
    int nout = d.getNumOutputs(); const int B = 256;
    std::vector<std::vector<FAUSTFLOAT>> buf(nout, std::vector<FAUSTFLOAT>(B));
    std::vector<FAUSTFLOAT*> ptr(nout); for (int c = 0; c < nout; c++) ptr[c] = buf[c].data();
    long total = (long)(secs * sr); std::vector<float> frame(nout);
    for (long n = 0; n < total; n += B) {
        int k = (int)std::min<long>(B, total - n);
        d.compute(k, nullptr, ptr.data());
        for (int i = 0; i < k; i++) { for (int c = 0; c < nout; c++) frame[c] = buf[c][i]; fwrite(frame.data(), 4, nout, stdout); }
    }
    return 0;
}
