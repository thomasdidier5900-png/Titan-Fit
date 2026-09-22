import { ExerciseTemplate } from '../types/fitness';

export const RAW_DEFAULT_CSV = `Jour,Séance,Exercice,Groupe Musculaire,Piste Sollicitée,Séries,Répétitions,Charge / Matériel,RIR,Repos
Jour 1,PULL 1,Tirage unilatéral coude ouvert (Buste penché),Grand Dorsal & Deltoïde Post.,Piste Externe (Étirement),4,10 - 12,Haltère 10 - 12 kg,1 - 2,"1'30"""
Jour 1,PULL 1,Pull-Over au sol aux haltères (Floor Pull-over),Grand Dorsal (Chef long),Piste Externe / Interne,4,10 - 12,Haltère 10 - 12 kg,1 - 2,"1'30"""
Jour 1,PULL 1,Oiseau au sol / Buste penché,Deltoïde Postérieur,Piste Interne (Raccourcissement),4,12 - 15,Haltères 4 - 6 kg,1,"1'15"""
Jour 1,PULL 1,Élévations latérales buste penché à 45°,Deltoïde Moyen,Piste Externe (Tension étirement),4,10 - 12,Haltères 4 - 5 kg,1 - 2,"1'15"""
Jour 1,PULL 1,Curl Incliné (Dos appuyé contre lit/canapé),Biceps (Chef long),Piste Externe (Étirement),3,10 - 12,Haltères 6 - 8 kg,1,"1'15"""
Jour 1,PULL 1,Curl Concentré ou Curl Marteau Supiné,Biceps (Brachial / Court chef),Piste Interne (Raccourcissement),3,10 - 12,Haltères 8 - 10 kg,1,"1'15"""
Jour 2,PUSH 1,Pompes pieds surélevés avec gilet lesté,Pectoraux (Haut) & Delt. Ant.,Piste Externe (Étirement profond),4,8 - 10,Gilet lesté 5 - 10 kg,1 - 2,"1'30"" à 2'"
Jour 2,PUSH 1,Floor Press avec pont fessier (Glute Bridge Press),Pectoraux (Bas/Moyen) & Triceps,Piste Interne (Contraction maximale),4,10 - 12,Haltères 12 kg,1 - 2,"1'30"""
Jour 2,PUSH 1,Dips pieds au sol avec pause en bas,Pectoraux & Triceps,Piste Externe (Tension d'étirement),3,10 - 12,Poids du corps / Gilet,1,"1'30"""
Jour 2,PUSH 1,Extension Triceps overhead à 1 haltère,Triceps (Chef long),Piste Externe (Étirement),4,10 - 12,Haltère 10 - 12 kg,1,"1'15"""
Jour 2,PUSH 1,Floor Tate Press / Kickback coude haut,Triceps (Vaste externe/interne),Piste Interne (Raccourcissement),3,10 - 12,Haltères 6 - 8 kg,1,"1'15"""
Jour 3,CORE 1,Hollow Body Hold (avec gilet ou bras tendus),Transverse & Grand Droit,Piste Externe (Tension isotherme),4,"35"" - 45""",Gilet 2 - 5 kg / Poids corps,1 - 2,"1'15"""
Jour 3,CORE 1,Crunch Inversé avec relevé de bassin au sommet,Grand Droit (Partie basse),Piste Interne (Enroulement complet),4,10 - 12,Poids du corps,1,"1'15"""
Jour 3,CORE 1,Planche latérale dynamique (Abaissement/Élévation),Transverse & Obliques,Piste Externe/Interne combinée,4,10 - 12 / côté,Poids du corps,1,"1'15"""
Jour 3,CORE 1,Élévations latérales debout (Focus deltoïde moyen),Deltoïde Moyen,Piste Interne (Contraction haute),4,10 - 12,Haltères 4 - 6 kg,1,"1'15"""
Jour 4,PULL 2,Tirage horizontal à 2 haltères (Prise neutre),Grand Dorsal (Épaisseur),Piste Interne (Coudes tirés loin derrière),4,10 - 12,Haltères 10 - 12 kg,1 - 2,"1'30"""
Jour 4,PULL 2,Pull-Over au sol avec emphase sur l'étirement,Grand Dorsal,Piste Externe (Étirement maximal),4,10 - 12,Haltère 10 - 12 kg,1 - 2,"1'30"""
Jour 4,PULL 2,Oiseau au sol / Buste penché,Deltoïde Postérieur,Piste Interne,4,12 - 15,Haltères 4 - 6 kg,1,"1'15"""
Jour 4,PULL 2,Élévations latérales allongées sur le côté au sol,Deltoïde Moyen,Piste Externe (Tension de départ élevée),4,10 - 12 / côté,Haltères 4 kg,1 - 2,"1'15"""
Jour 4,PULL 2,Curl Marteau buste droit,Brachial antérieur / Biceps,Piste Interne / Neutre,3,10 - 12,Haltères 8 - 10 kg,1,"1'15"""
Jour 4,PULL 2,Curl Incliné (Dos appuyé),Biceps (Chef long),Piste Externe,3,10 - 12,Haltères 6 - 8 kg,1,"1'15"""
Jour 5,PUSH 2,Pompes classiques lestées avec gilet,Pectoraux & Triceps,Piste Externe/Interne globale,4,8 - 12,Gilet 5 - 10 kg,1 - 2,"1'30"""
Jour 5,PUSH 2,Floor Press neutre à resserrer en haut,Pectoraux (Partie centrale),Piste Interne (Rapprochement des mains),4,10 - 12,Haltères 12 kg,1 - 2,"1'30"""
Jour 5,PUSH 2,Dips pieds au sol avec gilet,Pectoraux (Bas) & Triceps,Piste Externe,3,10 - 12,Gilet lesté,1,"1'30"""
Jour 5,PUSH 2,Extension Triceps au-dessus de la tête,Triceps (Chef long),Piste Externe,4,10 - 12,Haltère 10 - 12 kg,1,"1'15"""
Jour 5,PUSH 2,Pompes mains rapprochées (Diamant / Triceps),Triceps (Chef latéral),Piste Interne,3,10 - 12,Poids corps / Gilet léger,1,"1'15"""
Jour 6,CORE 2,Crunch lesté au sol (Haltère sur poitrine),Grand Droit (Partie haute),Piste Interne (Raccourcissement complet),4,10 - 12,Haltère 5 - 10 kg,1 - 2,"1'15"""
Jour 6,CORE 2,Planche frontale avec aspiration du nombril (Vacuum),Transverse,Piste Externe / Isométrie profonde,4,"40"" - 50""",Poids du corps,1,"1'15"""
Jour 6,CORE 2,Crunch Inversé lent (Contrôle 3s descente),Grand Droit,Piste Externe (Tension excentrique),4,10 - 12,Poids du corps,1,"1'15"""
Jour 6,CORE 2,Élévations latérales buste légèrement penché,Deltoïde Moyen,Piste Interne,4,10 - 12,Haltères 4 - 6 kg,1,"1'15"""
Jour 7,REPOS,Récupération complète / Mobilisation douce,Tous les groupes,Mobilité globale,-,-,Poids du corps,-,-`;

// Parses rest string like "1'30""", "1'15""", "2'", "45"" into seconds
export function parseRestSeconds(raw: string): number {
  if (!raw || raw.trim() === '-' || raw.trim() === '') return 60;
  const clean = raw.replace(/"/g, '').trim();
  
  // Pattern: 1'30 or 1'15 or 2' or 45s
  if (clean.includes("'")) {
    const parts = clean.split("'");
    const minutes = parseInt(parts[0], 10) || 0;
    // Check if parts[1] has seconds or range like "30 à 2"
    let seconds = 0;
    if (parts[1]) {
      const match = parts[1].match(/\d+/);
      if (match) {
        seconds = parseInt(match[0], 10);
      }
    }
    return minutes * 60 + seconds;
  }
  
  const numMatch = clean.match(/\d+/);
  if (numMatch) {
    const val = parseInt(numMatch[0], 10);
    return val <= 5 ? val * 60 : val;
  }

  return 60;
}

// Parses default weight in kg from load string
export function parseDefaultWeight(loadStr: string): number {
  if (!loadStr) return 0;
  // Match highest number or single number
  const matches = loadStr.match(/(\d+(?:\.\d+)?)\s*(?:kg)?/gi);
  if (matches && matches.length > 0) {
    // take the last matched number (e.g. "10 - 12 kg" => 12)
    const nums = loadStr.match(/\d+(?:\.\d+)?/g);
    if (nums && nums.length > 0) {
      return parseFloat(nums[nums.length - 1]);
    }
  }
  return 0;
}

// Parse target reps into a default number for input fields
export function parseTargetRepsCount(repsStr: string): number {
  if (!repsStr) return 10;
  // e.g. "10 - 12" -> 10, "35"" - 45""" -> 35
  const matches = repsStr.match(/\d+/g);
  if (matches && matches.length > 0) {
    return parseInt(matches[0], 10);
  }
  return 10;
}

// Robust CSV Line parser handling quotes
export function parseCSVToExercises(csvText: string): ExerciseTemplate[] {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length <= 1) return [];

  const exercises: ExerciseTemplate[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const row: string[] = [];
    let insideQuote = false;
    let entry = '';

    for (let charIndex = 0; charIndex < line.length; charIndex++) {
      const char = line[charIndex];
      if (char === '"') {
        insideQuote = !insideQuote;
      } else if (char === ',' && !insideQuote) {
        row.push(entry.trim());
        entry = '';
      } else {
        entry += char;
      }
    }
    row.push(entry.trim());

    if (row.length >= 3) {
      const day = row[0] || `Jour ${i}`;
      const session = row[1] || 'SÉANCE';
      const name = row[2] || 'Exercice inconnu';
      const muscleGroup = row[3] || 'Général';
      const track = row[4] || '-';
      const sets = parseInt(row[5], 10) || (session.includes('REPOS') ? 0 : 4);
      const reps = row[6] || '10 - 12';
      const load = row[7] || 'Poids du corps';
      const rir = row[8] || '1 - 2';
      const rawRest = row[9] || "1'15\"";

      exercises.push({
        id: `ex_${i}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        day,
        session,
        name,
        muscleGroup,
        track,
        sets,
        reps,
        load,
        defaultWeight: parseDefaultWeight(load),
        rir,
        restSeconds: parseRestSeconds(rawRest),
        rawRest
      });
    }
  }

  return exercises;
}

export function exportExercisesToCSV(exercises: ExerciseTemplate[]): string {
  const header = 'Jour,Séance,Exercice,Groupe Musculaire,Piste Sollicitée,Séries,Répétitions,Charge / Matériel,RIR,Repos';
  const rows = exercises.map(ex => {
    const escapeCsv = (val: string | number) => {
      const s = String(val ?? '');
      if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };

    return [
      escapeCsv(ex.day),
      escapeCsv(ex.session),
      escapeCsv(ex.name),
      escapeCsv(ex.muscleGroup),
      escapeCsv(ex.track),
      escapeCsv(ex.sets),
      escapeCsv(ex.reps),
      escapeCsv(ex.load),
      escapeCsv(ex.rir),
      escapeCsv(ex.rawRest || `${Math.floor(ex.restSeconds / 60)}'${(ex.restSeconds % 60).toString().padStart(2, '0')}"`)
    ].join(',');
  });

  return [header, ...rows].join('\n');
}

export const INITIAL_EXERCISES: ExerciseTemplate[] = parseCSVToExercises(RAW_DEFAULT_CSV);
