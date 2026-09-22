import React, { useState, useEffect } from 'react';
import { X, Check, Dumbbell, Clock, Layers, Sparkles } from 'lucide-react';
import { ExerciseTemplate } from '../types/fitness';
import { parseDefaultWeight } from '../data/defaultProgram';

interface EditExerciseModalProps {
  isOpen: boolean;
  exercise: ExerciseTemplate | null;
  onClose: () => void;
  onSaveExercise: (updated: ExerciseTemplate) => void;
}

export const EditExerciseModal: React.FC<EditExerciseModalProps> = ({
  isOpen,
  exercise,
  onClose,
  onSaveExercise,
}) => {
  const [name, setName] = useState('');
  const [muscleGroup, setMuscleGroup] = useState('');
  const [track, setTrack] = useState('');
  const [sets, setSets] = useState(4);
  const [reps, setReps] = useState('10 - 12');
  const [load, setLoad] = useState('10 kg');
  const [defaultWeight, setDefaultWeight] = useState(10);
  const [rir, setRir] = useState('1 - 2');
  const [restSeconds, setRestSeconds] = useState(90);

  useEffect(() => {
    if (exercise) {
      setName(exercise.name || '');
      setMuscleGroup(exercise.muscleGroup || '');
      setTrack(exercise.track || '');
      setSets(exercise.sets || 4);
      setReps(exercise.reps || '10 - 12');
      setLoad(exercise.load || '10 kg');
      setDefaultWeight(exercise.defaultWeight || parseDefaultWeight(exercise.load || '10 kg'));
      setRir(exercise.rir || '1 - 2');
      setRestSeconds(exercise.restSeconds || 90);
    }
  }, [exercise]);

  if (!isOpen || !exercise) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const updated: ExerciseTemplate = {
      ...exercise,
      name: name.trim(),
      muscleGroup: muscleGroup.trim() || 'Général',
      track: track.trim() || '-',
      sets: Math.max(1, Number(sets) || 1),
      reps: reps.trim() || '10 - 12',
      load: load.trim() || `${defaultWeight} kg`,
      defaultWeight: Number(defaultWeight) || parseDefaultWeight(load),
      rir: rir.trim() || '1 - 2',
      restSeconds: Math.max(15, Number(restSeconds) || 60),
      rawRest: `${Math.floor(restSeconds / 60)}'${(restSeconds % 60).toString().padStart(2, '0')}"`,
    };

    onSaveExercise(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#151515] border border-zinc-800 rounded-2xl w-full max-w-md p-5 max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#BCE029]/15 border border-[#BCE029]/40 flex items-center justify-center text-[#BCE029]">
              <Dumbbell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">Modifier l'exercice</h3>
              <p className="text-[10px] text-zinc-400">
                {exercise.day} · {exercise.session}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {/* Exercise Name */}
          <div>
            <label className="text-zinc-400 block mb-1 font-semibold">Nom de l'exercice *</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-black/70 border border-zinc-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#BCE029]"
            />
          </div>

          {/* Muscle group & Track */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-zinc-400 block mb-1">Groupe musculaire</label>
              <input
                type="text"
                value={muscleGroup}
                onChange={e => setMuscleGroup(e.target.value)}
                className="w-full bg-black/70 border border-zinc-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#BCE029]"
              />
            </div>
            <div>
              <label className="text-zinc-400 block mb-1">Piste sollicitée</label>
              <input
                type="text"
                value={track}
                onChange={e => setTrack(e.target.value)}
                className="w-full bg-black/70 border border-zinc-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#BCE029]"
              />
            </div>
          </div>

          {/* Sets, Reps & Rest */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-zinc-400 block mb-1">Séries</label>
              <input
                type="number"
                min={1}
                max={12}
                value={sets}
                onChange={e => setSets(parseInt(e.target.value, 10) || 1)}
                className="w-full bg-black/70 border border-zinc-800 rounded-xl p-2.5 text-white text-center font-mono-numbers focus:outline-none focus:border-[#BCE029]"
              />
            </div>
            <div>
              <label className="text-zinc-400 block mb-1">Répétitions</label>
              <input
                type="text"
                value={reps}
                onChange={e => setReps(e.target.value)}
                className="w-full bg-black/70 border border-zinc-800 rounded-xl p-2.5 text-white text-center focus:outline-none focus:border-[#BCE029]"
              />
            </div>
            <div>
              <label className="text-zinc-400 block mb-1">Repos (sec)</label>
              <input
                type="number"
                step={5}
                min={15}
                max={600}
                value={restSeconds}
                onChange={e => setRestSeconds(parseInt(e.target.value, 10) || 60)}
                className="w-full bg-black/70 border border-zinc-800 rounded-xl p-2.5 text-white text-center font-mono-numbers focus:outline-none focus:border-[#FF6D00]"
              />
            </div>
          </div>

          {/* Quick presets for Rest */}
          <div className="flex items-center gap-1.5 pt-0.5">
            <span className="text-[10px] text-zinc-500 font-medium">Préréglage repos :</span>
            {[60, 75, 90, 120, 180].map(sec => (
              <button
                key={sec}
                type="button"
                onClick={() => setRestSeconds(sec)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono-numbers transition ${
                  restSeconds === sec
                    ? 'bg-[#FF6D00] text-black font-bold'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {sec}s
              </button>
            ))}
          </div>

          {/* Load & RIR */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="text-zinc-400 block mb-1">Charge / Matériel</label>
              <input
                type="text"
                value={load}
                onChange={e => {
                  setLoad(e.target.value);
                  const parsed = parseDefaultWeight(e.target.value);
                  if (parsed > 0) setDefaultWeight(parsed);
                }}
                className="w-full bg-black/70 border border-zinc-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#BCE029]"
              />
            </div>
            <div>
              <label className="text-zinc-400 block mb-1">Poids (kg)</label>
              <input
                type="number"
                step={0.5}
                value={defaultWeight}
                onChange={e => setDefaultWeight(parseFloat(e.target.value) || 0)}
                className="w-full bg-black/70 border border-zinc-800 rounded-xl p-2.5 text-white text-center font-mono-numbers focus:outline-none focus:border-[#BCE029]"
              />
            </div>
          </div>

          <div>
            <label className="text-zinc-400 block mb-1">RIR cible</label>
            <input
              type="text"
              value={rir}
              onChange={e => setRir(e.target.value)}
              className="w-full bg-black/70 border border-zinc-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#BCE029]"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white font-medium text-xs transition active:scale-95"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-[#BCE029] hover:bg-[#A8CE1E] text-black font-extrabold text-xs shadow-md shadow-[#BCE029]/20 transition active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Sauvegarder</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
