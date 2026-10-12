export const genderOptions = [
  { value: "mujer", label: "Mujer" },
  { value: "hombre", label: "Hombre" },
  { value: "no_binarie", label: "No binarie" },
  { value: "prefiero_no_decirlo", label: "Prefiero no decirlo" },
] as const;

export const ageOptions = [
  { value: "menos_18", label: "Menos de 18" },
  { value: "18_24", label: "18-24" },
  { value: "25_34", label: "25-34" },
  { value: "35_44", label: "35-44" },
  { value: "45_54", label: "45-54" },
  { value: "55_64", label: "55-64" },
  { value: "65_mas", label: "65 o más" },
  { value: "prefiero_no_decirlo", label: "Prefiero no decirlo" },
] as const;

export const frequencyOptions = [
  { value: "casi_siempre", label: "Casi siempre" },
  { value: "a_menudo", label: "A menudo" },
  { value: "a_veces", label: "A veces" },
  { value: "casi_nunca", label: "Casi nunca" },
] as const;

export const contextOptions = [
  { value: "familia", label: "Familia" },
  { value: "amistades", label: "Amistades" },
  { value: "restauracion", label: "Restauración" },
  { value: "celebraciones", label: "Celebraciones" },
  { value: "trabajo_estudios", label: "Trabajo o estudios" },
  { value: "no_suelo_hacer", label: "No suelo hacer sobremesa" },
] as const;

export const roleOptions = [
  { value: "participa", label: "Me suelo quedar y participar" },
  { value: "se_marcha", label: "Me suelo ir antes o prefiero no quedarme" },
  { value: "organiza", label: "Organizo o hago de anfitrion/a" },
  { value: "recoge_sirve", label: "Recojo, sirvo o atiendo a otros" },
  { value: "invitada", label: "Voy como invitado/a" },
  { value: "restauracion", label: "Trabajo o lo observo desde restauración" },
] as const;

export const stayReasonOptions = [
  { value: "conversacion", label: "Conversación cómoda" },
  { value: "cafe_postre", label: "Café, postre o sobremesa material" },
  { value: "sin_prisa", label: "No hay prisa" },
  { value: "confianza", label: "Confianza con el grupo" },
  { value: "juego_actividad", label: "Juegos, bromas o actividades" },
  { value: "costumbre", label: "Costumbre o celebración" },
  { value: "no_apetece", label: "Normalmente no me apetece quedarme" },
] as const;

export const difficultyOptions = [
  { value: "falta_tiempo", label: "Falta de tiempo" },
  { value: "cansancio", label: "Cansancio" },
  { value: "movil_tv", label: "Móvil o televisión" },
  { value: "tareas", label: "Recoger, servir o limpiar" },
  { value: "presion_espacio", label: "Presión del espacio o del restaurante" },
  { value: "incomodidad", label: "Incomodidad o poca confianza" },
  { value: "ruido", label: "Ruido o espacio poco cómodo" },
  { value: "nada", label: "Nada en especial" },
] as const;

export const feelingOptions = [
  { value: "conexion", label: "Con conexión" },
  { value: "comodidad", label: "Con comodidad" },
  { value: "neutral", label: "Neutral" },
  { value: "obligacion", label: "Con cierta obligación" },
  { value: "fuera", label: "Algo fuera del grupo" },
  { value: "ganas_irme", label: "Con ganas de irme" },
] as const;

export const endingOptions = [
  { value: "natural", label: "Se acaba de forma natural" },
  { value: "alguien_se_va", label: "Cuando alguien se levanta o se va" },
  { value: "anfitrion_cierra", label: "Cuando quien organiza marca el cierre" },
  { value: "tareas", label: "Cuando empiezan las tareas de recogida" },
  { value: "tiempo", label: "Por horarios, trabajo o cansancio" },
  { value: "restaurante", label: "Por presión del restaurante o del espacio" },
] as const;

export const actorLabels = {
  participante_habitual: "Participa habitualmente",
  se_marcha_o_no_participa: "Se marcha o prefiere no participar",
  organiza_anfitriona: "Organiza o hace de anfitrion/a",
  recoge_sirve: "Recoge, sirve o atiende",
  invitada: "Invitado/a",
  restauracion: "Restauración",
} as const;

export type ActorTag = keyof typeof actorLabels;

export type SurveyPayload = {
  gender: string;
  ageRange: string;
  frequency: string;
  mainContext: string;
  roles: string[];
  stayReasons: string[];
  difficulties: string[];
  feelings: string[];
  ending: string;
};

export const labelMaps = {
  gender: Object.fromEntries(genderOptions.map((item) => [item.value, item.label])),
  ageRange: Object.fromEntries(ageOptions.map((item) => [item.value, item.label])),
  frequency: Object.fromEntries(
    frequencyOptions.map((item) => [item.value, item.label])
  ),
  mainContext: Object.fromEntries(
    contextOptions.map((item) => [item.value, item.label])
  ),
  roles: Object.fromEntries(roleOptions.map((item) => [item.value, item.label])),
  stayReasons: Object.fromEntries(
    stayReasonOptions.map((item) => [item.value, item.label])
  ),
  difficulties: Object.fromEntries(
    difficultyOptions.map((item) => [item.value, item.label])
  ),
  feelings: Object.fromEntries(
    feelingOptions.map((item) => [item.value, item.label])
  ),
  ending: Object.fromEntries(endingOptions.map((item) => [item.value, item.label])),
};

export function classifyActors(payload: SurveyPayload): ActorTag[] {
  const tags = new Set<ActorTag>();

  if (
    payload.roles.includes("participa") ||
    ["casi_siempre", "a_menudo"].includes(payload.frequency)
  ) {
    tags.add("participante_habitual");
  }

  if (
    payload.roles.includes("se_marcha") ||
    payload.feelings.includes("ganas_irme") ||
    payload.feelings.includes("obligacion")
  ) {
    tags.add("se_marcha_o_no_participa");
  }

  if (payload.roles.includes("organiza")) {
    tags.add("organiza_anfitriona");
  }

  if (payload.roles.includes("recoge_sirve")) {
    tags.add("recoge_sirve");
  }

  if (payload.roles.includes("invitada")) {
    tags.add("invitada");
  }

  if (
    payload.roles.includes("restauracion") ||
    payload.mainContext === "restauracion" ||
    payload.ending === "restaurante"
  ) {
    tags.add("restauracion");
  }

  if (tags.size === 0) {
    tags.add("participante_habitual");
  }

  return Array.from(tags).slice(0, 2);
}
