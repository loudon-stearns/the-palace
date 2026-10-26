# JUCE MemoryBlock::toBase64Encoding / fromBase64Encoding
ALPH=".ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+"
def dec(s):
    n,_,body=s.partition("."); n=int(n); out=bytearray(n); bit=0
    for ch in body:
        v=ALPH.index(ch)
        for b in range(6):
            if bit>=n*8: break
            if v&(1<<b): out[bit>>3]|=1<<(bit&7)
            bit+=1
    return bytes(out)
def enc(data):
    n=len(data); out=[]; bit=0; total=n*8
    while bit<total:
        v=0
        for b in range(6):
            if bit<total and data[bit>>3]&(1<<(bit&7)): v|=1<<b
            bit+=1
        out.append(ALPH[v])
    return f"{n}."+"".join(out)
