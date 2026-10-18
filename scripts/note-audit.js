#!/usr/bin/env node
// Audit a MIDI file against a ground-truth MIDI.
// A note matches when pitch is equal and onset difference is within tolerance.
// Usage: node note-audit.js ground-truth.mid output.mid [tolerance-ms]

import pkg from '@tonejs/midi';
import { readFileSync } from 'fs';
const { Midi } = pkg;

const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Usage: node note-audit.js ground-truth.mid output.mid [tolerance-ms]');
  process.exit(1);
}

const [truthPath, outputPath, toleranceArg] = args;
const tolerance = Number(toleranceArg) || 80; // ms

function loadNotes(path) {
  const buf = readFileSync(path);
  const midi = new Midi(buf);
  const notes = [];
  for (const track of midi.tracks) {
    for (const note of track.notes) {
      notes.push({
        midi: note.midi,
        time: note.time,
        duration: note.duration,
        velocity: note.velocity
      });
    }
  }
  return notes.sort((a, b) => a.time - b.time || a.midi - b.midi);
}

function audit(truth, output, tolMs) {
  const tolS = tolMs / 1000;
  const matched = [];
  const missed = [];
  const used = new Set();

  for (const t of truth) {
    const idx = output.findIndex((o, i) =>
      !used.has(i) && o.midi === t.midi && Math.abs(o.time - t.time) <= tolS
    );
    if (idx >= 0) {
      used.add(idx);
      matched.push({ truth: t, output: output[idx] });
    } else {
      missed.push(t);
    }
  }

  const extra = output.filter((_, i) => !used.has(i));

  const onsetErrors = matched.map(m => Math.abs(m.output.time - m.truth.time));
  const meanOnset = onsetErrors.length
    ? onsetErrors.reduce((a, b) => a + b, 0) / onsetErrors.length
    : 0;
  const worstOnset = onsetErrors.length ? Math.max(...onsetErrors) : 0;

  const durDiffs = matched.map(m => m.output.duration - m.truth.duration);
  const meanDurDiff = durDiffs.length
    ? durDiffs.reduce((a, b) => a + b, 0) / durDiffs.length
    : 0;

  return {
    truthCount: truth.length,
    matchedCount: matched.length,
    missedCount: missed.length,
    extraCount: extra.length,
    meanOnsetErrorMs: Math.round(meanOnset * 1000 * 10) / 10,
    worstOnsetErrorMs: Math.round(worstOnset * 1000 * 10) / 10,
    meanDurationDiffMs: Math.round(meanDurDiff * 1000 * 10) / 10,
    matchedRate: truth.length ? matched.length / truth.length : 0,
    extraRate: output.length ? extra.length / output.length : 0
  };
}

const truthNotes = loadNotes(truthPath);
const outputNotes = loadNotes(outputPath);
const result = audit(truthNotes, outputNotes, tolerance);

console.log(`Truth notes:      ${result.truthCount}`);
console.log(`Matched:          ${result.matchedCount} (${(result.matchedRate * 100).toFixed(1)}%)`);
console.log(`Missed:           ${result.missedCount}`);
console.log(`Extra events:     ${result.extraCount} (${(result.extraRate * 100).toFixed(1)}%)`);
console.log(`Mean onset error: ${result.meanOnsetErrorMs} ms`);
console.log(`Worst onset error: ${result.worstOnsetErrorMs} ms`);
console.log(`Mean duration diff: ${result.meanDurationDiffMs} ms`);
