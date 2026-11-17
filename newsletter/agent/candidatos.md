# Tarea: candidatos de la edición

Lee primero `newsletter/agent/ESTILO.md` y `CLAUDE.md`.

Disparo: programado (`CRON_TZ=America/Bogota 0 9 1,15 * *`). Resultado: un issue `Edición NNNN — candidatos` con 6–8 papers para que Sebastián elija 3–4, y un correo avisándole. En esta tarea no escribes código ni haces commits.

```bash
R=repos/gomez2608/personal-portfolio
git fetch origin && git checkout master && git pull --ff-only origin master
TODAY=$(TZ=America/Bogota date +%F)
```

## 1. Número de edición y edición abierta

1. Números ya usados, de dos fuentes:
   - archivos: `ls newsletter/issues/*.json` → `0007.json` cuenta como 7 (ignora `.gitkeep`);
   - issues con la etiqueta `newsletter`, abiertos y cerrados:
     ```bash
     gh api --paginate "$R/issues?labels=newsletter&state=all&per_page=100" \
       --jq '.[] | select(.pull_request == null) | [.number, .state, .title] | @tsv'
     ```
     De cada título que sea exactamente `Edición <dígitos> — candidatos`, el número de edición son esos dígitos.
   - **N = el mayor de todos + 1.** Si no hay ninguno (ni archivos ni issues), N = 1. El campo `issue` de los `post.json` no cuenta: el post de muestra `mezcla-de-expertos` es un borrador con `issue: 1` y no reserva ningún número.
2. Edición abierta: por cada issue `newsletter` con `state` = `open`, mira si su edición M ya tiene un PR mergeado:
   ```bash
   gh api "$R/pulls?state=closed&head=gomez2608:edicion-MMMM" --jq '[.[] | select(.merged_at != null)] | length'
   ```
   Si da `0` (o el título no sigue el patrón y no puedes saber M), la edición sigue abierta. Comenta en ese issue exactamente:
   ```bash
   gh api --method POST "$R/issues/<número>/comments" -f body='Nueva ventana de candidatos disponible; esta edición sigue abierta'
   ```
   Ve al paso 5 con el asunto "Boletín: la edición MMMM sigue abierta" y el enlace del issue, y termina. No crees un issue nuevo.
3. Comprueba que existe la etiqueta: `gh api "$R/labels/newsletter"`. Si da 404, no la crees: ve al paso 5 con el asunto "Boletín: falta la etiqueta newsletter" y termina.

## 2. Investigar

Ventana: los 15 días que terminan en `$TODAY`. Un candidato entra si su primera versión pública (v1 en arXiv, o la fecha de publicación del laboratorio) cae en la ventana.

Fuentes, en este orden de peso:
- **Hugging Face daily papers**: `https://huggingface.co/papers?date=YYYY-MM-DD`, un día a la vez por toda la ventana. Es la mejor señal de qué se está leyendo.
- **arXiv** cs.AI, cs.CL, cs.LG y cs.CV: `https://arxiv.org/list/<cat>/recent`, o la API: `https://export.arxiv.org/api/query?search_query=cat:cs.CL&sortBy=submittedDate&sortOrder=descending&max_results=200`.
- **Papers with Code trending**: `https://paperswithcode.com`. Si redirige a `https://huggingface.co/papers/trending`, usa esa página.
- **Blogs de investigación de los grandes laboratorios** (Google DeepMind, Google Research, Anthropic, OpenAI, Meta AI, Microsoft Research, Apple Machine Learning Research, Allen Institute for AI): solo entradas que acompañan un paper o informe técnico con autores y fecha.
- Sitios de noticias: solo como señal de qué se discute, nunca como fuente.

Descarta:
- lo ya cubierto: `jq -r '.paper.url' app/blog/*/post.json`. Compara por ID de arXiv, sin versión (`2501.01234v2` = `2501.01234`) y sin importar si es `abs`, `pdf` o `html`; para otras URLs, por la página canónica;
- productos, lanzamientos de modelos sin una técnica nueva detrás, financiación y noticias de empresas;
- mejoras puras de benchmark y resultados solo matemáticos;
- lo que no tenga una fuente primaria con título, autores, fecha y URL estable (el post las necesita en `paper`).

Lee el resumen de cada candidato y verifica su URL, título y autores (ESTILO §5). Busca variedad: como máximo 2 candidatos del mismo tema.

## 3. Elegir 6–8 candidatos

Puntaje "¿lo entiende un curioso sin formación?":
- **5**: se explica con una metáfora cotidiana y un diagrama de 3–4 cajas; el lector sale con una idea nueva.
- **4**: necesita 1–2 conceptos previos que se glosan en una frase.
- **3**: necesita varios conceptos previos; se puede, con cuidado.
- **2**: lo interesante está en detalles técnicos o matemáticos.
- **1**: solo tiene sentido para especialistas.

Propón 6–8, con puntaje ≥3, ordenados de mayor a menor puntaje. Si no llegas a 6 con puntaje ≥3, completa con los mejores de puntaje 2 y dilo en la primera línea del issue. Si tienes menos de 3 candidatos verificados (URL responde `200`, título y autores coinciden), no crees el issue: ve al paso 5 con el asunto "Boletín: no encontré candidatos suficientes", explica qué fuentes fallaron y termina. Nunca rellenes con papers o URLs que no verificaste. Todo en español, sin hype, y solo con lo que dice el resumen: nada de resultados que no aparezcan ahí.

## 4. Crear el issue

Escribe el cuerpo en `/tmp/candidatos-NNNN.md` con este formato exacto (la tarea `borradores` lee las casillas por el marcador `**C<n> · `):

```markdown
Marca 3–4 y añade la etiqueta `aprobado`.

Ventana: YYYY-MM-DD a YYYY-MM-DD. Si quieres otro ángulo para alguno, escríbelo en un comentario antes de añadir la etiqueta.

- [ ] **C1 · <título exacto del paper>**
  - Enlace: <URL canónica>
  - Resumen: <2 líneas en español>
  - Por qué importa: <1–2 frases>
  - ¿Lo entiende un curioso sin formación?: <n>/5. <una frase de por qué>
  - Ángulo: <la pregunta que responde el post y la metáfora cotidiana>
  - Clip: <qué muestran el clip 1 (la idea general) y el clip 2 (el mecanismo), en cajas, flechas y datos que se mueven>
- [ ] **C2 · …**
```

```bash
gh api --method POST "$R/issues" -f title="Edición NNNN — candidatos" \
  -F body=@/tmp/candidatos-NNNN.md -f 'labels[]=newsletter' --jq '.html_url'
```

El título lleva raya (—), no guion. Guarda la `html_url` para el correo.

## 5. Avisar a Sebastián

Con el conector de Gmail, escribe a la dirección de Sebastián configurada en el conector:
- asunto: "Boletín NNNN: candidatos listos" (o el asunto que indique el paso donde paraste);
- cuerpo: el enlace del issue, cuántos candidatos hay y "Marca 3–4 y añade la etiqueta `aprobado`". Si paraste antes, explica por qué en dos frases.

Si el conector no está disponible, comenta en el issue, si hay uno (`POST $R/issues/<número>/comments`), "No pude enviar el correo: el conector de Gmail no está disponible." y termina.
