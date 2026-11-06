import "server-only";
import type { MentoriaPlan } from "./types";

// Plan for Juan Manuel. Copy, sessions, activities and the study route live here;
// progress, session status, agreements and notes live in Neon (mentoria_state).
// Server only: the profile and mentor prep must never reach the mentee's browser.
export const juan: MentoriaPlan = {
  slug: "juan",
  codeEnv: "MENTORIA_JUAN_CODE",
  mentor: { firstName: "Sebastián", fullName: "Sebastián Gómez Ahumada" },
  mentee: { firstName: "Juan", fullName: "Juan Manuel Martínez" },
  period: "nov 2026 – mar 2027",
  startMonth: "2026-11",
  cadence: "cada 3 semanas los jueves",
  goal: "aplicar a mitad de 2027 para conseguir trabajo hacia final de año",
  coursesNote:
    "Antes de inscribirte, confirma que los cursos de Coursera aparezcan en el programa de Uniandes.",
  profile: [
    {
      dt: "Formación",
      dd: "Ingeniero biomédico, Universidad de los Andes (recién graduado), con opción en Machine Learning",
    },
    {
      dt: "Tesis de pregrado",
      dd: "Dispositivo de tamizaje para endometriosis (tipo prueba de embarazo)",
    },
    {
      dt: "Situación actual",
      dd: "Asistente graduado con Luis Felipe en el proyecto HistoGPT; maestría de ~1 año (Tesis 1 y 2, el resto homologado)",
    },
    { dt: "Intereses", dd: "Machine learning; quiere conocer la industria" },
    {
      dt: "Meta laboral",
      dd: "Trabajar en la industria (al menos 1 año) al terminar la maestría. Empezar a aplicar a mitad de 2027 para posiblemente conseguir trabajo hacia final de año",
    },
    {
      dt: "Consideraciones",
      dd: "Luis Felipe no recomienda trabajar en paralelo a la asistencia",
    },
  ],
  ejes: [
    {
      t: "Fundamentos de ML, nube y programación agéntica",
      d: "Repasar las bases de machine learning y aprender a trabajar con la nube y con herramientas como Claude Code, que hoy son parte del día a día de un ingeniero de ML.",
      out: "Badges y certificados de la ruta de estudio",
    },
    {
      t: "LinkedIn y networking",
      d: "Tu perfil es la primera impresión para reclutadores y contactos. Lo vamos a dejar sólido y vas a empezar a conversar con gente que ya trabaja en la industria.",
      out: "Perfil completo y 2–3 conversaciones con profesionales",
    },
    {
      t: "Hoja de vida",
      d: "Muchas empresas filtran hojas de vida con sistemas automáticos (ATS). Le vamos a dar un formato que pase esos filtros y que cuente logros, no solo funciones.",
      out: "Hoja de vida ATS y una versión ajustada a una oferta real",
    },
    {
      t: "Portafolio",
      d: "Mostrar lo que sabes hacer: código organizado en GitHub y una página web personal con tu tesis, tus proyectos y tus certificaciones.",
      out: "GitHub con README y primera versión de tu página web",
    },
    {
      t: "Proyecto personal en producción",
      d: "Un proyecto pequeño pero desplegado, que demuestre que puedes llevar un modelo más allá de tu computador, sin gastar plata.",
      out: "Proyecto desplegado y documentado en tu portafolio",
    },
    {
      t: "Entrevistas y plan de búsqueda",
      d: "Practicar con procesos reales antes de que cuenten y dejar listo el cronograma para empezar a aplicar a mitad de 2027.",
      out: "Simulacro de entrevista y cronograma de búsqueda",
    },
  ],
  sessions: [
    {
      id: "s1",
      date: "jue 5 nov 2026",
      iso: "2026-11-05",
      foco: "Sesión inicial: conocernos y definir el enfoque",
      agenda: [
        "Conocernos y contar la historia de cada uno",
        "Situación actual: asistencia graduada y maestría",
        "Enfoque de la mentoría: LinkedIn, hoja de vida, portafolio, proyectos y networking",
        "Frecuencia y forma de trabajo",
      ],
      mentorBrings: ["Mi portafolio y GitHub como ejemplo"],
      menteeBringsShort: ["Preguntas e intereses"],
      menteeBrings: [
        {
          t: "Preguntas e intereses",
          d: "Lo que quieras saber de la industria o de la mentoría.",
        },
      ],
    },
    {
      id: "s2",
      date: "jue 26 nov 2026",
      iso: "2026-11-26",
      foco: "LinkedIn + diagnóstico de brechas en ML",
      agenda: [
        "Revisar el LinkedIn en vivo y ajustarlo (20 min)",
        "Revisar las ofertas: qué piden y qué brechas hay (20 min)",
        "Presentar la ruta de estudio y ajustarla a las brechas (15 min)",
        "Tareas para la próxima sesión (5 min)",
      ],
      mentorBrings: [
        "Checklist de un buen perfil de LinkedIn",
        "2–3 perfiles de referencia de ML / FDE",
        "La ruta de estudio",
      ],
      menteeBringsShort: [
        "Perfil de LinkedIn actualizado",
        "8–10 ofertas de ML junior / FDE con los requisitos que más se repiten y cuáles ya cumple",
        "Cuentas creadas en AWS Educate, Databricks Academy y Anthropic Academy",
      ],
      menteeBrings: [
        {
          t: "Perfil de LinkedIn actualizado",
          d: "Foto profesional, banner, un titular corto (por ejemplo, “Ingeniero biomédico · Machine Learning”), un “Acerca de” de 3–4 líneas, educación, la tesis como proyecto y la experiencia que tengas. No tiene que estar perfecto: lo ajustamos juntos.",
        },
        {
          t: "8–10 ofertas analizadas",
          d: "Busca en LinkedIn, Computrabajo, elempleo y empresas remotas ofertas de ML Engineer junior, Data Scientist junior o Forward Deployed Engineer. En una tabla anota para cada una: empresa, cargo, requisitos técnicos, años de experiencia, idioma y cuáles cumples hoy. Al final marca los 5 requisitos que más se repiten.",
        },
        {
          t: "Cuentas creadas",
          d: "Regístrate en AWS Educate, Databricks Academy y Anthropic Academy. Si alcanzas, empieza Machine Learning Foundations en AWS Educate.",
        },
      ],
    },
    {
      id: "s3",
      date: "jue 17 dic 2026",
      iso: "2026-12-17",
      foco: "Hoja de vida ATS + definir proyecto personal",
      agenda: [
        "Qué es un ATS y cómo escribir logros en vez de funciones (15 min)",
        "Revisar su hoja de vida actual (15 min)",
        "Por qué importa lo que llega a producción (10 min)",
        "Escoger el proyecto personal a partir del inventario (15 min)",
        "Plan para vacaciones (5 min)",
      ],
      mentorBrings: [
        "Plantilla de hoja de vida compatible con ATS y un ejemplo",
        "2–3 ideas de proyecto personal con despliegue gratuito",
      ],
      menteeBringsShort: [
        "Hoja de vida actual",
        "Inventario de proyectos: tesis, opción en ML, cursos",
        "Badges de la fase 1 (AWS Educate, Databricks, Claude Code in Action)",
      ],
      menteeBrings: [
        {
          t: "Tu hoja de vida actual",
          d: "La que tengas hoy, en PDF o Word, sin arreglarla antes. Así vemos el punto de partida.",
        },
        {
          t: "Inventario de proyectos",
          d: "Una lista de todo lo que has hecho: tesis, proyectos de la opción en ML, trabajos de clase, monitorías o cursos. Para cada uno: qué problema resolvía, qué hiciste tú, con qué herramientas y si el código está disponible.",
        },
        {
          t: "Badges de la fase 1",
          d: "AWS Educate ML Foundations, Databricks Generative AI y AI Agent Fundamentals, y Claude Code in Action, ya publicados en tu LinkedIn.",
        },
      ],
    },
    {
      id: "s4",
      date: "jue 14 ene 2027",
      iso: "2027-01-14",
      foco: "Portafolio: GitHub + networking",
      agenda: [
        "Revisar la hoja de vida en formato ATS (15 min)",
        "Revisar el repo publicado y su README (15 min)",
        "Networking: cómo pedir una conversación y qué preguntar (15 min)",
        "Definir alcance del proyecto personal y tareas (15 min)",
      ],
      mentorBrings: [
        "2–3 contactos para presentarle (ML, FDE, salud digital)",
        "Un mensaje modelo para pedir una conversación",
        "Mi repo como ejemplo de README",
      ],
      menteeBringsShort: [
        "Hoja de vida en formato ATS",
        "Repo de la tesis u opción en ML publicado con README",
        "Curso 1 de la ML Specialization",
        "Borrador del alcance del proyecto personal",
      ],
      menteeBrings: [
        {
          t: "Hoja de vida en formato ATS",
          d: "Rehecha con la plantilla que te comparto: una sola columna, sin tablas ni imágenes, secciones estándar y logros con resultados concretos.",
        },
        {
          t: "Un repo publicado en GitHub",
          d: "El código de la tesis o de un proyecto de la opción en ML, con un README que explique el problema, cómo correrlo y los resultados. Revisa que no tenga datos sensibles ni nada confidencial.",
        },
        {
          t: "Curso 1 de la ML Specialization",
          d: "Supervised Machine Learning: Regression and Classification, terminado o casi.",
        },
        {
          t: "Alcance del proyecto personal",
          d: "Media página: qué problema resuelve, qué datos usa, qué modelo, cómo lo vas a desplegar gratis y qué vas a mostrar al final.",
        },
      ],
    },
    {
      id: "s5",
      date: "jue 4 feb 2027",
      iso: "2027-02-04",
      foco: "Página web + avance del proyecto personal",
      agenda: [
        "Revisar la página web (15 min)",
        "Demo del avance del proyecto (20 min)",
        "Qué aprendió de las conversaciones informativas (15 min)",
        "Escoger ofertas para practicar (10 min)",
      ],
      mentorBrings: [
        "Checklist para revisar el portafolio",
        "2–3 ofertas reales para aplicar como práctica",
      ],
      menteeBringsShort: [
        "Primera versión de la página web",
        "Avance del proyecto personal",
        "Notas de 1–2 conversaciones informativas",
        "Curso 2 de la ML Specialization",
      ],
      menteeBrings: [
        {
          t: "Primera versión de tu página web",
          d: "Puede ser con GitHub Pages o una plantilla gratuita. Mínimo: quién eres, tu stack, tus proyectos con enlaces, certificaciones y cómo contactarte.",
        },
        {
          t: "Avance del proyecto personal",
          d: "Algo que funcione, aunque sea en tu computador, listo para mostrar en una demo de 5 minutos.",
        },
        {
          t: "Notas de tus conversaciones",
          d: "Para cada conversación informativa: con quién hablaste, qué hace, qué te recomendó y qué te sorprendió.",
        },
        {
          t: "Curso 2 de la ML Specialization",
          d: "Advanced Learning Algorithms, terminado o casi.",
        },
      ],
    },
    {
      id: "s6",
      date: "jue 25 feb 2027",
      iso: "2027-02-25",
      foco: "Fogueo: ofertas y simulacro de entrevista",
      agenda: [
        "Cómo le fue aplicando (10 min)",
        "Simulacro de entrevista técnica y de FDE: explicar el proyecto como a un cliente (30 min)",
        "Feedback (10 min)",
        "Cómo manejar nervios, rechazo y espera (10 min)",
      ],
      mentorBrings: [
        "Preguntas de entrevista según la oferta escogida",
        "Rúbrica corta para el feedback",
      ],
      menteeBringsShort: [
        "La oferta escogida para el simulacro",
        "2–3 aplicaciones de práctica enviadas",
        "Proyecto desplegado",
        "ML Specialization terminada",
      ],
      menteeBrings: [
        {
          t: "Una oferta para el simulacro",
          d: "Una oferta real que te interese de verdad, con el enlace o la descripción completa. Con ella armo las preguntas.",
        },
        {
          t: "2–3 aplicaciones de práctica",
          d: "Enviadas, con una nota de cómo fue cada proceso: formularios, pruebas y respuestas.",
        },
        {
          t: "Proyecto desplegado",
          d: "Con un enlace o un endpoint que se pueda probar, y su README.",
        },
        {
          t: "ML Specialization terminada",
          d: "Los 3 cursos con su certificado.",
        },
      ],
    },
    {
      id: "s7",
      date: "jue 18 mar 2027",
      iso: "2027-03-18",
      foco: "Cierre y plan de búsqueda jun–jul 2027",
      agenda: [
        "Repaso de avances frente a los 6 objetivos (15 min)",
        "Primeros 90 días en un trabajo: expectativas y priorización (15 min)",
        "Cronograma de búsqueda para mitad de 2027, cuadrado con Tesis 2 (20 min)",
        "Cómo seguimos en contacto (10 min)",
      ],
      mentorBrings: ["Propuesta de checklist para la búsqueda de 2027"],
      menteeBringsShort: [
        "Portafolio completo (LinkedIn, hoja de vida, GitHub, web)",
        "Curso de la fase 3",
        "Borrador del cronograma de búsqueda",
      ],
      menteeBrings: [
        {
          t: "Portafolio completo",
          d: "LinkedIn, hoja de vida, GitHub y página web actualizados con todo lo de estos meses.",
        },
        {
          t: "Curso de la fase 3",
          d: "ML in Production o Generative AI with LLMs, terminado o en curso.",
        },
        {
          t: "Borrador del cronograma de búsqueda",
          d: "Mes a mes, de abril a diciembre de 2027: cuándo actualizar tus materiales, a qué empresas apuntar y cuándo empezar a aplicar, cuadrado con Tesis 2.",
        },
      ],
    },
  ],
  between: [
    {
      after: "s1",
      when: "6 – 25 nov",
      mentee: [
        "Actualizar LinkedIn",
        "Analizar 8–10 ofertas",
        "Crear cuentas y empezar AWS Educate",
      ],
      mentor: [
        "Enviar el plan y la ruta de estudio",
        "Preparar checklist y perfiles de referencia de LinkedIn",
      ],
    },
    {
      after: "s2",
      when: "27 nov – 16 dic",
      mentee: [
        "Aplicar el feedback de LinkedIn y conectar con 10–15 profesionales",
        "Terminar los badges de la fase 1",
        "Armar el inventario de proyectos",
      ],
      mentor: [
        "Preparar plantilla de hoja de vida ATS",
        "Pensar 2–3 ideas de proyecto personal",
      ],
    },
    {
      after: "s3",
      when: "18 dic – 13 ene · vacaciones",
      mentee: [
        "Sin reuniones. Si hay tiempo: rehacer la hoja de vida en formato ATS, organizar el repo de la tesis y empezar el curso 1 de la ML Specialization",
      ],
      mentor: ["Identificar 2–3 contactos para presentarle"],
    },
    {
      after: "s4",
      when: "15 ene – 3 feb",
      mentee: [
        "1–2 conversaciones informativas",
        "Primera versión de la página web",
        "Avanzar el proyecto y el curso 2",
        "Empezar la bitácora de la maestría",
      ],
      mentor: ["Hacer las presentaciones por WhatsApp o LinkedIn"],
    },
    {
      after: "s5",
      when: "5 – 24 feb",
      mentee: [
        "Aplicar a 2–3 ofertas de práctica",
        "Desplegar el proyecto",
        "Terminar la ML Specialization",
      ],
      mentor: ["Preparar el simulacro según la oferta escogida"],
    },
    {
      after: "s6",
      when: "26 feb – 17 mar",
      mentee: [
        "Curso de la fase 3",
        "Pulir el portafolio",
        "Borrador del cronograma de búsqueda",
      ],
      mentor: ["Preparar el checklist de búsqueda para 2027"],
    },
  ],
  objectives: [
    {
      n: 1,
      t: "Reforzar fundamentos de ML, nube y programación agéntica, y entender qué hace hoy un ingeniero de ML / Forward Deployed Engineer",
      items: [
        {
          id: "a01",
          t: "Charla: qué hace hoy un ingeniero de ML, el rol de Forward Deployed Engineer (código + cliente) y cómo la IA cambió el día a día",
          tipo: "Saber qué",
          owner: "mentor",
          when: "Nov",
        },
        {
          id: "a02",
          t: "Buscar 8–10 ofertas de ML junior / FDE (Colombia y remotas), anotar los requisitos que más se repiten y marcar cuáles ya cumple",
          tipo: "Saber cómo",
          owner: "mentee",
          when: "Nov",
        },
        {
          id: "a03",
          t: "Presentar la ruta de estudio y ajustarla según las brechas encontradas en las ofertas",
          tipo: "Saber qué",
          owner: "mentor",
          when: "Nov",
        },
        {
          id: "a04",
          t: "Fase 1: badges rápidos (AWS Educate, Databricks, Claude Code in Action)",
          tipo: "Saber cómo",
          owner: "mentee",
          when: "Nov – Dic",
        },
        {
          id: "a05",
          t: "Fase 2: Machine Learning Specialization e Introduction to Agent Skills",
          tipo: "Saber qué",
          owner: "mentee",
          when: "Dic – Feb",
        },
        {
          id: "a06",
          t: "Fase 3: un curso de producción o GenAI según el proyecto personal",
          tipo: "Saber cómo",
          owner: "mentee",
          when: "Feb – Mar",
        },
      ],
    },
    {
      n: 2,
      t: "Construir un perfil de LinkedIn sólido y empezar a hacer networking",
      items: [
        {
          id: "a07",
          t: "Sesión dedicada a LinkedIn: foto, banner, titular, “Acerca de” corto, experiencia, proyectos y certificaciones",
          tipo: "Saber qué",
          owner: "mentor",
          when: "Nov",
        },
        {
          id: "a08",
          t: "Actualizar el perfil con el feedback y empezar a conectar con profesionales de ML y salud digital",
          tipo: "Saber cómo",
          owner: "mentee",
          when: "Nov – Dic",
        },
        {
          id: "a09",
          t: "Hacer 2–3 conversaciones informativas con profesionales que presente el mentor",
          tipo: "Saber cómo",
          owner: "mentee",
          when: "Ene – Feb",
        },
        {
          id: "a10",
          t: "Cómo pedir una conversación, qué preguntar y cómo mantener el contacto sin ser intenso",
          tipo: "Saber ser",
          owner: "mentor",
          when: "Ene",
        },
      ],
    },
    {
      n: 3,
      t: "Tener una hoja de vida en formato compatible con filtros automáticos (ATS)",
      items: [
        {
          id: "a11",
          t: "Qué es un ATS, qué estructura pasa los filtros y cómo escribir logros en vez de funciones",
          tipo: "Saber qué",
          owner: "mentor",
          when: "Dic",
        },
        {
          id: "a12",
          t: "Rehacer la hoja de vida en formato ATS (tesis, opción en ML, asistencia graduada) y una versión ajustada a una oferta real",
          tipo: "Saber cómo",
          owner: "mentee",
          when: "Dic – Ene",
        },
      ],
    },
    {
      n: 4,
      t: "Armar un portafolio: GitHub organizado y página web personal",
      items: [
        {
          id: "a13",
          t: "Mostrar mi portafolio y GitHub como ejemplo: qué incluir y cómo documentar un repo",
          tipo: "Saber qué",
          owner: "mentor",
          when: "Nov",
        },
        {
          id: "a14",
          t: "Organizar y publicar en GitHub el código de la tesis o de la opción en ML con un README claro",
          tipo: "Saber cómo",
          owner: "mentee",
          when: "Dic – Ene",
        },
        {
          id: "a15",
          t: "Llevar una bitácora de lo que haga en la maestría (proyectos, herramientas, resultados) sin publicar nada confidencial",
          tipo: "Saber cómo",
          owner: "mentee",
          when: "Ene – Mar",
        },
        {
          id: "a16",
          t: "Crear una primera versión de la página web personal (stack, experiencia, proyectos, certificaciones)",
          tipo: "Saber cómo",
          owner: "mentee",
          when: "Ene – Feb",
        },
      ],
    },
    {
      n: 5,
      t: "Desarrollar un proyecto personal con enfoque de producción, a bajo costo",
      items: [
        {
          id: "a17",
          t: "Por qué las empresas valoran lo que llega a producción y cómo no salir de la maestría “sobrecalificado sin experiencia”",
          tipo: "Saber ser",
          owner: "mentor",
          when: "Dic",
        },
        {
          id: "a18",
          t: "Escoger un problema real y definir el proyecto: modelo + API + despliegue en capa gratuita de la nube",
          tipo: "Saber cómo",
          owner: "ambos",
          when: "Dic – Ene",
        },
        {
          id: "a19",
          t: "Construir, desplegar y documentar el proyecto, y agregarlo al portafolio",
          tipo: "Saber cómo",
          owner: "mentee",
          when: "Ene – Mar",
        },
      ],
    },
    {
      n: 6,
      t: "Foguearse con ofertas y entrevistas, y dejar listo el plan de búsqueda para junio–julio de 2027",
      items: [
        {
          id: "a20",
          t: "Aplicar a 2–3 ofertas reales como práctica para conocer los procesos",
          tipo: "Saber cómo",
          owner: "mentee",
          when: "Feb",
        },
        {
          id: "a21",
          t: "Simulacro de entrevista técnica y de FDE (explicar un proyecto a un “cliente”) con feedback",
          tipo: "Saber cómo",
          owner: "ambos",
          when: "Feb – Mar",
        },
        {
          id: "a22",
          t: "Cómo manejar los nervios, el rechazo y la espera; cómo fue mi propio proceso",
          tipo: "Saber ser",
          owner: "mentor",
          when: "Feb – Mar",
        },
        {
          id: "a23",
          t: "Sesión de cierre: revisar avances y armar el cronograma de búsqueda para mitad de 2027",
          tipo: "Saber cómo",
          owner: "ambos",
          when: "Mar",
        },
      ],
    },
  ],
  phases: [
    {
      t: "Fase 1",
      when: "Nov – Dic",
      items: [
        {
          id: "c01",
          t: "Machine Learning Foundations",
          plat: "AWS Educate",
          d: "Fundamentos de ML y pipeline de ML en la nube",
          url: "https://aws.amazon.com/educate",
        },
        {
          id: "c02",
          t: "Generative AI Fundamentals",
          plat: "Databricks Academy",
          d: "Conceptos de IA generativa (badge)",
          url: "https://www.databricks.com/certification",
        },
        {
          id: "c03",
          t: "AI Agent Fundamentals",
          plat: "Databricks Academy",
          d: "Conceptos de agentes de IA (badge)",
          url: "https://www.databricks.com/certification",
        },
        {
          id: "c04",
          t: "Claude Code in Action",
          plat: "Anthropic Academy",
          d: "Programación agéntica: contexto, edición de código, GitHub",
          url: "https://anthropic.skilljar.com",
        },
      ],
    },
    {
      t: "Fase 2",
      when: "Dic – Feb",
      items: [
        {
          id: "c05",
          t: "Machine Learning Specialization",
          plat: "Coursera · DeepLearning.AI + Stanford",
          d: "3 cursos de fundamentos, ~95 h (~10 semanas a 5 h/semana)",
          url: "https://www.coursera.org/specializations/machine-learning-introduction",
        },
        {
          id: "c06",
          t: "Introduction to Agent Skills",
          plat: "Anthropic Academy",
          d: "Instrucciones reutilizables y comandos personalizados en Claude Code",
          url: "https://anthropic.skilljar.com",
        },
      ],
    },
    {
      t: "Fase 3",
      when: "Feb – Mar · elegir uno",
      items: [
        {
          id: "c07",
          t: "Introduction to ML in Production",
          plat: "Coursera · DeepLearning.AI",
          d: "Ciclo de vida de un proyecto de ML en producción",
          url: "https://www.coursera.org/learn/introduction-to-machine-learning-in-production",
        },
        {
          id: "c08",
          t: "Generative AI with LLMs",
          plat: "Coursera · DeepLearning.AI + AWS",
          d: "Entrenamiento, fine-tuning y despliegue de LLMs con laboratorios en AWS",
          url: "https://www.coursera.org/learn/generative-ai-with-llms",
        },
        {
          id: "c09",
          t: "Introduction to Model Context Protocol",
          plat: "Anthropic Academy · opcional",
          d: "Construir servidores MCP para extender Claude Code",
          url: "https://anthropic.skilljar.com",
        },
      ],
    },
  ],
};
