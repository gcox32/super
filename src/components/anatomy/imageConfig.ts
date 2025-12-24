import { MuscleGroupName } from "@/types/anatomy";

const imagePath = '/images/anatomy';
const imagePathFront = `${imagePath}/front/svg`;
const imagePathBack = `${imagePath}/back/svg`;

export const muscleGroupImages: Record<MuscleGroupName, { front: string[], back: string[] }> = {
  'chest': {
    front: [`${imagePathFront}/pec-major.svg`],
    back: []
  },
  'anterior delts': {
    front: [`${imagePathFront}/deltoids.svg`],
    back: []
  },
  'lateral delts': {
    front: [`${imagePathFront}/deltoids.svg`],
    back: []
  },
  'posterior delts': {
    front: [],
    back: [`${imagePathBack}/deltoids.svg`]
  },
  'lats': {
    front: [`${imagePathFront}/serratus-anterior.svg`],
    back: [`${imagePathBack}/lattisimus-dorsi.svg`, `${imagePathBack}/teres-major.svg`, `${imagePathBack}/rhomboid-major.svg`]
  },
  'rhomboids': {
    front: [],
    back: [`${imagePathBack}/rhomboid-major.svg`, `${imagePathBack}/trapezius-lower.svg`, `${imagePathBack}/teres-major.svg`]
  },
  'traps': {
    front: [`${imagePathFront}/trapezius.svg`],
    back: [`${imagePathBack}/trapezius.svg`, `${imagePathBack}/lower-trapezius.svg`]
  },
  'spinal erectors': {
    front: [],
    back: [`${imagePathBack}/thoracolumbar-fascia.svg`]
  },
  'quadratus lumborum': {
    front: [],
    back: [`${imagePathBack}/serratus-anterior.svg`]
  },
  'biceps': {
    front: [`${imagePathFront}/biceps-brachii.svg`, `${imagePathFront}/brachialis.svg`],
    back: []
  },
  'triceps': {
    front: [`${imagePathFront}/triceps-long-head.svg`, `${imagePathFront}/triceps-medial-head.svg`],
    back: [`${imagePathBack}/triceps-brachii.svg`]
  },
  'forearms': {
    front: [
      `${imagePathFront}/brachioradialis.svg`,
      `${imagePathFront}/extensor-carpi-radialis.svg`,
      `${imagePathFront}/flexor-carpi-radialis.svg`
    ],
    back: [
      `${imagePathBack}/brachioradialis.svg`,
      `${imagePathBack}/extensor-carpi-radialis.svg`,
      `${imagePathBack}/flexor-carpi-radialis.svg`,
      `${imagePathBack}/flexor-carpi-ulnaris.svg`
    ]
  },
  'anterior core': {
    front: [`${imagePathFront}/rectus-abdominus.svg`, `${imagePathFront}/rectus-abdominus-lower.svg`],
    back: []
  },
  'obliques': {
    front: [`${imagePathFront}/external-obliques.svg`],
    back: [`${imagePathBack}/external-obliques.svg`]
  },
  'deep core': {
    front: [`${imagePathFront}/rectus-abdominus.svg`, `${imagePathFront}/rectus-abdominus-lower.svg`, `${imagePathFront}/external-obliques.svg`],
    back: [`${imagePathBack}/external-obliques.svg`]
  },
  'glutes': {
    front: [],
    back: [`${imagePathBack}/gluteus-maximus.svg`, `${imagePathBack}/gluteus-medius.svg`]
  },
  'hip flexors': {
    front: [`${imagePathFront}/sartorius.svg`, `${imagePathFront}/tensor-fascia-latae.svg`],
    back: [`${imagePathBack}/tensor-fascia-latae.svg`]
  },
  'quadriceps': {
    front: [`${imagePathFront}/rectus-femoris.svg`, `${imagePathFront}/vastus-lateralis.svg`, `${imagePathFront}/vastus-medialis.svg`],
    back: []
  },
  'hamstrings': {
    front: [],
    back: [`${imagePathBack}/biceps-femoris.svg`, `${imagePathBack}/semitendinosus.svg`, `${imagePathBack}/semitendinosus.svg`]
  },
  'adductors': {
    front: [`${imagePathFront}/add-longus.svg`],
    back: [`${imagePathBack}/add-gracilis.svg`, `${imagePathBack}/add-magnus.svg`]
  },
  'abductors': {
    front: [`${imagePathFront}/tensor-fascia-latae.svg`],
    back: [`${imagePathBack}/gluteus-medius.svg`, `${imagePathBack}/tensor-fascia-latae.svg`]
  },
  'calves': {
    front: [`${imagePathFront}/gastrocnemius.svg`, `${imagePathFront}/soleus.svg`],
    back: [`${imagePathBack}/gastroc-lateral.svg`, `${imagePathBack}/gastroc-medial.svg`, `${imagePathBack}/peroneus-longus.svg`]
  },
  'anterior tibialis': {
    front: [`${imagePathFront}/peroneus-longus.svg`, `${imagePathFront}/peroneus.svg`],
    back: []
  },
  'rotator cuff': {
    front: [],
    back: [`${imagePathBack}/infraspinatus.svg`]
  },
  'neck': {
    front: [`${imagePathFront}/sternocleidomastoid.svg`, `${imagePathFront}/omohyoid.svg`],
    back: []
  },
  'jaw': {
    front: [],
    back: []
  },
  'other': {
    front: [],
    back: []
  }
};

export const imageTransforms: Record<string, string> = {
  // Front view images that need translateX, translateY, and scale adjustments
  [`${imagePathFront}/pec-major.svg`]: 'translateX(9px)',
  [`${imagePathFront}/deltoids.svg`]: 'translateX(9px)',
  [`${imagePathFront}/triceps-long-head.svg`]: 'translateX(9px)',
  [`${imagePathFront}/triceps-medial-head.svg`]: 'translateX(9px)',
  [`${imagePathFront}/biceps-brachii.svg`]: 'translateX(7.5px)',
  [`${imagePathFront}/brachialis.svg`]: 'translateX(7.5px)',
  [`${imagePathFront}/brachioradialis.svg`]: 'translateX(7.5px)',
  [`${imagePathFront}/extensor-carpi-radialis.svg`]: 'translateX(5.5px)',
  [`${imagePathFront}/flexor-carpi-radialis.svg`]: 'translateX(8.5px)',
  [`${imagePathFront}/rectus-abdominus.svg`]: 'translateX(9.5px)',
  [`${imagePathFront}/rectus-abdominus-lower.svg`]: 'translateX(9.5px)',
  [`${imagePathFront}/external-obliques.svg`]: 'translateX(-1px) translateY(1px) scale(0.6',
  [`${imagePathFront}/rectus-femoris.svg`]: 'translateX(2px)',
  [`${imagePathFront}/vastus-lateralis.svg`]: 'translateX(2px)',
  [`${imagePathFront}/vastus-medialis.svg`]: 'translateX(2px)',
  [`${imagePathFront}/gastrocnemius.svg`]: 'translateX(5px)',
  [`${imagePathFront}/soleus.svg`]: 'translateX(1px)',
  [`${imagePathFront}/sartorius.svg`]: 'translateX(2px)',
  [`${imagePathFront}/tensor-fascia-latae.svg`]: 'translateX(2px)',
  [`${imagePathFront}/add-longus.svg`]: 'translateX(-1px) scale(0.6)',
  [`${imagePathFront}/serratus-anterior.svg`]: 'translateX(3px)',
  [`${imagePathFront}/trapezius.svg`]: 'translateX(8px)',
  [`${imagePathFront}/sternocleidomastoid.svg`]: 'translateX(8px)',
  [`${imagePathFront}/omohyoid.svg`]: 'translateX(8px)',
  [`${imagePathFront}/peroneus-longus.svg`]: 'translateX(2px)',
  [`${imagePathFront}/peroneus.svg`]: 'translateX(8px)',

  // Back view images that need translateX, translateY, and scale adjustments
  [`${imagePathBack}/gluteus-maximus.svg`]: 'translateX(0.5px) translateY(-0.5px)',
  [`${imagePathBack}/gluteus-medius.svg`]: 'translateX(0)',
  [`${imagePathBack}/infraspinatus.svg`]: 'translateX(0.5px)',
  [`${imagePathBack}/tensor-fascia-latae.svg`]: 'translateX(0)',
  [`${imagePathBack}/biceps-femoris.svg`]: 'translateX(0)',
  [`${imagePathBack}/gastroc-lateral.svg`]: 'translateX(0) translateY(1px)',
  [`${imagePathBack}/gastroc-medial.svg`]: 'translateX(0) translateY(1px)',
  [`${imagePathBack}/extensor-carpi-radialis.svg`]: 'translateX(0)',
  [`${imagePathBack}/flexor-carpi-radialis.svg`]: 'translateX(0)',
  [`${imagePathBack}/flexor-carpi-ulnaris.svg`]: 'translateX(-1.5px) translateY(-15px) scale(0.39) ',
  [`${imagePathBack}/brachioradialis.svg`]: 'translateX(0)',
  [`${imagePathBack}/lattisimus-dorsi.svg`]: '',
  [`${imagePathBack}/teres-major.svg`]: 'translateX(-0.5px)',
  [`${imagePathBack}/rhomboid-major.svg`]: '',
  [`${imagePathBack}/trapezius.svg`]: '',
  [`${imagePathBack}/lower-trapezius.svg`]: '',
  [`${imagePathBack}/thoracolumbar-fascia.svg`]: 'translateX(0)',
  [`${imagePathBack}/external-obliques.svg`]: 'translateX(0)',
  [`${imagePathBack}/add-gracilis.svg`]: 'translateX(0)',
  [`${imagePathBack}/add-magnus.svg`]: 'translateX(0)',
  [`${imagePathBack}/triceps-brachii.svg`]: 'translateX(0)',
  [`${imagePathBack}/semitendinosus.svg`]: 'translateX(-1px)',
  [`${imagePathBack}/peroneus-longus.svg`]: 'translateX(0.5px)',
};
