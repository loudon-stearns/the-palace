"""Outline a Live XML file: tag tree with repeat counts, to a depth. Usage: python3 -I outline.py <file.xml> [depth]"""
import sys, xml.etree.ElementTree as ET
f=sys.argv[1]; depth=int(sys.argv[2]) if len(sys.argv)>2 else 6
root=ET.parse(f).getroot()
def walk(el,d,out):
    if d>depth: return
    groups={}
    for c in el:
        groups.setdefault(c.tag,[]).append(c)
    for tag,cs in groups.items():
        c=cs[0]; attrs=''
        if 'Value' in c.attrib and len(c)==0: attrs=' ='+c.attrib['Value'][:40]
        elif 'Id' in c.attrib: attrs=' Id'
        n=f' x{len(cs)}' if len(cs)>1 else ''
        out.append('  '*d+tag+attrs+n)
        if len(c): walk(c,d+1,out)
out=[root.tag]; walk(root,1,out); print('\n'.join(out))
