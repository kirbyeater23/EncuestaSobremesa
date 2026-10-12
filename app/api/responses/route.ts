import { desc } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { getDb } from "../../../db";
import { surveyResponses } from "../../../db/schema";
import {
  actorLabels,
  classifyActors,
  type ActorTag,
  type SurveyPayload,
} from "../../../lib/survey";

type StoredResponse = SurveyPayload & {
  id: string;
  createdAt: string;
  actorTags: ActorTag[];
};

const requiredScalarFields = [
  "gender",
  "ageRange",
  "frequency",
  "mainContext",
  "ending",
] as const;

const requiredArrayFields = [
  "roles",
  "stayReasons",
  "difficulties",
  "feelings",
] as const;

function parseJsonArray(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function toStored(row: typeof surveyResponses.$inferSelect): StoredResponse {
  return {
    id: row.id,
    createdAt: row.createdAt,
    gender: row.gender,
    ageRange: row.ageRange,
    frequency: row.frequency,
    mainContext: row.mainContext,
    roles: parseJsonArray(row.roles),
    stayReasons: parseJsonArray(row.stayReasons),
    difficulties: parseJsonArray(row.difficulties),
    feelings: parseJsonArray(row.feelings),
    ending: row.ending,
    actorTags: parseJsonArray(row.actorTags) as ActorTag[],
  };
}

function validatePayload(payload: Partial<SurveyPayload>): string | null {
  for (const field of requiredScalarFields) {
    if (typeof payload[field] !== "string" || !payload[field]?.trim()) {
      return `Falta responder: ${field}`;
    }
  }

  for (const field of requiredArrayFields) {
    if (!Array.isArray(payload[field]) || payload[field]?.length === 0) {
      return `Falta responder: ${field}`;
    }
  }

  if ((payload.roles?.length ?? 0) > 2) {
    return "Elige como máximo dos roles.";
  }

  return null;
}

function countValues(rows: StoredResponse[], field: keyof SurveyPayload) {
  const counts: Record<string, number> = {};

  for (const row of rows) {
    const value = row[field];
    const values = Array.isArray(value) ? value : [value];

    for (const item of values) {
      counts[item] = (counts[item] ?? 0) + 1;
    }
  }

  return counts;
}

function summarize(rows: StoredResponse[]) {
  const actorCounts: Record<string, number> = {};
  const actorFeelings: Record<string, Record<string, number>> = {};

  for (const row of rows) {
    for (const tag of row.actorTags) {
      actorCounts[tag] = (actorCounts[tag] ?? 0) + 1;
      actorFeelings[tag] ??= {};

      for (const feeling of row.feelings) {
        actorFeelings[tag][feeling] = (actorFeelings[tag][feeling] ?? 0) + 1;
      }
    }
  }

  return {
    total: rows.length,
    actorCounts,
    actorLabels,
    actorFeelings,
    genderCounts: countValues(rows, "gender"),
    ageCounts: countValues(rows, "ageRange"),
    frequencyCounts: countValues(rows, "frequency"),
    contextCounts: countValues(rows, "mainContext"),
    stayReasonCounts: countValues(rows, "stayReasons"),
    difficultyCounts: countValues(rows, "difficulties"),
    feelingCounts: countValues(rows, "feelings"),
    endingCounts: countValues(rows, "ending"),
  };
}

function routeError(error: unknown) {
  const message = error instanceof Error ? error.message : "Error inesperado";

  if (message.includes("no such table")) {
    return "La tabla de respuestas todavía no está disponible. Vuelve a desplegar la web con la migración de D1.";
  }

  return message;
}

export async function GET(request: Request) {
  const key = new URL(request.url).searchParams.get("key");

  if (!env.ADMIN_KEY || key !== env.ADMIN_KEY) {
    return Response.json({ error: "Clave no válida." }, { status: 401 });
  }

  try {
    const db = getDb();
    const rows = await db
      .select()
      .from(surveyResponses)
      .orderBy(desc(surveyResponses.createdAt))
      .limit(1000);
    const responses = rows.map(toStored);

    return Response.json({ responses, summary: summarize(responses) });
  } catch (error) {
    return Response.json({ error: routeError(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Partial<SurveyPayload>;
    const validationError = validatePayload(payload);

    if (validationError) {
      return Response.json({ error: validationError }, { status: 400 });
    }

    const cleanPayload = payload as SurveyPayload;
    const actorTags = classifyActors(cleanPayload);
    const db = getDb();

    await db.insert(surveyResponses).values({
      id: crypto.randomUUID(),
      gender: cleanPayload.gender,
      ageRange: cleanPayload.ageRange,
      frequency: cleanPayload.frequency,
      mainContext: cleanPayload.mainContext,
      roles: JSON.stringify(cleanPayload.roles),
      stayReasons: JSON.stringify(cleanPayload.stayReasons),
      difficulties: JSON.stringify(cleanPayload.difficulties),
      feelings: JSON.stringify(cleanPayload.feelings),
      ending: cleanPayload.ending,
      actorTags: JSON.stringify(actorTags),
    });

    return Response.json({ actorTags }, { status: 201 });
  } catch (error) {
    return Response.json({ error: routeError(error) }, { status: 500 });
  }
}
