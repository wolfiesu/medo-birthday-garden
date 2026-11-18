"""Builds Medo's animation sheet from her original sprite by moving real parts of the art
(hair tips, arms, bag, legs, eyes) in whole pixels. Nothing is redrawn except eyelids and one raised arm."""
import numpy as np, json, base64, io, sys
from PIL import Image

src = np.array(Image.open('medo_game.png').convert('RGBA'))
H, W = src.shape[:2]
FW, FH, OX, OY = 40, 76, 3, 2
SKIN = tuple(int(v) for v in src[21, 14][:3]) + (255,)
DARK = tuple(int(v) for v in src[21, 11][:3]) + (255,)
BLUSH = (255, 176, 196, 255)

def blueish(c):
    return c[2] > c[0] + 12 and (int(c[0]) + int(c[1]) + int(c[2])) / 3 >= 110

parts = {k: [] for k in ('head', 'hairL', 'hairR', 'torso', 'armR', 'bag', 'legL', 'legR')}
for y in range(H):
    for x in range(W):
        c = tuple(int(v) for v in src[y, x])
        if c[3] < 128:
            continue
        if y <= 28:
            p = 'head'
        elif y <= 35 and x <= 9 and not blueish(c):
            p = 'hairL'
        elif y <= 35 and x >= 23 and not blueish(c):
            p = 'hairR'
        elif 46 <= y <= 60 and x <= 13:
            p = 'bag'
        elif 45 <= y <= 49 and x >= 25:
            p = 'armR'
        elif y >= 50:
            p = 'legL' if x <= 16 else 'legR'
        else:
            p = 'torso'
        parts[p].append((x, y, c))

EYE_ERASE = {(x, 20) for x in range(9, 14)} | {(x, 21) for x in range(10, 14)} | {(x, 22) for x in range(10, 13)} \
          | {(x, 20) for x in range(19, 24)} | {(x, 21) for x in range(20, 23)} | {(x, 22) for x in range(20, 23)}
EYE_ORIG = [(x, y, tuple(int(v) for v in src[y, x])) for (x, y) in sorted(EYE_ERASE)]

HIP = [(x, y, tuple(int(v) for v in src[y, x])) for y in range(50, 53) for x in range(9, 25) if src[y, x][3] >= 128]

def clamp1(v):
    return max(-1, min(1, int(v)))

DEF = dict(bob=0, headdy=0, Ldx=0, Llift=0, Rdx=0, Rlift=0, bagdx=0, bagdy=0, armdx=0, armdy=0, raise_=0,
           hairdx=0, hairdy=0, lean=0, eyes='open', look=0)

def render(**kw):
    d = dict(DEF); d.update(kw)
    out = np.zeros((FH, FW, 4), np.uint8)

    def put(x, y, c):
        X, Y = x + OX, y + OY
        if 0 <= X < FW and 0 <= Y < FH and c[3] >= 128:
            out[Y, X] = c

    def lean_dx(y):
        return int(round(d['lean'] * (50 - y) / 50.0)) if d['lean'] else 0

    bob = d['bob']
    # legs (shear from hip to foot, so the foot swings and the thigh stays put)
    for part, dx, lift in (('legL', d['Ldx'], d['Llift']), ('legR', d['Rdx'], d['Rlift'])):
        for (x, y, c) in parts[part]:
            sx = int(round(dx * (y - 50) / 20.0))
            put(x + sx, y - lift, c)
    for (x, y, c) in HIP:
        put(x, y + bob, c)
    # torso
    for (x, y, c) in parts['torso']:
        if d['raise_'] and x >= 25 and 37 <= y <= 48:
            continue
        put(x + lean_dx(y), y + bob, c)
    # right arm
    if d['raise_'] == 0:
        for (x, y, c) in parts['armR']:
            put(x + d['armdx'] + lean_dx(y), y + bob + d['armdy'], c)
    # bag arm
    for (x, y, c) in parts['bag']:
        put(x + d['bagdx'], y + bob + d['bagdy'], c)
    # hair tips
    for part in ('hairL', 'hairR'):
        for (x, y, c) in parts[part]:
            f = (y - 28) / 8.0
            put(x + (clamp1(d['hairdx']) if y >= 32 else 0) + lean_dx(y), y + bob, c)
    # head with eyes handled separately
    hd = bob + d['headdy']
    for (x, y, c) in parts['head']:
        if (x, y) in EYE_ERASE:
            c = SKIN
        put(x + lean_dx(y), y + hd, c)
    lx = lean_dx(20)
    eyes = d['eyes']
    if eyes == 'open':
        for (x, y, c) in EYE_ORIG:
            put(x + d['look'] + lx, y + hd, c)
    elif eyes == 'blink':
        for x in (10, 11, 12, 20, 21, 22):
            put(x + d['look'] + lx, 21 + hd, DARK)
    elif eyes == 'happy':
        for (x, y) in ((9, 21), (10, 20), (11, 20), (12, 20), (13, 21), (19, 21), (20, 20), (21, 20), (22, 20), (23, 21)):
            put(x + lx, y + hd, DARK)
        for (x, y) in ((11, 23), (12, 23), (21, 23), (22, 23)):
            put(x + lx, y + hd, BLUSH)
    elif eyes == 'hurt':
        for (x, y) in ((10, 20), (11, 21), (10, 22), (22, 20), (21, 21), (22, 22)):
            put(x + lx, y + hd, DARK)
    # raised arm (right hand waves / cheers)
    if d['raise_']:
        n = 5 if d['raise_'] == 2 else 3
        cs = [tuple(int(v) for v in src[41, 24]), tuple(int(v) for v in src[41, 25]), tuple(int(v) for v in src[41, 26])]
        for k in range(n):
            for dy in (0, 1):
                for dx in range(3):
                    put(25 + k + dx, 41 - 2 * k - dy + bob, cs[dx])
        hx, hy = 25 + n, 41 - 2 * n + bob - 2
        for yy in range(3):
            for xx in range(2):
                put(hx + xx, hy + yy, tuple(int(v) for v in src[46 + yy, 25 + xx]))
    return out

WALK = [
    dict(Ldx=-2, Rdx=2, bob=0, bagdy=0, hairdx=-1, hairdy=0),
    dict(Ldx=-1, Rdx=1, bob=1, bagdy=1, hairdx=-2, hairdy=1),
    dict(Ldx=0, Rdx=0, Llift=2, bob=0, bagdy=0, hairdx=-1, hairdy=0),
    dict(Ldx=1, Rdx=-1, Llift=1, bob=-1, bagdy=-1, hairdx=0, hairdy=-1),
    dict(Ldx=2, Rdx=-2, bob=0, bagdy=0, hairdx=-1, hairdy=0),
    dict(Ldx=1, Rdx=-1, bob=1, bagdy=1, hairdx=-2, hairdy=1),
    dict(Ldx=0, Rdx=0, Rlift=2, bob=0, bagdy=0, hairdx=-1, hairdy=0),
    dict(Ldx=-1, Rdx=1, Rlift=1, bob=-1, bagdy=-1, hairdx=0, hairdy=-1),
]
POSES = []   # (name, params, fixed_eyes or None)
for i, w in enumerate(WALK):
    q = dict(w); q.update(lean=1, look=1, armdy=-w.get('bagdy', 0))
    POSES.append(('walk%d' % i, q, None))
POSES += [
    ('idle0', dict(), None),
    ('idle1', dict(bob=1), None),
    ('idle2', dict(bob=1, hairdx=1, bagdy=1), None),
    ('up', dict(Ldx=1, Llift=2, Rdx=-1, Rlift=2, bagdy=-2, armdy=-2, hairdy=1, look=1), None),
    ('fall', dict(Ldx=-2, Rdx=2, Llift=1, Rlift=1, bagdy=-3, armdy=-3, hairdy=-2, look=1), None),
    ('land', dict(bob=2, Ldx=-1, Rdx=1, bagdy=1, hairdy=-1), None),
    ('skid', dict(lean=-1, Ldx=2, Rdx=2, hairdx=1, bagdy=-1, look=-1), None),
    ('hurt', dict(lean=-1, hairdy=-1, raise_=1, bagdy=-2, Ldx=1, Rdx=-1), 'hurt'),
    ('joy', dict(bob=-1, Llift=0), 'happy'),
    ('cheerA', dict(raise_=2), 'happy'),
    ('cheerB', dict(raise_=1, bob=-1, Llift=1, Rlift=1, bagdy=-2), 'happy'),
]

frames, names = [], []
for name, p, fixed in POSES:
    if fixed:
        frames.append(render(eyes=fixed, **p)); names.append(name)
    else:
        frames.append(render(eyes='open', **p)); names.append(name)
        frames.append(render(eyes='blink', **p)); names.append(name + '_b')

COLS = 10
rows = (len(frames) + COLS - 1) // COLS
sheet = Image.new('RGBA', (COLS * FW, rows * FH), (0, 0, 0, 0))
for i, f in enumerate(frames):
    sheet.alpha_composite(Image.fromarray(f, 'RGBA'), ((i % COLS) * FW, (i // COLS) * FH))
sheet.save('medo_sheet.png')
buf = io.BytesIO(); sheet.save(buf, 'PNG', optimize=True)
open('medo_sheet.b64', 'w').write(base64.b64encode(buf.getvalue()).decode())
json.dump({'names': names, 'cols': COLS, 'fw': FW, 'fh': FH, 'ox': OX, 'oy': OY}, open('medo_sheet.json', 'w'))
print(len(frames), 'frames', sheet.size, len(buf.getvalue()), 'bytes')

# contact sheet preview
S = 4
prev = Image.new('RGBA', (COLS * FW * S, rows * FH * S), (205, 230, 255, 255))
prev.alpha_composite(sheet.resize((sheet.width * S, sheet.height * S), Image.NEAREST))
prev.convert('RGB').save(sys.argv[1] if len(sys.argv) > 1 else 'sheet_preview.png')
