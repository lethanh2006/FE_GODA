"""Generate deployable Japanese MP3s. Run with edge-tts==7.3.1 and mutagen==1.48.1.

python generate-dung-mori.py path/to/dung-mori-n4.json [path/to/expanded-catalog.json]
Resumes valid existing files. The website never calls the synthesis service.
"""
import asyncio
import hashlib
import json
import re
import sys
from pathlib import Path

import edge_tts
from mutagen.mp3 import MP3

ROOT = Path(__file__).resolve().parents[2]
VOICE = 'ja-JP-NanamiNeural'
OUTPUT = ROOT / 'public/audio/ja-nanami-v1'
MANIFEST = ROOT / 'src/lib/data/japanese-audio.json'


def normalize(text):
    return re.sub(r'[（()）]', '', text).strip()


def catalog_texts(catalog):
    texts = set()
    for deck in catalog['decks']:
        for card in deck['cards']:
            reading = card.get('reading') or card.get('furigana') or card['term']
            texts.add(normalize(re.sub(r'\{([^|{}]+)\|([^|{}]+)\}', r'\2', reading)))
            for example in card.get('examples', []):
                texts.add(normalize(re.sub(r'\{([^|{}]+)\|([^|{}]+)\}', r'\1', example['ja'])))
    return sorted(text for text in texts if text)


def valid(path):
    try:
        return MP3(path).info.length > 0
    except Exception:
        return False


async def main():
    if len(sys.argv) < 2:
        raise SystemExit('Usage: generate-dung-mori.py catalog.json [expanded-catalog.json]')
    texts = sorted({
        text
        for filename in sys.argv[1:]
        for text in catalog_texts(json.loads(Path(filename).read_text()))
    })
    OUTPUT.mkdir(parents=True, exist_ok=True)
    semaphore = asyncio.Semaphore(8)
    completed = 0

    async def generate(text):
        nonlocal completed
        filename = hashlib.sha256(text.encode()).hexdigest()[:24] + '.mp3'
        path = OUTPUT / filename
        async with semaphore:
            if not valid(path):
                for attempt in range(4):
                    temporary = path.with_suffix('.tmp.mp3')
                    try:
                        await asyncio.wait_for(edge_tts.Communicate(text, VOICE).save(str(temporary)), 45)
                        if not valid(temporary):
                            raise ValueError('Invalid MP3')
                        temporary.replace(path)
                        break
                    except Exception:
                        temporary.unlink(missing_ok=True)
                        if attempt == 3:
                            raise
                        await asyncio.sleep(2 ** attempt)
            completed += 1
            if completed % 100 == 0 or completed == len(texts):
                print(f'{completed}/{len(texts)} MP3s validated', flush=True)
        return text, '/audio/ja-nanami-v1/' + filename

    entries = await asyncio.gather(*(generate(text) for text in texts))
    MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST.write_text(json.dumps(dict(entries), ensure_ascii=False, indent=2) + '\n')
    print(f'Ready: {len(entries)} files, {sum(p.stat().st_size for p in OUTPUT.glob("*.mp3")) / 1024 / 1024:.1f} MiB', flush=True)


if __name__ == '__main__':
    asyncio.run(main())
