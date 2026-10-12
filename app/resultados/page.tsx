"use client";

import { useEffect, useMemo, useState } from "react";
import {
  actorLabels,
  labelMaps,
  type ActorTag,
  type SurveyPayload,
} from "../../lib/survey";

type StoredResponse = SurveyPayload & {
  id: string;
  createdAt: string;
  actorTags: ActorTag[];
};

type Summary = {
  total: number;
  actorCounts: Record<string, number>;
  actorFeelings: Record<string, Record<string, number>>;
  genderCounts: Record<string, number>;
  ageCounts: Record<string, number>;
  frequencyCounts: Record<string, number>;
  contextCounts: Record<string, number>;
  stayReasonCounts: Record<string, number>;
  difficultyCounts: Record<string, number>;
  feelingCounts: Record<string, number>;
  endingCounts: Record<string, number>;
};

function labelFor(group: keyof typeof labelMaps, value: string) {
  return labelMaps[group][value] ?? value;
}

function CountList({
  title,
  counts,
  group,
  total,
}: {
  title: string;
  counts: Record<string, number>;
  group: keyof typeof labelMaps | "actors";
  total: number;
}) {
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  return (
    <section className="result-block">
      <h2>{title}</h2>
      {entries.length ? (
        <div className="bar-list">
          {entries.map(([key, value]) => {
            const label =
              group === "actors"
                ? actorLabels[key as ActorTag] ?? key
                : labelFor(group, key);
            const percent = total ? Math.round((value / total) * 100) : 0;

            return (
              <div className="bar-row" key={key}>
                <div className="bar-label">
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
                <div className="bar-track">
                  <span style={{ width: `${Math.max(percent, 4)}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="empty-text">Sin respuestas todavía.</p>
      )}
    </section>
  );
}

function toCsvValue(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

function downloadCsv(rows: StoredResponse[]) {
  const headers = [
    "fecha",
    "genero",
    "edad",
    "frecuencia",
    "contexto",
    "roles",
    "motivos_para_quedarse",
    "dificultades",
    "sensaciones",
    "final",
    "actores_clasificados",
  ];
  const body = rows.map((row) =>
    [
      row.createdAt,
      labelFor("gender", row.gender),
      labelFor("ageRange", row.ageRange),
      labelFor("frequency", row.frequency),
      labelFor("mainContext", row.mainContext),
      row.roles.map((item) => labelFor("roles", item)).join("; "),
      row.stayReasons.map((item) => labelFor("stayReasons", item)).join("; "),
      row.difficulties.map((item) => labelFor("difficulties", item)).join("; "),
      row.feelings.map((item) => labelFor("feelings", item)).join("; "),
      labelFor("ending", row.ending),
      row.actorTags.map((item) => actorLabels[item]).join("; "),
    ]
      .map(toCsvValue)
      .join(",")
  );
  const csv = [headers.join(","), ...body].join("\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "respuestas-sobremesa.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export default function ResultsPage() {
  const [key, setKey] = useState("");
  const [submittedKey, setSubmittedKey] = useState("");
  const [responses, setResponses] = useState<StoredResponse[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlKey = params.get("clave") ?? "";
    setKey(urlKey);
    setSubmittedKey(urlKey);
  }, []);

  useEffect(() => {
    if (!submittedKey) {
      return;
    }

    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `/api/responses?key=${encodeURIComponent(submittedKey)}`
        );
        const data = (await response.json()) as {
          responses?: StoredResponse[];
          summary?: Summary;
          error?: string;
        };

        if (!response.ok) {
          throw new Error(data.error ?? "No se han podido cargar los datos.");
        }

        setResponses(data.responses ?? []);
        setSummary(data.summary ?? null);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Error inesperado");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [submittedKey]);

  const latest = useMemo(() => responses.slice(0, 8), [responses]);

  return (
    <main className="site-shell">
      <section className="results-layout">
        <header className="results-header">
          <div>
            <p className="eyebrow">Panel de datos</p>
            <h1>Resultados de la encuesta</h1>
            <p>
              Lectura rápida para completar el mapa de actores y detectar
              condiciones de permanencia, salida y participación.
            </p>
          </div>
          <form
            className="key-form"
            onSubmit={(event) => {
              event.preventDefault();
              setSubmittedKey(key);
            }}
          >
            <label htmlFor="key">Clave de acceso</label>
            <input
              id="key"
              onChange={(event) => setKey(event.target.value)}
              placeholder="Pega tu clave"
              type="password"
              value={key}
            />
            <button className="primary-button compact" type="submit">
              Ver datos
            </button>
          </form>
        </header>

        {loading ? <p className="status-text">Cargando respuestas...</p> : null}
        {error ? <p className="form-error">{error}</p> : null}

        {summary ? (
          <>
            <div className="metric-row">
              <div>
                <span>{summary.total}</span>
                <p>respuestas</p>
              </div>
              <div>
                <span>{Object.keys(summary.actorCounts).length}</span>
                <p>marcos detectados</p>
              </div>
              <button
                className="secondary-button"
                onClick={() => downloadCsv(responses)}
                type="button"
              >
                Descargar CSV
              </button>
            </div>

            <div className="results-grid">
              <CountList
                counts={summary.actorCounts}
                group="actors"
                title="Mapa de actores"
                total={summary.total}
              />
              <CountList
                counts={summary.feelingCounts}
                group="feelings"
                title="Cómo se sienten"
                total={summary.total}
              />
              <CountList
                counts={summary.contextCounts}
                group="mainContext"
                title="Contextos"
                total={summary.total}
              />
              <CountList
                counts={summary.stayReasonCounts}
                group="stayReasons"
                title="Qué favorece quedarse"
                total={summary.total}
              />
              <CountList
                counts={summary.difficultyCounts}
                group="difficulties"
                title="Qué lo dificulta"
                total={summary.total}
              />
              <CountList
                counts={summary.endingCounts}
                group="ending"
                title="Cómo termina"
                total={summary.total}
              />
            </div>

            <section className="result-block full">
              <h2>Últimas respuestas</h2>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Actor</th>
                      <th>Contexto</th>
                      <th>Sensación</th>
                      <th>Dificulta</th>
                    </tr>
                  </thead>
                  <tbody>
                    {latest.map((row) => (
                      <tr key={row.id}>
                        <td>
                          {row.actorTags.map((tag) => actorLabels[tag]).join(", ")}
                        </td>
                        <td>{labelFor("mainContext", row.mainContext)}</td>
                        <td>
                          {row.feelings
                            .map((item) => labelFor("feelings", item))
                            .join(", ")}
                        </td>
                        <td>
                          {row.difficulties
                            .map((item) => labelFor("difficulties", item))
                            .join(", ")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        ) : null}
      </section>
    </main>
  );
}
