"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  actorLabels,
  ageOptions,
  contextOptions,
  difficultyOptions,
  endingOptions,
  feelingOptions,
  frequencyOptions,
  genderOptions,
  roleOptions,
  stayReasonOptions,
  type ActorTag,
  type SurveyPayload,
} from "../lib/survey";

const initialForm: SurveyPayload = {
  gender: "",
  ageRange: "",
  frequency: "",
  mainContext: "",
  roles: [],
  stayReasons: [],
  difficulties: [],
  feelings: [],
  ending: "",
};

function ToggleGroup({
  label,
  helper,
  values,
  options,
  max,
  onChange,
}: {
  label: string;
  helper?: string;
  values: string[];
  options: readonly { value: string; label: string }[];
  max?: number;
  onChange: (values: string[]) => void;
}) {
  function toggle(value: string) {
    if (values.includes(value)) {
      onChange(values.filter((item) => item !== value));
      return;
    }

    if (max && values.length >= max) {
      onChange([...values.slice(1), value]);
      return;
    }

    onChange([...values, value]);
  }

  return (
    <fieldset className="question-block">
      <legend>{label}</legend>
      {helper ? <p className="question-helper">{helper}</p> : null}
      <div className="option-grid">
        {options.map((option) => (
          <button
            aria-pressed={values.includes(option.value)}
            className="option-button"
            key={option.value}
            onClick={() => toggle(option.value)}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function RadioGroup({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <fieldset className="question-block">
      <legend>{label}</legend>
      <div className="option-grid">
        {options.map((option) => (
          <button
            aria-pressed={value === option.value}
            className="option-button"
            key={option.value}
            onClick={() => onChange(option.value)}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export default function Home() {
  const [form, setForm] = useState<SurveyPayload>(initialForm);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");
  const [actorTags, setActorTags] = useState<ActorTag[]>([]);

  const progress = useMemo(() => {
    const fields = [
      form.gender,
      form.ageRange,
      form.frequency,
      form.mainContext,
      form.ending,
      form.roles.length,
      form.stayReasons.length,
      form.difficulties.length,
      form.feelings.length,
    ];

    return Math.round(
      (fields.filter((field) => Boolean(field)).length / fields.length) * 100
    );
  }, [form]);

  function update<K extends keyof SurveyPayload>(
    field: K,
    value: SurveyPayload[K]
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setMessage("");

    try {
      const response = await fetch("/api/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = (await response.json()) as {
        actorTags?: ActorTag[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(result.error ?? "No se ha podido guardar la respuesta.");
      }

      setActorTags(result.actorTags ?? []);
      setStatus("done");
      setForm(initialForm);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Error inesperado");
    }
  }

  if (status === "done") {
    return (
      <main className="site-shell">
        <section className="success-panel">
          <p className="eyebrow">Encuesta enviada</p>
          <h1>Gracias por responder.</h1>
          <p>
            Tu respuesta se ha guardado de forma anónima y ayudará a clasificar
            distintos papeles dentro de la sobremesa.
          </p>
          {actorTags.length ? (
            <div className="tag-row">
              {actorTags.map((tag) => (
                <span className="actor-tag" key={tag}>
                  {actorLabels[tag]}
                </span>
              ))}
            </div>
          ) : null}
          <button
            className="primary-button"
            onClick={() => {
              setStatus("idle");
              setActorTags([]);
            }}
            type="button"
          >
            Enviar otra respuesta
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="site-shell">
      <section className="survey-layout">
        <aside className="intro-panel">
          <p className="eyebrow">Sobremesa y comunidad</p>
          <h1>Encuesta breve sobre la sobremesa</h1>
          <p>
            Responde según tu experiencia habitual. Es anónima, no recoge nombres
            ni correos, y tarda menos de dos minutos.
          </p>
          <div className="progress-wrap" aria-label={`Progreso ${progress}%`}>
            <span style={{ width: `${progress}%` }} />
          </div>
          <p className="small-note">
            Las respuestas ayudan a entender quién permanece, quién se marcha,
            quién organiza y qué condiciones favorecen o dificultan ese tiempo.
          </p>
        </aside>

        <form className="survey-form" onSubmit={submit}>
          <RadioGroup
            label="Género"
            onChange={(value) => update("gender", value)}
            options={genderOptions}
            value={form.gender}
          />

          <RadioGroup
            label="Rango de edad"
            onChange={(value) => update("ageRange", value)}
            options={ageOptions}
            value={form.ageRange}
          />

          <RadioGroup
            label="¿Con qué frecuencia haces sobremesa?"
            onChange={(value) => update("frequency", value)}
            options={frequencyOptions}
            value={form.frequency}
          />

          <RadioGroup
            label="¿En qué contexto ocurre más a menudo?"
            onChange={(value) => update("mainContext", value)}
            options={contextOptions}
            value={form.mainContext}
          />

          <ToggleGroup
            helper="Elige hasta dos."
            label="¿Qué papel sueles tener?"
            max={2}
            onChange={(values) => update("roles", values)}
            options={roleOptions}
            values={form.roles}
          />

          <ToggleGroup
            helper="Elige hasta tres."
            label="¿Qué suele hacer que te quedes?"
            max={3}
            onChange={(values) => update("stayReasons", values)}
            options={stayReasonOptions}
            values={form.stayReasons}
          />

          <ToggleGroup
            helper="Elige hasta tres."
            label="¿Qué suele dificultar la sobremesa?"
            max={3}
            onChange={(values) => update("difficulties", values)}
            options={difficultyOptions}
            values={form.difficulties}
          />

          <ToggleGroup
            helper="Elige hasta dos."
            label="¿Cómo te sueles sentir durante ese tiempo?"
            max={2}
            onChange={(values) => update("feelings", values)}
            options={feelingOptions}
            values={form.feelings}
          />

          <RadioGroup
            label="¿Cómo suele terminar?"
            onChange={(value) => update("ending", value)}
            options={endingOptions}
            value={form.ending}
          />

          {status === "error" ? <p className="form-error">{message}</p> : null}

          <button className="primary-button" disabled={status === "sending"}>
            {status === "sending" ? "Guardando..." : "Enviar respuesta"}
          </button>
        </form>
      </section>
    </main>
  );
}
