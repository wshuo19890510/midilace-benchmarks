# Midilace Benchmarks

Evaluation data and measurement scripts for browser-based audio-to-MIDI transcription.

This repository contains the measured cases used to validate the Midilace converter, a browser tool that runs Spotify Basic Pitch locally to estimate note pitches and timing from audio or video files.

## What is here

- **`data/`** — CSV exports of measured evaluations against published datasets (GuitarSet, URMP, Bach WTC).
- **`scripts/`** — Reusable scripts for auditing a converter's output against a ground-truth MIDI file.

## Datasets

| Case | Source | Annotated notes | Notes found | Extra events | Mean onset error |
|------|--------|-----------------|-------------|--------------|------------------|
| Acoustic guitar (12 s) | GuitarSet `00_BN1-129-Eb_solo_mic.wav` | 45 | 41 | 27 | 15–17 ms |
| Voice (hummed, 4 s) | Vocadito `01-d-am2.wav` | 31 | 25 | 22 | ~20 ms |
| Piano (4 s) | Bach WTC I Prelude in C | 4 | 4 | 5 | ~12 ms |
| Synthetic (3.6 s) | Generated sine sweep | 5 | 5 | 7 | <5 ms |

A note counts as "found" when the exported pitch matches and the onset lands within 80 ms of the annotation. Extra events are exported MIDI notes with no matching annotation.

## Using the audit script

```bash
node scripts/note-audit.js ground-truth.mid output.mid
```

The script prints:
- matched count, missed count, extra count
- mean and worst onset error
- mean note duration difference

It requires Node.js and reads MIDI files with `@tonejs/midi`.

## Ground-truth files

The original audio and annotated MIDI files come from publicly available datasets:

- **GuitarSet** — [zenodo.org/records/3371780](https://zenodo.org/records/3371780) (CC BY 4.0)
- **Vocadito** — [zenodo.org/records/5524765](https://zenodo.org/records/5524765)
- **Bach WTC** — public-domain scores, performed and recorded for this test

The input MP3, exported MIDI, and annotated ground-truth MIDI for each case are available from the [Midilace test files page](https://midilace.com/test-files/).

## Acknowledgments

- [GuitarSet](https://zenodo.org/records/3371780) — Qingyang Xi et al., MARL @ NYU
- [Vocadito](https://zenodo.org/records/5524765) — Bittner et al., Spotify / IRCAM
- [Basic Pitch](https://github.com/spotify/basic-pitch) — Spotify Audio Intelligence Lab

These datasets and models made reproducible browser-based evaluation possible.

## License

MIT. The evaluation data and scripts are independent of the datasets they reference; the datasets retain their original licenses.
