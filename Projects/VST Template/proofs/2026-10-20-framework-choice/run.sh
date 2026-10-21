#!/bin/sh
# Re-run the timing and parity checks behind README.md. Needs clang++ (Xcode) and python3 with numpy.
# Everything it writes lands in out/, which is gitignored.
set -e
cd "$(dirname "$0")"; mkdir -p out; cd out
clang++ -O3 -std=c++20 ../kern.cpp -o kern
echo "-- timing: 20 s of audio, B = 2.5e-5, K = 6 Hz"
for N in 40 64 96; do python3 ../ref.py $N 2.5e-5 6 0.01; ./kern $N 2.5e-5 6 20 1; done
echo "-- parity against numpy: 3 s, N = 40, K = 6 Hz"
for B in 4e-6 2.5e-5 8e-5; do
  python3 ../ref.py 40 $B 6 3
  ./kern 40 $B 6 3 0 c_unwrapped.bin >/dev/null; ./kern 40 $B 6 3 1 c_wrapped.bin >/dev/null
  python3 ../cmp.py 40 $B 6
done
